import { MongoModels, connectMongoDB, isMongoConnected } from './mongo.js';
import { DEFAULT_20_QUESTIONS } from './defaultQuestions.js';

// Ensure MongoDB is connected before any query
async function ensureDb() {
  if (!isMongoConnected()) {
    await connectMongoDB();
  }
}

// Ensure questions and default state exist in MongoDB Atlas
export async function initializeDatabase() {
  await ensureDb();
  try {
    console.log(`[DB] Seeding/Syncing default questions into MongoDB Atlas (${DEFAULT_20_QUESTIONS.length} questions)...`);
    const ops = DEFAULT_20_QUESTIONS.map((q) => ({
      updateOne: { filter: { id: q.id }, update: { $set: q }, upsert: true }
    }));
    await MongoModels.Question.bulkWrite(ops);
    console.log('[DB] ✅ Default questions synced successfully.');

    const stateCount = await MongoModels.EventState.countDocuments();
    if (stateCount === 0) {
      await MongoModels.EventState.create({
        status: 'CLOSED',
        active_session: 0,
        session1_started_at: null,
        session1_locked_at: null,
        session2_started_at: null,
        session2_locked_at: null,
        event_finished_at: null,
        session_duration_minutes: 60,
        timer_paused: false,
        timer_paused_at: null,
        time_adjustment_seconds: 0
      });
    }
  } catch (err) {
    console.warn('[DB] Notice during initialization:', err.message);
  }
}

export const Database = {
  // --- EVENT STATE ---
  async getEventState(participantId = null) {
    await ensureDb();
    let state = await MongoModels.EventState.findOne({}).lean();
    if (!state) {
      state = await MongoModels.EventState.create({
        status: 'CLOSED',
        active_session: 0,
        session1_started_at: null,
        session1_locked_at: null,
        session2_started_at: null,
        session2_locked_at: null,
        event_finished_at: null,
        session_duration_minutes: 60,
        timer_paused: false,
        timer_paused_at: null,
        time_adjustment_seconds: 0
      });
      state = state.toObject ? state.toObject() : state;
    }

    const now = Date.now();
    const activeSession = state.active_session || (state.status?.startsWith('SESSION_2') ? 2 : (state.status?.startsWith('SESSION_1') ? 1 : 0));
    const durationMinutes = state.session_duration_minutes || 60;
    const timeAdjustmentSec = state.time_adjustment_seconds || 0;

    let startedAt = null;
    let participantStarted = false;
    let timerOnHold = true;
    let participantHintPenaltySec = 0;
    let participantWrongPenaltySec = 0;

    const isSessionActive = state.status === 'SESSION_1_ACTIVE' || state.status === 'SESSION_2_ACTIVE';

    if (participantId && activeSession) {
      try {
        const sessionKey = activeSession === 1 ? 'session1' : 'session2';
        const pSession = await MongoModels.ParticipantSession.findOne({ participantId }).lean();
        
        if (pSession && pSession[sessionKey]?.startedAt) {
          startedAt = pSession[sessionKey].startedAt;
          participantStarted = true;
          timerOnHold = false;
        } else {
          // Timer on hold until participant explicitly starts
          startedAt = null;
          participantStarted = false;
          timerOnHold = isSessionActive;
        }

        // Hints penalty only reduces timer for this specific participant
        const [hints, assignments] = await Promise.all([
          MongoModels.HintUsed.find({ participantId }).lean(),
          MongoModels.QuestionAssignment.find({ participantId, sessionNumber: activeSession }).lean()
        ]);
        const sessionQIds = new Set((assignments || []).map(a => a.questionId));
        participantHintPenaltySec = (hints || [])
          .filter(h => sessionQIds.has(h.questionId))
          .reduce((sum, h) => sum + (Number(h.penalty) || 20), 0);
      } catch (e) {
        participantHintPenaltySec = 0;
      }
    } else {
      startedAt = activeSession ? state[`session${activeSession}_started_at`] : null;
      participantStarted = Boolean(startedAt);
      timerOnHold = !startedAt && isSessionActive;
    }

    // Hint penalties deduct timer countdown only for this participant
    const totalDeductionSec = participantHintPenaltySec;
    const baseAllowedSec = Math.max(0, (durationMinutes * 60) + timeAdjustmentSec - totalDeductionSec);

    let sessionRemainingSec = baseAllowedSec;
    let isExpired = false;

    if (startedAt && isSessionActive) {
      const effectiveNow = (state.timer_paused && state.timer_paused_at) ? state.timer_paused_at : now;
      const elapsedSec = Math.max(0, Math.floor((effectiveNow - startedAt) / 1000));
      sessionRemainingSec = Math.max(0, baseAllowedSec - elapsedSec);
      if (sessionRemainingSec <= 0) {
        isExpired = true;
      }
    } else {
      sessionRemainingSec = baseAllowedSec;
    }

    const sessionStartTime = startedAt || null;
    const sessionEndTime = startedAt ? (startedAt + (baseAllowedSec * 1000)) : null;

    return {
      ...state,
      active_session: activeSession,
      session_start_time: sessionStartTime,
      session_end_time: sessionEndTime,
      session_duration_minutes: durationMinutes,
      session_remaining_seconds: sessionRemainingSec,
      participant_hint_penalty_seconds: participantHintPenaltySec,
      participant_wrong_penalty_seconds: participantWrongPenaltySec,
      participant_started: participantStarted,
      timer_on_hold: timerOnHold,
      is_expired: isExpired,
      server_time: now
    };
  },

  async updateEventState(newStatus, options = {}) {
    await ensureDb();
    const current = await MongoModels.EventState.findOne({}).lean() || {};
    const now = Date.now();
    let nextState = { ...current };

    if (options.durationMinutes) {
      nextState.session_duration_minutes = Number(options.durationMinutes) || 30;
    }

    const durationMs = (nextState.session_duration_minutes || 30) * 60 * 1000;

    switch (newStatus) {
      case 'CLOSED':
        nextState.status = 'CLOSED';
        nextState.active_session = 0;
        break;

      case 'SESSION_1_ACTIVE': {
        const isExpired = current.session1_started_at && (now - current.session1_started_at > durationMs);
        const shouldStartFresh = !current.session1_started_at || isExpired || options.resetTimer || current.status === 'CLOSED';
        nextState.status = 'SESSION_1_ACTIVE';
        nextState.active_session = 1;
        nextState.session1_started_at = shouldStartFresh ? now : current.session1_started_at;
        nextState.session1_locked_at = null;
        nextState.timer_paused = false;
        nextState.timer_paused_at = null;
        nextState.time_adjustment_seconds = shouldStartFresh ? 0 : (current.time_adjustment_seconds || 0);

        if (shouldStartFresh) {
          await MongoModels.ParticipantSession.updateMany({}, {
            $set: {
              'session1.startedAt': null,
              'session1.completedAt': null,
              'session1.completed': false
            }
          });
        }
        break;
      }

      case 'SESSION_1_LOCKED':
        nextState.status = 'SESSION_1_LOCKED';
        nextState.active_session = 1;
        nextState.session1_locked_at = now;
        break;

      case 'SESSION_2_ACTIVE': {
        const isExpired = current.session2_started_at && (now - current.session2_started_at > durationMs);
        const shouldStartFresh = !current.session2_started_at || isExpired || options.resetTimer || current.status === 'SESSION_1_LOCKED' || current.status === 'CLOSED';
        nextState.status = 'SESSION_2_ACTIVE';
        nextState.active_session = 2;
        nextState.session2_started_at = shouldStartFresh ? now : current.session2_started_at;
        nextState.session2_locked_at = null;
        nextState.timer_paused = false;
        nextState.timer_paused_at = null;
        nextState.time_adjustment_seconds = shouldStartFresh ? 0 : (current.time_adjustment_seconds || 0);

        if (shouldStartFresh) {
          await MongoModels.ParticipantSession.updateMany({}, {
            $set: {
              'session2.startedAt': null,
              'session2.completedAt': null,
              'session2.completed': false
            }
          });
        }
        break;
      }

      case 'SESSION_2_LOCKED':
        nextState.status = 'SESSION_2_LOCKED';
        nextState.active_session = 2;
        nextState.session2_locked_at = now;
        break;

      case 'EVENT_FINISHED':
        nextState.status = 'EVENT_FINISHED';
        nextState.event_finished_at = now;
        break;

      default:
        throw new Error(`Invalid event status transition: ${newStatus}`);
    }

    const { _id, __v, createdAt, updatedAt, ...cleanNextState } = nextState;
    await MongoModels.EventState.findOneAndUpdate({}, { $set: cleanNextState }, { upsert: true, returnDocument: 'after' });
    return this.getEventState();
  },

  async adjustEventTime({ minutes, durationMinutes, action } = {}) {
    await ensureDb();
    const current = await MongoModels.EventState.findOne({}).lean() || {};
    let nextState = { ...current };

    if (action === 'pause') {
      nextState.timer_paused = true;
      nextState.timer_paused_at = Date.now();
    } else if (action === 'resume') {
      if (nextState.timer_paused && nextState.timer_paused_at) {
        const pausedDurationMs = Date.now() - nextState.timer_paused_at;
        const activeSess = nextState.active_session || 1;
        if (nextState[`session${activeSess}_started_at`]) {
          nextState[`session${activeSess}_started_at`] += pausedDurationMs;
        }
        const sessionKey = activeSess === 1 ? 'session1' : 'session2';
        await MongoModels.ParticipantSession.updateMany(
          { [`${sessionKey}.startedAt`]: { $ne: null } },
          { $inc: { [`${sessionKey}.startedAt`]: pausedDurationMs } }
        );
      }
      nextState.timer_paused = false;
      nextState.timer_paused_at = null;
    }

    if (durationMinutes !== undefined && durationMinutes !== null) {
      nextState.session_duration_minutes = Math.max(1, parseInt(durationMinutes, 10) || 30);
    }

    if (minutes !== undefined && minutes !== null && minutes !== 0) {
      const deltaMs = Number(minutes) * 60 * 1000;
      const activeSess = nextState.active_session || 1;
      const sessionKey = activeSess === 1 ? 'session1' : 'session2';
      if (nextState[`session${activeSess}_started_at`]) {
        nextState[`session${activeSess}_started_at`] += deltaMs;
      } else {
        nextState.session_duration_minutes = Math.max(1, (nextState.session_duration_minutes || 30) + Number(minutes));
      }
      await MongoModels.ParticipantSession.updateMany(
        { [`${sessionKey}.startedAt`]: { $ne: null } },
        { $inc: { [`${sessionKey}.startedAt`]: deltaMs } }
      );
    }

    const { _id, __v, createdAt, updatedAt, ...cleanAdjustedState } = nextState;
    await MongoModels.EventState.findOneAndUpdate({}, { $set: cleanAdjustedState }, { upsert: true, returnDocument: 'after' });
    return this.getEventState();
  },

  async resetCompetition() {
    await ensureDb();
    const resetState = {
      status: 'CLOSED',
      active_session: 0,
      session1_started_at: null,
      session1_locked_at: null,
      session2_started_at: null,
      session2_locked_at: null,
      event_finished_at: null,
      session_duration_minutes: 60,
      timer_paused: false,
      timer_paused_at: null,
      time_adjustment_seconds: 0
    };

    await Promise.all([
      MongoModels.EventState.findOneAndUpdate({}, { $set: resetState }, { upsert: true, returnDocument: 'after' }),
      MongoModels.Participant.deleteMany({}),
      MongoModels.QuestionAssignment.deleteMany({}),
      MongoModels.Answer.deleteMany({}),
      MongoModels.ParticipantSession.deleteMany({}),
      MongoModels.HintUsed.deleteMany({})
    ]);

    return this.getEventState();
  },

  // --- QUESTIONS BANK ---
  async getAllQuestions(includeSecrets = false) {
    await ensureDb();
    const questions = await MongoModels.Question.find({}).sort({ order: 1, id: 1 }).lean();
    if (includeSecrets) return questions;
    return questions.map(({ keywords, answer, ...rest }) => rest);
  },

  async getQuestionById(id, includeSecrets = false) {
    await ensureDb();
    const q = await MongoModels.Question.findOne({ $or: [{ id }, { originalId: id }] }).lean();
    if (!q) return null;
    if (includeSecrets) return q;
    const { keywords, answer, ...rest } = q;
    return rest;
  },

  async addQuestion(questionData) {
    await ensureDb();
    const count = await MongoModels.Question.countDocuments();
    const newId = questionData.id || `Q${String(count + 1).padStart(2, '0')}`;
    const newQ = {
      ...questionData,
      id: newId,
      enabled: questionData.enabled !== undefined ? questionData.enabled : true,
      keywords: questionData.keywords || []
    };
    await MongoModels.Question.findOneAndUpdate({ id: newQ.id }, { $set: newQ }, { upsert: true, returnDocument: 'after' });
    return newQ;
  },

  async bulkImportQuestions(questionsList) {
    await ensureDb();
    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      throw new Error('Expected a non-empty array of question objects.');
    }

    const count = await MongoModels.Question.countDocuments();
    const imported = [];
    const ops = [];

    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      if (!q.title && !q.question) {
        throw new Error(`Item ${i + 1} is missing both 'title' and 'question' fields.`);
      }

      const qId = q.id || `Q${String(count + i + 1).padStart(2, '0')}`;
      const parsedKeywords = Array.isArray(q.keywords)
        ? q.keywords.map(k => String(k).trim().toUpperCase()).filter(Boolean)
        : (q.keywords ? String(q.keywords).split(',').map(k => k.trim().toUpperCase()).filter(Boolean) : []);

      const finalAnswer = q.answer || parsedKeywords[0] || '';
      if (finalAnswer && !parsedKeywords.includes(finalAnswer.toUpperCase())) {
        parsedKeywords.unshift(finalAnswer.toUpperCase());
      }

      const normalizedQ = {
        id: qId,
        title: q.title || 'Challenge Room',
        subtitle: q.subtitle || 'System Protocol',
        category: q.category || 'Computer Systems',
        difficulty: q.difficulty || 'Medium',
        enabled: q.enabled !== undefined ? Boolean(q.enabled) : true,
        investigationType: q.investigationType || 'code',
        story: Array.isArray(q.story) ? q.story : [String(q.story || 'Classified intel.')],
        codeLines: Array.isArray(q.codeLines) ? q.codeLines : (q.codeLines ? String(q.codeLines).split('\n') : []),
        question: q.question || q.title || 'Examine the telemetry and identify the key.',
        answer: finalAnswer,
        hints: Array.isArray(q.hints) && q.hints.length > 0 ? q.hints : [
          { text: 'Analyze the system telemetry carefully.', penalty: 20 },
          { text: 'Consider fundamental computer science principles.', penalty: 40 }
        ],
        fragment: q.fragment || (count + i + 1),
        evidenceTitle: q.evidenceTitle || `${q.title || 'Security'} Evidence Log`,
        consequence: Array.isArray(q.consequence) ? q.consequence : ['PROTOCOL OVERRIDDEN', 'Access granted.'],
        keywords: parsedKeywords
      };

      ops.push({
        updateOne: { filter: { id: normalizedQ.id }, update: { $set: normalizedQ }, upsert: true }
      });
      imported.push(normalizedQ);
    }

    if (ops.length > 0) {
      await MongoModels.Question.bulkWrite(ops);
    }
    return imported;
  },

  async updateQuestion(id, patch) {
    await ensureDb();
    const updated = await MongoModels.Question.findOneAndUpdate(
      { id },
      { $set: patch },
      { returnDocument: 'after' }
    ).lean();
    return updated;
  },

  async deleteQuestion(id) {
    await ensureDb();
    const result = await MongoModels.Question.deleteOne({ id });
    return result.deletedCount > 0;
  },

  // --- PARTICIPANTS & CREDENTIALS ---
  async createParticipantCredentials(teamNameRaw, teamPasswordRaw = '') {
    await ensureDb();
    const teamName = String(teamNameRaw || '').trim().toUpperCase();
    const teamPassword = String(teamPasswordRaw || '').trim();
    if (!teamName) throw new Error('Team name is required.');
    if (!teamPassword) throw new Error('Password is required.');

    const existing = await MongoModels.Participant.findOne({ teamName }).lean();
    if (existing) {
      throw new Error(`Team '${teamName}' already exists. Please choose a different team name.`);
    }

    const participantId = `TEAM_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const token = `tok_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

    const participant = {
      id: participantId,
      teamName,
      token,
      passcode: teamPassword,
      registeredAt: Date.now(),
      lastActiveAt: Date.now()
    };

    const sessionRecord = {
      participantId,
      teamName,
      session1: { startedAt: null, completedAt: null, duration: 0, score: 0, answersCount: 0, completed: false },
      session2: { startedAt: null, completedAt: null, duration: 0, score: 0, answersCount: 0, completed: false },
      totalScore: 0,
      totalTime: 0
    };

    await Promise.all([
      MongoModels.Participant.create(participant),
      MongoModels.ParticipantSession.create(sessionRecord)
    ]);

    await this.generateRandomQuestionsForParticipant(participantId);
    return { ...participant, teamPassword };
  },

  async updateParticipantCredentials(participantId, newTeamPasswordRaw) {
    await ensureDb();
    const newPassword = String(newTeamPasswordRaw || '').trim();
    if (!newPassword) throw new Error('New password cannot be empty.');

    const updated = await MongoModels.Participant.findOneAndUpdate(
      { id: participantId },
      { $set: { passcode: newPassword } },
      { returnDocument: 'after' }
    ).lean();

    if (!updated) throw new Error('Participant not found.');
    return { ...updated, teamPassword: updated.passcode };
  },

  async deleteParticipant(participantId) {
    await ensureDb();
    const [pRes] = await Promise.all([
      MongoModels.Participant.deleteOne({ id: participantId }),
      MongoModels.ParticipantSession.deleteOne({ participantId }),
      MongoModels.QuestionAssignment.deleteMany({ participantId }),
      MongoModels.HintUsed.deleteMany({ participantId }),
      MongoModels.Answer.deleteMany({ participantId })
    ]);
    return pRes.deletedCount > 0;
  },

  async registerParticipant(teamNameRaw, teamPasswordRaw = '') {
    return this.createParticipantCredentials(teamNameRaw, teamPasswordRaw);
  },

  async loginParticipant(teamNameRaw, teamPasswordRaw = '') {
    await ensureDb();
    const teamName = String(teamNameRaw || '').trim().toUpperCase();
    const teamPassword = String(teamPasswordRaw || '').trim();
    if (!teamName) throw new Error('Team name is required.');

    const participant = await MongoModels.Participant.findOne({ teamName }).lean();
    if (!participant) {
      throw new Error(`ACCESS DENIED: Team '${teamName}' not found. Please obtain login credentials from the administrator.`);
    }

    if (participant.passcode && participant.passcode !== teamPassword) {
      throw new Error('INCORRECT PASSWORD: Enter the password provided by your event administrator.');
    }

    await MongoModels.Participant.updateOne({ id: participant.id }, { $set: { lastActiveAt: Date.now() } });
    return { ...participant, teamPassword: participant.passcode };
  },

  async getParticipantByToken(token) {
    if (!token) return null;
    await ensureDb();
    const p = await MongoModels.Participant.findOne({ token }).lean();
    return p ? { ...p, teamPassword: p.passcode } : null;
  },

  async getParticipantById(id) {
    if (!id) return null;
    await ensureDb();
    const p = await MongoModels.Participant.findOne({ id }).lean();
    return p ? { ...p, teamPassword: p.passcode } : null;
  },

  // --- QUESTION ASSIGNMENTS ---
  async generateRandomQuestionsForParticipant(participantId) {
    await ensureDb();
    const existing = await MongoModels.QuestionAssignment.find({ participantId }).sort({ questionOrder: 1 }).lean();
    if (existing.length >= 30) {
      return existing;
    }

    const enabledPool = await MongoModels.Question.find({ enabled: { $ne: false } }).lean();
    const pool = enabledPool.length >= 30 ? enabledPool : await MongoModels.Question.find({}).lean();

    // Fisher-Yates Random Shuffle per participant so questions are distinct & randomized
    const shuffledPool = [...pool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    const assignments = [];

    // Session 1: 15 Questions (order 1..15)
    const s1Limit = Math.min(15, Math.ceil(shuffledPool.length / 2));
    for (let i = 0; i < s1Limit; i++) {
      if (shuffledPool[i]) {
        assignments.push({
          assignmentId: `A_${participantId}_S1_${i + 1}`,
          participantId,
          questionId: shuffledPool[i].id,
          sessionNumber: 1,
          questionOrder: i + 1,
          assignedAt: Date.now()
        });
      }
    }

    // Session 2: 15 Questions (order 1..15)
    for (let i = s1Limit; i < Math.min(30, shuffledPool.length); i++) {
      const s2Order = i + 1 - s1Limit;
      if (shuffledPool[i]) {
        assignments.push({
          assignmentId: `A_${participantId}_S2_${s2Order}`,
          participantId,
          questionId: shuffledPool[i].id,
          sessionNumber: 2,
          questionOrder: s2Order,
          assignedAt: Date.now()
        });
      }
    }

    if (assignments.length > 0) {
      const ops = assignments.map((a) => ({
        updateOne: { filter: { assignmentId: a.assignmentId }, update: { $set: a }, upsert: true }
      }));
      await MongoModels.QuestionAssignment.bulkWrite(ops);
    }
    return assignments;
  },

  async ensureAllParticipantsAssigned() {
    await ensureDb();
    const participants = await MongoModels.Participant.find({}).lean();
    let assignedCount = 0;
    for (const p of participants) {
      const count = await MongoModels.QuestionAssignment.countDocuments({ participantId: p.id });
      if (count < 30) {
        await this.generateRandomQuestionsForParticipant(p.id);
        assignedCount++;
      }
    }
    return assignedCount;
  },

  async startParticipantSession(participantId, sessionNumber = 1) {
    await ensureDb();
    const sessionKey = sessionNumber === 1 ? 'session1' : 'session2';
    const now = Date.now();
    let pSession = await MongoModels.ParticipantSession.findOne({ participantId }).lean();
    if (!pSession) {
      const p = await MongoModels.Participant.findOne({ id: participantId }).lean();
      pSession = await MongoModels.ParticipantSession.create({
        participantId,
        teamName: p?.teamName || '',
        session1: { startedAt: null, completedAt: null, duration: 0, score: 0, answersCount: 0, completed: false },
        session2: { startedAt: null, completedAt: null, duration: 0, score: 0, answersCount: 0, completed: false },
        totalScore: 0,
        totalTime: 0
      });
    }

    if (!pSession[sessionKey]?.startedAt) {
      await MongoModels.ParticipantSession.updateOne(
        { participantId },
        {
          $set: {
            [`${sessionKey}.startedAt`]: now,
            [`${sessionKey}.status`]: 'ACTIVE'
          }
        }
      );
    }

    return this.getEventState(participantId);
  },

  async getParticipantQuestionsForSession(participantId, sessionNumber) {
    await ensureDb();
    let assignments = await MongoModels.QuestionAssignment.find({ participantId, sessionNumber })
      .sort({ questionOrder: 1 })
      .lean();

    if (!assignments || assignments.length < 15) {
      await this.generateRandomQuestionsForParticipant(participantId);
      assignments = await MongoModels.QuestionAssignment.find({ participantId, sessionNumber })
        .sort({ questionOrder: 1 })
        .lean();
    }

    const questionIds = assignments.map(a => a.questionId);
    const [questions, answers, hints] = await Promise.all([
      MongoModels.Question.find({ id: { $in: questionIds } }).lean(),
      MongoModels.Answer.find({ participantId, questionId: { $in: questionIds } }).lean(),
      MongoModels.HintUsed.find({ participantId, questionId: { $in: questionIds } }).lean()
    ]);

    const qMap = new Map();
    questions.forEach(q => qMap.set(q.id, q));
    const answersByQ = new Map();
    answers.forEach(a => {
      if (!answersByQ.has(a.questionId)) answersByQ.set(a.questionId, []);
      answersByQ.get(a.questionId).push(a);
    });
    const hintsByQ = new Map();
    hints.forEach(h => {
      if (!hintsByQ.has(h.questionId)) hintsByQ.set(h.questionId, []);
      hintsByQ.get(h.questionId).push(h);
    });

    return assignments.map((assign) => {
      const fullQ = qMap.get(assign.questionId);
      if (!fullQ) return null;

      const qAns = answersByQ.get(assign.questionId) || [];
      const qHints = hintsByQ.get(assign.questionId) || [];
      const isSolved = qAns.some(a => a.isCorrect);
      const wrongCount = qAns.filter(a => !a.isCorrect).length;
      const attemptsUsed = isSolved ? (wrongCount + 1) : wrongCount;
      const attemptsRemaining = isSolved ? 0 : null;
      const isLocked = false;

      // Base 20 pts, Hint 1 => -3, Hint 2 => -8, Hint 3 => 0 pts, Wrong (>2) => -2 each
      let potentialPoints = 20;
      if (qHints.length >= 3) {
        potentialPoints = 0;
      } else if (qHints.length === 2) {
        potentialPoints = 12; // 20 - 8
      } else if (qHints.length === 1) {
        potentialPoints = 17; // 20 - 3
      }
      const penalizedWrongs = Math.max(0, wrongCount - 2);
      potentialPoints = qHints.length >= 3 ? 0 : Math.max(0, potentialPoints - (penalizedWrongs * 2));

      const levelNumber = sessionNumber === 1 ? assign.questionOrder : (assign.questionOrder + 15);
      const formattedLevelStr = String(levelNumber).padStart(2, '0');
      const rawTitle = fullQ.title || '';
      const cleanTitle = rawTitle.replace(/^(ROOM|CHAMBER|STAGE|LEVEL|SECTOR)\s*\d+[:\-—\s]*/i, '').trim();
      const dynamicTitle = `ROOM ${formattedLevelStr}: ${cleanTitle}`;

      const rawQuestionStr = fullQ.question || '';
      const cleanQuestionStr = rawQuestionStr.replace(/^(ROOM|CHAMBER|STAGE|LEVEL|SECTOR)\s*\d+[:\-—\s]*/i, '').trim();

      // Dynamically adapt story paragraphs to show this participant's assigned room/chamber number
      const dynamicStory = (fullQ.story || []).map((para) => {
        if (typeof para !== 'string') return para;
        return para
          .replace(/(CHAMBER|ROOM|STAGE|LEVEL|SECTOR)\s*\d+/gi, `$1 ${formattedLevelStr}`)
          .replace(/(Chamber|Room|Stage|Level|Sector)\s*\d+/g, `$1 ${formattedLevelStr}`);
      });

      const dynamicEvidenceTitle = fullQ.evidenceTitle
        ? fullQ.evidenceTitle.replace(/(ROOM|CHAMBER|STAGE|LEVEL|SECTOR)\s*\d+/gi, `$1 ${formattedLevelStr}`)
        : `Room ${formattedLevelStr} Evidence Fragment`;

      return {
        assignmentId: assign.assignmentId,
        order: assign.questionOrder,
        levelNumber,
        id: fullQ.id,
        key: `q_${fullQ.id.toLowerCase()}`,
        title: dynamicTitle,
        name: dynamicTitle,
        cleanTitle,
        subtitle: fullQ.subtitle,
        category: fullQ.category,
        difficulty: fullQ.difficulty,
        investigationType: fullQ.investigationType,
        story: dynamicStory,
        codeLines: fullQ.codeLines,
        question: cleanQuestionStr || fullQ.question,
        hints: fullQ.hints,
        fragment: levelNumber,
        evidenceTitle: dynamicEvidenceTitle,
        consequence: fullQ.consequence,
        isSolved,
        attemptsUsed,
        attemptsRemaining,
        wrongCount,
        isLocked,
        potentialPoints
      };
    }).filter(Boolean);
  },

  // --- ANSWERS & SCORING ---
  async submitAnswer(participantId, questionId, sessionNumber, rawAnswer) {
    await ensureDb();
    const [participant, question, eventStateDoc] = await Promise.all([
      MongoModels.Participant.findOne({ id: participantId }).lean(),
      MongoModels.Question.findOne({ $or: [{ id: questionId }, { originalId: questionId }] }).lean(),
      MongoModels.EventState.findOne({}).lean()
    ]);

    if (!participant) throw new Error('Participant not found.');
    if (!question) throw new Error('Question not found.');

    const expectedStatus = sessionNumber === 1 ? 'SESSION_1_ACTIVE' : 'SESSION_2_ACTIVE';
    if (!eventStateDoc || eventStateDoc.status !== expectedStatus) {
      throw new Error(`CHAMBER LOCKED: Session ${sessionNumber} is currently not accepting submissions.`);
    }

    // Auto-start participant session on first submission if still on hold
    let participantState = await this.getEventState(participantId);
    if (!participantState.participant_started) {
      participantState = await this.startParticipantSession(participantId, sessionNumber);
    }

    // Check individual participant countdown expiration
    if (participantState.is_expired) {
      throw new Error('COUNTDOWN EXPIRED: Your session timer has ended. Chamber inputs are locked.');
    }

    // Check previous attempts for this question
    const previousAnswers = await MongoModels.Answer.find({
      participantId,
      questionId
    }).sort({ submittedAt: 1 }).lean();

    const isAlreadySolved = previousAnswers.some(a => a.isCorrect);
    if (isAlreadySolved) {
      const correctAns = previousAnswers.find(a => a.isCorrect);
      return {
        success: true,
        isCorrect: true,
        isAlreadySolved: true,
        attemptsRemaining: 0,
        attemptsUsed: previousAnswers.length,
        isLocked: false,
        pointsEarned: correctAns?.pointsEarned || 0,
        message: 'CHAMBER ALREADY BREACHED.'
      };
    }

    const wrongAttempts = previousAnswers.filter(a => !a.isCorrect).length;

    const clean = (val) => String(val || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanInput = clean(rawAnswer);

    const candidateKeywords = [
      ...(Array.isArray(question.keywords) ? question.keywords : []),
      question.answer,
      question.subtitle
    ].filter(Boolean);

    const isCorrect = candidateKeywords.some((kw) => {
      const cleanKw = clean(kw);
      return cleanKw.length > 0 && (cleanInput === cleanKw || cleanInput.includes(cleanKw) || cleanKw.includes(cleanInput));
    });

    const currentAttemptNumber = wrongAttempts + 1;
    const qHints = await MongoModels.HintUsed.find({ participantId, questionId }).lean();

    if (isCorrect) {
      // Base: 20 points
      // Hint 1: -3 points
      // Hint 2: -5 points (cumulative -8)
      // Hint 3: 0 points (direct cipher reveal)
      // Wrong attempts: 2 free attempts, then -2 points per wrong attempt (>2)
      let basePoints = 20;
      let hintNote = '';
      if (qHints.length >= 3) {
        basePoints = 0;
        hintNote = ' (0 PTS — 3 HINTS USED)';
      } else if (qHints.length === 2) {
        basePoints = 12; // 20 - 8
        hintNote = ' (−8 PTS FOR 2 HINTS)';
      } else if (qHints.length === 1) {
        basePoints = 17; // 20 - 3
        hintNote = ' (−3 PTS FOR 1 HINT)';
      }

      const penalizedWrongs = Math.max(0, wrongAttempts - 2);
      const wrongDeduction = penalizedWrongs * 2;
      const finalPointsEarned = qHints.length >= 3 ? 0 : Math.max(0, basePoints - wrongDeduction);

      const answerRecord = {
        answerId: `ANS_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        participantId,
        questionId,
        sessionNumber,
        submittedAnswer: rawAnswer,
        isCorrect: true,
        attemptNumber: currentAttemptNumber,
        pointsEarned: finalPointsEarned,
        submittedAt: Date.now()
      };

      await MongoModels.Answer.create(answerRecord);

      // Update ParticipantSession score
      const sessionKey = sessionNumber === 1 ? 'session1' : 'session2';
      let pSession = await MongoModels.ParticipantSession.findOne({ participantId }).lean();
      if (!pSession) {
        pSession = {
          participantId,
          teamName: participant.teamName,
          session1: { startedAt: null, completedAt: null, duration: 0, score: 0, answersCount: 0, completed: false },
          session2: { startedAt: null, completedAt: null, duration: 0, score: 0, answersCount: 0, completed: false },
          totalScore: 0,
          totalTime: 0
        };
      }

      const sessObj = pSession[sessionKey] || { score: 0, answersCount: 0 };
      sessObj.score = (sessObj.score || 0) + 1; // count of solved rooms
      sessObj.answersCount = (sessObj.answersCount || 0) + 1;

      const s1Score = sessionNumber === 1 ? sessObj.score : (pSession.session1?.score || 0);
      const s2Score = sessionNumber === 2 ? sessObj.score : (pSession.session2?.score || 0);

      await Promise.all([
        MongoModels.ParticipantSession.findOneAndUpdate(
          { participantId },
          {
            $set: {
              [sessionKey]: sessObj,
              totalScore: s1Score + s2Score
            }
          },
          { upsert: true }
        ),
        MongoModels.Participant.updateOne({ id: participantId }, { $set: { lastActiveAt: Date.now() } })
      ]);

      const wrongDetail = wrongDeduction > 0
        ? ` (−${wrongDeduction} PTS FOR ${wrongAttempts} WRONG ATTEMPTS)`
        : (wrongAttempts > 0 ? ` (${wrongAttempts} FREE WRONG ATTEMPT${wrongAttempts > 1 ? 'S' : ''} USED)` : '');

      return {
        success: true,
        isCorrect: true,
        pointsEarned: finalPointsEarned,
        attemptsRemaining: 0,
        attemptsUsed: currentAttemptNumber,
        wrongCount: wrongAttempts,
        isLocked: false,
        hintsUsedOnQuestion: qHints.length,
        fragment: question.fragment,
        evidenceTitle: question.evidenceTitle,
        successNote: `${question.consequence?.[1] || 'Answer verified!'} [${finalPointsEarned} POINTS AWARDED${hintNote}${wrongDetail}]`
      };
    } else {
      // Incorrect answer
      const answerRecord = {
        answerId: `ANS_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        participantId,
        questionId,
        sessionNumber,
        submittedAnswer: rawAnswer,
        isCorrect: false,
        attemptNumber: currentAttemptNumber,
        pointsEarned: 0,
        submittedAt: Date.now()
      };

      await MongoModels.Answer.create(answerRecord);

      const penalizedWrongs = Math.max(0, currentAttemptNumber - 2);
      const penaltyNote = currentAttemptNumber === 1
        ? '1ST WRONG ATTEMPT (1 FREE ATTEMPT LEFT)'
        : currentAttemptNumber === 2
          ? '2ND WRONG ATTEMPT (PENALTIES APPLY ON NEXT WRONG ATTEMPTS)'
          : `−${penalizedWrongs * 2} PTS WRONG PENALTY (−2 PTS PER ATTEMPT AFTER 2)`;

      const message = currentAttemptNumber === 1
        ? 'ACCESS DENIED — Incorrect key. (Attempt 1 of 2 free attempts used)'
        : currentAttemptNumber === 2
          ? 'ACCESS DENIED — Incorrect key. (Attempt 2 of 2 free attempts used. Next wrong attempt deducts 2 pts)'
          : `ACCESS DENIED — Incorrect key. (−2 Points Penalty applied for attempt ${currentAttemptNumber})`;

      return {
        success: false,
        isCorrect: false,
        pointsEarned: 0,
        attemptsRemaining: null,
        attemptsUsed: currentAttemptNumber,
        wrongCount: currentAttemptNumber,
        isLocked: false,
        hintsUsedOnQuestion: qHints.length,
        fragment: null,
        evidenceTitle: null,
        penaltyNote,
        message
      };
    }
  },

  async recordHintUsage(participantId, questionId, hintIdx, penalty = 20) {
    await ensureDb();
    const penaltyNum = Number(penalty) || 20;
    const existing = await MongoModels.HintUsed.findOne({ participantId, questionId, hintIdx }).lean();

    if (!existing) {
      await MongoModels.HintUsed.create({
        participantId,
        questionId,
        hintIdx,
        penalty: penaltyNum,
        usedAt: Date.now()
      });
    }

    const currentState = await this.getEventState(participantId);
    if (!currentState.participant_started) {
      const activeSess = currentState.active_session || 1;
      await this.startParticipantSession(participantId, activeSess);
    }

    const [allHints, state] = await Promise.all([
      MongoModels.HintUsed.find({ participantId }).lean(),
      this.getEventState(participantId)
    ]);

    return {
      hints: allHints,
      penaltyDeducted: penaltyNum,
      participantHintPenaltySeconds: state.participant_hint_penalty_seconds,
      remainingSeconds: state.session_remaining_seconds,
      isExpired: state.is_expired,
      eventState: state
    };
  },

  async getParticipantHints(participantId) {
    await ensureDb();
    return MongoModels.HintUsed.find({ participantId }).lean();
  },

  async getParticipantSessionStats(participantId) {
    await ensureDb();
    const [pSession, answers, assignments] = await Promise.all([
      MongoModels.ParticipantSession.findOne({ participantId }).lean(),
      MongoModels.Answer.find({ participantId, isCorrect: true }).lean(),
      MongoModels.QuestionAssignment.find({ participantId }).lean()
    ]);

    const s1Assignments = (assignments || []).filter(a => a.sessionNumber === 1);
    const s2Assignments = (assignments || []).filter(a => a.sessionNumber === 2);
    const s1SolvedCount = (answers || []).filter(a => s1Assignments.some(x => x.questionId === a.questionId)).length;
    const s2SolvedCount = (answers || []).filter(a => s2Assignments.some(x => x.questionId === a.questionId)).length;

    return {
      ...(pSession || {}),
      session1Completed: s1Assignments.length > 0 && s1SolvedCount >= s1Assignments.length,
      session2Completed: s2Assignments.length > 0 && s2SolvedCount >= s2Assignments.length,
      s1SolvedCount,
      s2SolvedCount,
      s1Total: s1Assignments.length,
      s2Total: s2Assignments.length
    };
  },

  async completeSession(participantId, sessionNumber) {
    await ensureDb();
    const [pSessionDoc, eventStateDoc] = await Promise.all([
      MongoModels.ParticipantSession.findOne({ participantId }).lean(),
      MongoModels.EventState.findOne({}).lean()
    ]);

    if (!pSessionDoc) return null;

    const sessionKey = sessionNumber === 1 ? 'session1' : 'session2';
    const now = Date.now();
    const startedAt = pSessionDoc[sessionKey]?.startedAt || eventStateDoc?.[`session${sessionNumber}_started_at`] || now;
    const duration = Math.max(0, Math.floor((now - startedAt) / 1000));

    const updatedSessionObj = {
      ...(pSessionDoc[sessionKey] || {}),
      completedAt: now,
      duration,
      completed: true
    };

    const s1Dur = sessionNumber === 1 ? duration : (pSessionDoc.session1?.duration || 0);
    const s2Dur = sessionNumber === 2 ? duration : (pSessionDoc.session2?.duration || 0);
    const totalTime = s1Dur + s2Dur;

    const updated = await MongoModels.ParticipantSession.findOneAndUpdate(
      { participantId },
      {
        $set: {
          [sessionKey]: updatedSessionObj,
          totalTime
        }
      },
      { returnDocument: 'after' }
    ).lean();

    return updated;
  },

  // --- LEADERBOARD & ADMIN PROGRESS ---
  async getLeaderboard() {
    await ensureDb();
    const [participants, sessions, allAnswers, hints, assignments] = await Promise.all([
      MongoModels.Participant.find({}).lean(),
      MongoModels.ParticipantSession.find({}).lean(),
      MongoModels.Answer.find({}).lean(),
      MongoModels.HintUsed.find({}).lean(),
      MongoModels.QuestionAssignment.find({}).lean()
    ]);

    const sessionMap = new Map();
    sessions.forEach(s => sessionMap.set(s.participantId, s));

    const hintsMap = new Map();
    hints.forEach(h => {
      if (!hintsMap.has(h.participantId)) hintsMap.set(h.participantId, []);
      hintsMap.get(h.participantId).push(h);
    });

    const answersMap = new Map();
    allAnswers.forEach(a => {
      if (!answersMap.has(a.participantId)) answersMap.set(a.participantId, []);
      answersMap.get(a.participantId).push(a);
    });

    const assignMap = new Map();
    assignments.forEach(a => {
      if (!assignMap.has(a.participantId)) assignMap.set(a.participantId, []);
      assignMap.get(a.participantId).push(a);
    });

    const rows = participants.map((p) => {
      const entry = sessionMap.get(p.id) || { participantId: p.id, teamName: p.teamName };
      const pHints = hintsMap.get(p.id) || [];
      const pAnswers = answersMap.get(p.id) || [];
      const pAssigns = assignMap.get(p.id) || [];

      const correctAnswers = pAnswers.filter(a => a.isCorrect);
      const wrongAnswers = pAnswers.filter(a => !a.isCorrect);
      const wrongCount = wrongAnswers.length;

      const solvedQIds = new Set(correctAnswers.map(a => a.questionId));
      const allQIds = new Set(pAnswers.map(a => a.questionId));
      let totalWrongPenaltyPoints = 0;
      allQIds.forEach(qId => {
        const qWrongs = wrongAnswers.filter(w => w.questionId === qId).length;
        totalWrongPenaltyPoints += Math.max(0, qWrongs - 2) * 2;
      });

      let totalPoints = 0;
      let session1Points = 0;
      let session2Points = 0;
      let totalPenalty = 0;

      solvedQIds.forEach((qId) => {
        const qHints = pHints.filter(h => h.questionId === qId);
        const qWrongs = wrongAnswers.filter(w => w.questionId === qId).length;

        let qEarned = 20;
        if (qHints.length >= 3) {
          qEarned = 0;
        } else if (qHints.length === 2) {
          qEarned = 12; // 20 - 8
        } else if (qHints.length === 1) {
          qEarned = 17; // 20 - 3
        }

        // Deduct 2 points per wrong attempt ONLY after 2nd attempt
        const penalizedWrongs = Math.max(0, qWrongs - 2);
        qEarned = qHints.length >= 3 ? 0 : Math.max(0, qEarned - (penalizedWrongs * 2));

        const assign = pAssigns.find(a => a.questionId === qId);
        if (assign && assign.sessionNumber === 1) {
          session1Points += qEarned;
        } else if (assign && assign.sessionNumber === 2) {
          session2Points += qEarned;
        }
        totalPoints += qEarned;
      });

      pHints.forEach(h => {
        totalPenalty += (Number(h.penalty) || 20);
      });

      const totalTime = (entry.session1?.duration || 0) + (entry.session2?.duration || 0);

      return {
        participantId: p.id,
        teamName: p.teamName,
        solvedCount: solvedQIds.size,
        wrongCount,
        wrongPenaltyPoints: totalWrongPenaltyPoints,
        hintsUsedCount: pHints.length,
        totalPenalty,
        totalPoints,
        session1Score: entry.session1?.score || 0,
        session1Points,
        session1Time: entry.session1?.duration || 0,
        session1Completed: Boolean(entry.session1?.completed),
        session2Score: entry.session2?.score || 0,
        session2Points,
        session2Time: entry.session2?.duration || 0,
        session2Completed: Boolean(entry.session2?.completed),
        totalScore: (entry.session1?.score || 0) + (entry.session2?.score || 0),
        totalTime,
        isComplete: Boolean(entry.session1?.completed && entry.session2?.completed)
      };
    });

    rows.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.totalTime - b.totalTime;
    });

    return rows.map((r, idx) => ({ ...r, rank: idx + 1 }));
  },

  async getAdminProgress() {
    await ensureDb();
    const [leaderboardRows, participants, eventStateDoc] = await Promise.all([
      this.getLeaderboard(),
      MongoModels.Participant.find({}).sort({ registeredAt: -1 }).lean(),
      MongoModels.EventState.findOne({}).lean()
    ]);

    const sessions = await MongoModels.ParticipantSession.find({}).lean();
    const sessionMap = new Map();
    sessions.forEach(s => sessionMap.set(s.participantId, s));

    const status = eventStateDoc?.status || 'CLOSED';

    const participantsList = participants.map((p) => {
      const sess = sessionMap.get(p.id) || {};
      const lb = leaderboardRows.find((r) => r.participantId === p.id) || {};

      let currentSession = 'Waiting';
      let progress = '0 / 15';

      if (status === 'SESSION_1_ACTIVE' || status === 'SESSION_1_LOCKED') {
        currentSession = 'Session 1';
        progress = `${sess.session1?.score || 0} / 15`;
      } else if (status === 'SESSION_2_ACTIVE' || status === 'SESSION_2_LOCKED') {
        currentSession = 'Session 2';
        progress = `${sess.session2?.score || 0} / 15`;
      } else if (status === 'EVENT_FINISHED') {
        currentSession = 'Completed';
        progress = `${(sess.session1?.score || 0) + (sess.session2?.score || 0)} / 30`;
      }

      return {
        id: p.id,
        teamName: p.teamName,
        teamPassword: p.passcode || '',
        registeredAt: p.registeredAt,
        lastActiveAt: p.lastActiveAt,
        currentSession,
        progress,
        rank: lb.rank || '-',
        solvedCount: lb.solvedCount || 0,
        hintsUsedCount: lb.hintsUsedCount || 0,
        totalPenalty: lb.totalPenalty || 0,
        totalPoints: lb.totalPoints || 0,
        session1Score: sess.session1?.score || 0,
        session1Points: lb.session1Points || 0,
        session1Time: sess.session1?.duration || 0,
        session1Completed: Boolean(sess.session1?.completed),
        session2Score: sess.session2?.score || 0,
        session2Points: lb.session2Points || 0,
        session2Time: sess.session2?.duration || 0,
        session2Completed: Boolean(sess.session2?.completed),
        totalScore: (sess.session1?.score || 0) + (sess.session2?.score || 0),
        totalTime: (sess.session1?.duration || 0) + (sess.session2?.duration || 0)
      };
    });

    const eventState = await this.getEventState();
    return {
      eventState,
      totalParticipants: participantsList.length,
      participants: participantsList,
      leaderboard: leaderboardRows
    };
  }
};
