import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Database, initializeDatabase } from './db.js';
import { connectMongoDB, isMongoConnected, getMongoUri, MongoModels } from './mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_PASSKEY || 'robin123';

// Real-Time Server-Sent Events (SSE) Client Registry
const sseClients = new Set();

export function broadcastEvent(eventType, payload = {}) {
  const dataString = `data: ${JSON.stringify({ type: eventType, payload, timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(dataString);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Initialize MongoDB Connection on server launch
connectMongoDB().then(() => {
  initializeDatabase();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

// Ensure MongoDB connection is active for every incoming request
app.use(async (req, res, next) => {
  try {
    if (!isMongoConnected()) {
      await connectMongoDB();
    }
  } catch (err) {
    // Non-blocking
  }
  next();
});

// Global body parser error handler
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({
      success: false,
      error: 'PAYLOAD_TOO_LARGE',
      message: 'The submitted payload is too large. Maximum payload size is 50MB.'
    });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'Malformed JSON payload: ' + err.message
    });
  }
  next(err);
});

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/events/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (res.flushHeaders) res.flushHeaders();

  const client = { res, id: Date.now() + Math.random() };
  sseClients.add(client);

  // Send initial authoritative state immediately upon connection
  try {
    const state = await Database.getEventState();
    res.write(`data: ${JSON.stringify({ type: 'INIT_STATE', payload: state, timestamp: Date.now() })}\n\n`);
  } catch (e) {}

  // Keep-alive heartbeat every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch (e) {
      clearInterval(heartbeat);
      sseClients.delete(client);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(client);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION MIDDLEWARES
// ─────────────────────────────────────────────────────────────────────────────
async function participantAuth(req, res, next) {
  const token = req.headers['x-participant-token'] || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);
  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing participant authentication token.' });
  }

  const participant = await Database.getParticipantByToken(token);
  if (!participant) {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Participant token expired or invalid.' });
  }

  req.participant = participant;
  next();
}

function adminAuth(req, res, next) {
  const adminToken = req.headers['x-admin-token'] || req.headers['admin-secret'];
  if (!adminToken || adminToken !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin authorization required.' });
  }
  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC / EVENT APIS (DIRECT MONGODB ATLAS)
// ─────────────────────────────────────────────────────────────────────────────

// Event state & synchronized server clock
app.get('/api/event/status', async (req, res) => {
  try {
    const state = await Database.getEventState();
    res.json({
      success: true,
      eventState: state
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Event session details endpoint
app.get('/api/event/session', async (req, res) => {
  try {
    const state = await Database.getEventState();
    res.json({
      success: true,
      active_session: state.active_session,
      status: state.status,
      eventState: state
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Legacy status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const state = await Database.getEventState();
    res.json({
      status: state.status,
      system: 'LATVERIA-NET INTRUSION',
      uplink: 'STABLE',
      serverTime: Date.now(),
      eventState: state
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Participant registration (Sign Up)
app.post('/api/participant/register', async (req, res) => {
  try {
    const { teamName, teamPassword, passcode } = req.body;
    if (!teamName || !String(teamName).trim()) {
      return res.status(400).json({ error: 'MISSING_NAME', message: 'Team callsign is required.' });
    }

    const pass = teamPassword || passcode || '';
    const participant = await Database.registerParticipant(teamName, pass);
    const eventState = await Database.getEventState(participant.id);

    broadcastEvent('PARTICIPANT_REGISTERED', { teamName: participant.teamName });

    res.json({
      success: true,
      participant: {
        id: participant.id,
        teamName: participant.teamName,
        token: participant.token
      },
      eventState
    });
  } catch (err) {
    res.status(400).json({ error: 'REGISTRATION_FAILED', message: err.message });
  }
});

// Participant login (Re-Enter Mission & Resume State)
const handleParticipantLogin = async (req, res) => {
  try {
    const { teamName, teamPassword, passcode } = req.body;
    if (!teamName || !String(teamName).trim()) {
      return res.status(400).json({ error: 'MISSING_NAME', message: 'Team callsign is required.' });
    }

    const pass = teamPassword || passcode || '';
    const participant = await Database.loginParticipant(teamName, pass);
    const eventState = await Database.getEventState(participant.id);

    res.json({
      success: true,
      participant: {
        id: participant.id,
        teamName: participant.teamName,
        token: participant.token
      },
      eventState
    });
  } catch (err) {
    res.status(400).json({ error: 'LOGIN_FAILED', message: err.message });
  }
};

app.post('/api/participant/login', handleParticipantLogin);
app.post('/api/participant/re-enter', handleParticipantLogin);

// Auth login alias
app.post('/api/auth/login', async (req, res) => {
  const { teamName, teamPassword, passcode, token } = req.body;
  if (token) {
    const participant = await Database.getParticipantByToken(token);
    if (participant) {
      const eventState = await Database.getEventState(participant.id);
      return res.json({
        success: true,
        participant: {
          id: participant.id,
          teamName: participant.teamName,
          token: participant.token
        },
        eventState
      });
    }
  }

  if (teamName) {
    try {
      const pass = teamPassword || passcode || '';
      const participant = await Database.registerParticipant(teamName, pass);
      const eventState = await Database.getEventState(participant.id);
      broadcastEvent('PARTICIPANT_REGISTERED', { teamName: participant.teamName });
      return res.json({
        success: true,
        participant: {
          id: participant.id,
          teamName: participant.teamName,
          token: participant.token
        },
        eventState
      });
    } catch (err) {
      return res.status(400).json({ error: 'LOGIN_FAILED', message: err.message });
    }
  }

  return res.status(400).json({ error: 'MISSING_CREDENTIALS', message: 'teamName or token is required.' });
});

// Participant profile endpoint
app.get('/api/participant/profile', participantAuth, async (req, res) => {
  try {
    const participant = req.participant;
    const progress = await Database.getAdminProgress();
    const stats = progress.participants.find((p) => p.id === participant.id) || {};
    res.json({
      success: true,
      participant: {
        id: participant.id,
        teamName: participant.teamName
      },
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restore participant profile & state — single source of truth for the frontend
app.get('/api/participant/state', participantAuth, async (req, res) => {
  try {
    const participant = req.participant;
    const eventState = await Database.getEventState(participant.id);
    const sessionNum = eventState.active_session || 1;

    const isSessionActive = eventState.status === 'SESSION_1_ACTIVE' || eventState.status === 'SESSION_2_ACTIVE';
    const currentQuestions = isSessionActive
      ? await Database.getParticipantQuestionsForSession(participant.id, sessionNum)
      : [];

    const hints = await Database.getParticipantHints(participant.id);
    const sessionStats = await Database.getParticipantSessionStats(participant.id);

    res.json({
      success: true,
      participant: {
        id: participant.id,
        teamName: participant.teamName
      },
      eventState,
      sessionNumber: sessionNum,
      questions: currentQuestions,
      hintsUsed: hints,
      sessionStats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Register-or-Login unified endpoint
app.post('/api/participant/join', async (req, res) => {
  try {
    const { teamName, passcode, teamPassword } = req.body;
    if (!teamName || !String(teamName).trim()) {
      return res.status(400).json({ error: 'MISSING_NAME', message: 'Team callsign is required.' });
    }
    const pass = teamPassword || passcode || '';
    let participant;
    try {
      participant = await Database.registerParticipant(teamName, pass);
      broadcastEvent('PARTICIPANT_REGISTERED', { teamName: participant.teamName });
    } catch (registerErr) {
      try {
        participant = await Database.loginParticipant(teamName, pass);
      } catch (loginErr) {
        return res.status(401).json({ error: 'AUTH_FAILED', message: loginErr.message });
      }
    }
    const eventState = await Database.getEventState(participant.id);
    return res.json({
      success: true,
      participant: { id: participant.id, teamName: participant.teamName, token: participant.token },
      eventState
    });
  } catch (err) {
    return res.status(400).json({ error: 'JOIN_FAILED', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SESSION & QUESTION APIS
// ─────────────────────────────────────────────────────────────────────────────

// Start participant session (starts individual countdown timer)
const handleStartSession = async (req, res) => {
  try {
    const sessionNum = parseInt(req.params.sessionNum, 10) || 1;
    const eventState = await Database.startParticipantSession(req.participant.id, sessionNum);
    broadcastEvent('PARTICIPANT_STARTED_SESSION', { participantId: req.participant.id, teamName: req.participant.teamName, sessionNum });
    res.json({
      success: true,
      sessionNumber: sessionNum,
      eventState
    });
  } catch (err) {
    res.status(400).json({ error: 'START_FAILED', message: err.message });
  }
};

app.post('/api/session/:sessionNum/start', participantAuth, handleStartSession);
app.post('/api/session/start', participantAuth, handleStartSession);

// Get questions for active session (Sanitized)
app.get('/api/session/:sessionNum/questions', participantAuth, async (req, res) => {
  try {
    const sessionNum = parseInt(req.params.sessionNum, 10);
    const eventState = await Database.getEventState(req.participant.id);

    if (sessionNum === 1 && eventState.status !== 'SESSION_1_ACTIVE') {
      return res.status(403).json({
        error: 'SESSION_LOCKED',
        message: 'Session 1 is currently locked by the Game Master.',
        eventState
      });
    }

    if (sessionNum === 2 && eventState.status !== 'SESSION_2_ACTIVE') {
      return res.status(403).json({
        error: 'SESSION_LOCKED',
        message: 'Session 2 is currently locked by the Game Master.',
        eventState
      });
    }

    const questions = await Database.getParticipantQuestionsForSession(req.participant.id, sessionNum);
    res.json({
      success: true,
      sessionNumber: sessionNum,
      questions,
      serverTime: Date.now()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submit answer
const handleAnswerSubmission = async (req, res) => {
  const sessionNum = parseInt(req.params.sessionNum, 10);
  const { questionId, answer } = req.body;
  const eventState = await Database.getEventState(req.participant.id);

  if (!questionId || answer === undefined) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'questionId and answer are required.' });
  }

  if (sessionNum === 1 && eventState.status !== 'SESSION_1_ACTIVE') {
    return res.status(403).json({ error: 'SESSION_LOCKED', message: 'Session 1 is no longer active.' });
  }

  if (sessionNum === 2 && eventState.status !== 'SESSION_2_ACTIVE') {
    return res.status(403).json({ error: 'SESSION_LOCKED', message: 'Session 2 is no longer active.' });
  }

  try {
    const result = await Database.submitAnswer(req.participant.id, questionId, sessionNum, answer);
    if (result.isCorrect) {
      broadcastEvent('LEADERBOARD_UPDATED', { participantId: req.participant.id });
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'SUBMISSION_FAILED', message: err.message });
  }
};

app.post('/api/session/:sessionNum/answer', participantAuth, handleAnswerSubmission);
app.post('/api/session/:sessionNum/submit', participantAuth, handleAnswerSubmission);

// Record hint usage
const handleHintEndpoint = async (req, res) => {
  const { questionId, hintIdx, penalty } = req.body;
  if (!questionId || hintIdx === undefined) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'questionId and hintIdx are required.' });
  }
  try {
    const hintResult = await Database.recordHintUsage(req.participant.id, questionId, hintIdx, penalty);
    res.json({
      success: true,
      ...hintResult
    });
  } catch (err) {
    res.status(400).json({ error: 'HINT_LOG_FAILED', message: err.message });
  }
};

app.post('/api/session/:sessionNum/hint', participantAuth, handleHintEndpoint);
app.post('/api/session/hint', participantAuth, handleHintEndpoint);

// Complete session
app.post('/api/session/:sessionNum/complete', participantAuth, async (req, res) => {
  const sessionNum = parseInt(req.params.sessionNum, 10);
  try {
    const sessionSummary = await Database.completeSession(req.participant.id, sessionNum);
    broadcastEvent('LEADERBOARD_UPDATED', { participantId: req.participant.id });
    res.json({
      success: true,
      sessionSummary
    });
  } catch (err) {
    res.status(400).json({ error: 'COMPLETION_FAILED', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LEADERBOARD API
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [leaderboard, eventState] = await Promise.all([
      Database.getLeaderboard(),
      Database.getEventState()
    ]);
    res.json({
      success: true,
      eventState,
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN APIS (DIRECT MONGODB ATLAS)
// ─────────────────────────────────────────────────────────────────────────────

// Admin passkey login
app.post('/api/admin/login', async (req, res) => {
  const { passkey } = req.body;
  if (passkey === ADMIN_SECRET) {
    const eventState = await Database.getEventState();
    return res.json({
      success: true,
      adminToken: ADMIN_SECRET,
      eventState
    });
  } else {
    return res.status(401).json({ error: 'INVALID_PASSKEY', message: 'Incorrect Doctor Doom Admin Passkey.' });
  }
});

// Change event state (OPEN SESSION 1, LOCK SESSION 1, OPEN SESSION 2, etc.)
app.post('/api/admin/event/state', adminAuth, async (req, res) => {
  const { status, durationMinutes } = req.body;
  try {
    const updatedState = await Database.updateEventState(status, { durationMinutes });
    broadcastEvent('EVENT_STATE_CHANGED', updatedState);
    res.json({
      success: true,
      eventState: updatedState
    });
  } catch (err) {
    res.status(400).json({ error: 'STATE_TRANSITION_FAILED', message: err.message });
  }
});

// Real-time Dynamic Timer Control (+1m, +5m, +10m, -1m, pause, resume, set duration)
app.post('/api/admin/event/adjust-time', adminAuth, async (req, res) => {
  const { minutes, durationMinutes, action } = req.body;
  try {
    const updatedState = await Database.adjustEventTime({ minutes, durationMinutes, action });
    broadcastEvent('TIMER_ADJUSTED', updatedState);
    res.json({
      success: true,
      eventState: updatedState
    });
  } catch (err) {
    res.status(400).json({ error: 'TIMER_ADJUST_FAILED', message: err.message });
  }
});

// Admin Session Open (Session 1 or 2)
app.post('/api/admin/session/open', adminAuth, async (req, res) => {
  const { session = 1, durationMinutes } = req.body;
  const targetStatus = Number(session) === 2 ? 'SESSION_2_ACTIVE' : 'SESSION_1_ACTIVE';
  try {
    const updatedState = await Database.updateEventState(targetStatus, { durationMinutes, resetTimer: true });
    const assignedCount = await Database.ensureAllParticipantsAssigned();

    broadcastEvent('SESSION_OPENED', { session: Number(session), eventState: updatedState });

    res.json({
      success: true,
      sessionOpened: Number(session),
      eventState: updatedState,
      participantsAssigned: assignedCount
    });
  } catch (err) {
    res.status(400).json({ error: 'OPEN_SESSION_FAILED', message: err.message });
  }
});

// Admin Session Lock (Session 1 or 2)
app.post('/api/admin/session/lock', adminAuth, async (req, res) => {
  const { session = 1 } = req.body;
  const targetStatus = Number(session) === 2 ? 'SESSION_2_LOCKED' : 'SESSION_1_LOCKED';
  try {
    const updatedState = await Database.updateEventState(targetStatus);
    broadcastEvent('SESSION_LOCKED', { session: Number(session), eventState: updatedState });
    res.json({
      success: true,
      sessionLocked: Number(session),
      eventState: updatedState
    });
  } catch (err) {
    res.status(400).json({ error: 'LOCK_SESSION_FAILED', message: err.message });
  }
});

// Reset entire competition
app.post('/api/admin/event/reset', adminAuth, async (req, res) => {
  try {
    const resetState = await Database.resetCompetition();
    broadcastEvent('EVENT_RESET', resetState);
    res.json({
      success: true,
      message: 'Competition reset successfully.',
      eventState: resetState
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get real-time participant progress tracker
app.get('/api/admin/progress', adminAuth, async (req, res) => {
  try {
    const progressData = await Database.getAdminProgress();
    res.json({
      success: true,
      ...progressData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get participants list & credentials
app.get('/api/admin/participants', adminAuth, async (req, res) => {
  try {
    const progressData = await Database.getAdminProgress();
    res.json({
      success: true,
      totalParticipants: progressData.totalParticipants,
      participants: progressData.participants
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Create Participant Credentials
const handleAdminCreateParticipant = async (req, res) => {
  try {
    const { teamName, teamPassword, passcode } = req.body;
    const pass = teamPassword || passcode || '';
    const participant = await Database.createParticipantCredentials(teamName, pass);
    broadcastEvent('PARTICIPANT_REGISTERED', { teamName: participant.teamName });
    res.json({
      success: true,
      participant: {
        id: participant.id,
        teamName: participant.teamName,
        teamPassword: participant.teamPassword,
        token: participant.token,
        registeredAt: participant.registeredAt
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'CREATION_FAILED', message: err.message });
  }
};

app.post('/api/admin/participant/create', adminAuth, handleAdminCreateParticipant);
app.post('/api/admin/participants/create', adminAuth, handleAdminCreateParticipant);

// Admin Update Participant Password
const handleAdminUpdateParticipant = async (req, res) => {
  try {
    const { participantId, teamPassword, passcode } = req.body;
    const pass = teamPassword || passcode || '';
    const updated = await Database.updateParticipantCredentials(participantId, pass);
    res.json({
      success: true,
      participant: {
        id: updated.id,
        teamName: updated.teamName,
        teamPassword: updated.teamPassword
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'UPDATE_FAILED', message: err.message });
  }
};

app.post('/api/admin/participant/update', adminAuth, handleAdminUpdateParticipant);
app.post('/api/admin/participants/update', adminAuth, handleAdminUpdateParticipant);

// Admin Delete Participant Credentials
const handleAdminDeleteParticipant = async (req, res) => {
  try {
    const deleted = await Database.deleteParticipant(req.params.id);
    broadcastEvent('LEADERBOARD_UPDATED', {});
    res.json({
      success: deleted
    });
  } catch (err) {
    res.status(400).json({ error: 'DELETE_FAILED', message: err.message });
  }
};

app.delete('/api/admin/participant/:id', adminAuth, handleAdminDeleteParticipant);
app.delete('/api/admin/participants/:id', adminAuth, handleAdminDeleteParticipant);

// Admin Leaderboard
app.get('/api/admin/leaderboard', adminAuth, async (req, res) => {
  try {
    const [leaderboard, eventState] = await Promise.all([
      Database.getLeaderboard(),
      Database.getEventState()
    ]);
    res.json({
      success: true,
      eventState,
      leaderboard
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Question Bank CRUD
app.get('/api/admin/questions', adminAuth, async (req, res) => {
  try {
    const questions = await Database.getAllQuestions(true);
    res.json({
      success: true,
      questions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/questions', adminAuth, async (req, res) => {
  try {
    const newQuestion = await Database.addQuestion(req.body);
    res.json({
      success: true,
      question: newQuestion
    });
  } catch (err) {
    res.status(400).json({ error: 'CREATION_FAILED', message: err.message });
  }
});

// Bulk Import Questions via JSON
app.post('/api/admin/questions/bulk-import', adminAuth, async (req, res) => {
  const questions = Array.isArray(req.body) ? req.body : (req.body?.questions || []);
  try {
    const imported = await Database.bulkImportQuestions(questions);
    res.json({
      success: true,
      count: imported.length,
      questions: imported
    });
  } catch (err) {
    res.status(400).json({ error: 'IMPORT_FAILED', message: err.message });
  }
});

app.put('/api/admin/questions/:id', adminAuth, async (req, res) => {
  try {
    const updated = await Database.updateQuestion(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Question not found.' });
    }
    res.json({
      success: true,
      question: updated
    });
  } catch (err) {
    res.status(400).json({ error: 'UPDATE_FAILED', message: err.message });
  }
});

app.delete('/api/admin/questions/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await Database.deleteQuestion(req.params.id);
    res.json({
      success: deleted
    });
  } catch (err) {
    res.status(400).json({ error: 'DELETE_FAILED', message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE & MONGODB CLUSTER STATUS
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/admin/db/status', adminAuth, async (req, res) => {
  try {
    const isConnected = isMongoConnected();
    const [questionsCount, participantsCount, answersCount, sessionsCount, eventState] = await Promise.all([
      MongoModels.Question.countDocuments(),
      MongoModels.Participant.countDocuments(),
      MongoModels.Answer.countDocuments(),
      MongoModels.ParticipantSession.countDocuments(),
      MongoModels.EventState.findOne({}).lean()
    ]);

    res.json({
      success: true,
      mongoConnected: isConnected,
      mongoUri: getMongoUri(),
      stats: {
        questionsCount,
        participantsCount,
        answersCount,
        sessionsCount,
        eventStatus: eventState?.status || 'N/A'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ASSETS & SINGLE PAGE APP ROUTING
// ─────────────────────────────────────────────────────────────────────────────
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'ENDPOINT_NOT_FOUND', message: 'API route does not exist.' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    try {
      if (!process.env.VERCEL) {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(path.join(dataDir, '.backend_port'), String(port), 'utf8');
      }
    } catch (e) {}
    console.log(`\n[DOOM-OS SERVER] Express backend running on http://127.0.0.1:${port}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[DOOM-OS SERVER] Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[DOOM-OS SERVER] Server error:', err);
    }
  });
}

// Only start HTTP listener locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  startServer(DEFAULT_PORT);
}

export default app;
