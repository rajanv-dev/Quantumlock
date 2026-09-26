import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configurable via .env MONGODB_URI or MONGO_URL (supports Atlas mongodb+srv://)
const DEFAULT_ATLAS_URI = 'mongodb+srv://robinson:prabhu2006@escaperoom.obz6qln.mongodb.net/escaperoom?retryWrites=true&w=majority&appName=Escaperoom';
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || DEFAULT_ATLAS_URI;

// ─────────────────────────────────────────────────────────────────────────────
// MONGOOSE SCHEMAS & MODELS
// ─────────────────────────────────────────────────────────────────────────────

const EventStateSchema = new mongoose.Schema({
  status: { type: String, default: 'CLOSED' },
  active_session: { type: Number, default: 0 },
  session1_started_at: { type: Number, default: null },
  session1_locked_at: { type: Number, default: null },
  session2_started_at: { type: Number, default: null },
  session2_locked_at: { type: Number, default: null },
  event_finished_at: { type: Number, default: null },
  session_duration_minutes: { type: Number, default: 60 },
  timer_paused: { type: Boolean, default: false },
  timer_paused_at: { type: Number, default: null },
  time_adjustment_seconds: { type: Number, default: 0 }
}, { timestamps: true });

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  category: { type: String, default: 'Computer Science' },
  difficulty: { type: String, default: 'Medium' },
  enabled: { type: Boolean, default: true },
  investigationType: { type: String, default: 'code' },
  story: [{ type: String }],
  codeLines: [{ type: String }],
  question: { type: String, required: true },
  hints: [{
    text: { type: String },
    penalty: { type: Number, default: 20 }
  }],
  fragment: { type: Number, default: 1 },
  evidenceTitle: { type: String, default: 'Evidence Log' },
  consequence: [{ type: String }],
  keywords: [{ type: String }],
  answer: { type: String, default: '' }
}, { timestamps: true });

const ParticipantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  teamName: { type: String, required: true },
  passcode: { type: String, default: '' },
  token: { type: String, required: true, unique: true },
  registeredAt: { type: Number, default: () => Date.now() },
  lastActiveAt: { type: Number, default: () => Date.now() }
}, { timestamps: true });

const QuestionAssignmentSchema = new mongoose.Schema({
  assignmentId: { type: String, required: true, unique: true },
  participantId: { type: String, required: true, index: true },
  questionId: { type: String, required: true },
  sessionNumber: { type: Number, required: true },
  questionOrder: { type: Number, required: true },
  assignedAt: { type: Number, default: () => Date.now() }
}, { timestamps: true });

const AnswerSchema = new mongoose.Schema({
  answerId: { type: String, required: true, unique: true },
  participantId: { type: String, required: true, index: true },
  questionId: { type: String, required: true },
  sessionNumber: { type: Number, required: true },
  submittedAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  attemptNumber: { type: Number, default: 1 },
  pointsEarned: { type: Number, default: 0 },
  submittedAt: { type: Number, default: () => Date.now() }
}, { timestamps: true });

const ParticipantSessionSchema = new mongoose.Schema({
  participantId: { type: String, required: true, unique: true },
  teamName: { type: String, default: '' },
  session1: {
    status: { type: String, default: 'LOCKED' },
    startedAt: { type: Number, default: null },
    completedAt: { type: Number, default: null },
    score: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    answersCount: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  },
  session2: {
    status: { type: String, default: 'LOCKED' },
    startedAt: { type: Number, default: null },
    completedAt: { type: Number, default: null },
    score: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    answersCount: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  },
  totalScore: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 }
}, { timestamps: true });

const HintUsedSchema = new mongoose.Schema({
  participantId: { type: String, required: true, index: true },
  questionId: { type: String, required: true },
  hintIdx: { type: Number, required: true },
  penalty: { type: Number, default: 20 },
  usedAt: { type: Number, default: () => Date.now() }
}, { timestamps: true });

export const MongoModels = {
  EventState: mongoose.models.EventState || mongoose.model('EventState', EventStateSchema),
  Question: mongoose.models.Question || mongoose.model('Question', QuestionSchema),
  Participant: mongoose.models.Participant || mongoose.model('Participant', ParticipantSchema),
  QuestionAssignment: mongoose.models.QuestionAssignment || mongoose.model('QuestionAssignment', QuestionAssignmentSchema),
  Answer: mongoose.models.Answer || mongoose.model('Answer', AnswerSchema),
  ParticipantSession: mongoose.models.ParticipantSession || mongoose.model('ParticipantSession', ParticipantSessionSchema),
  HintUsed: mongoose.models.HintUsed || mongoose.model('HintUsed', HintUsedSchema)
};

let isConnected = false;
let onConnectListeners = [];

// Global cached connection for Node / Vercel Serverless
if (!global._mongoCache) {
  global._mongoCache = { conn: null, promise: null };
}

export function onMongoConnect(listener) {
  if (typeof listener === 'function') {
    onConnectListeners.push(listener);
    if (isConnected) {
      try { listener(); } catch (e) {}
    }
  }
}

export async function connectMongoDB() {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (global._mongoCache.conn) {
    isConnected = true;
    return true;
  }

  if (!global._mongoCache.promise) {
    const sanitizedUri = MONGODB_URI.replace(/\/\/.*@/, '//***:***@');
    console.log(`[MongoDB] Initializing permanent connection to cluster (${sanitizedUri})...`);

    global._mongoCache.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      maxPoolSize: 100,
      minPoolSize: 5,
      maxIdleTimeMS: 300000
    }).then((m) => {
      isConnected = true;
      global._mongoCache.conn = m;
      console.log('[MongoDB] ✅ Permanent MongoDB Atlas cluster connection active.');
      for (const fn of onConnectListeners) {
        try { fn(); } catch (e) {}
      }
      return m;
    }).catch((err) => {
      global._mongoCache.promise = null;
      isConnected = false;
      console.warn(`[MongoDB] Connection notice:`, err.message.split('\n')[0]);
      return null;
    });
  }

  const res = await global._mongoCache.promise;
  return Boolean(res);
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export function getMongoUri() {
  return MONGODB_URI.replace(/\/\/.*@/, '//***:***@');
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE RESTORATION & SEEDING
// ─────────────────────────────────────────────────────────────────────────────

export async function loadDataFromMongo() {
  if (!isMongoConnected()) return null;
  try {
    const [eventStateDoc, questionsDocs, participantDocs, assignmentDocs, answerDocs, sessionDocs, hintDocs] = await Promise.all([
      MongoModels.EventState.findOne({}).lean(),
      MongoModels.Question.find({}).lean(),
      MongoModels.Participant.find({}).lean(),
      MongoModels.QuestionAssignment.find({}).lean(),
      MongoModels.Answer.find({}).lean(),
      MongoModels.ParticipantSession.find({}).lean(),
      MongoModels.HintUsed.find({}).lean()
    ]);

    const participants = {};
    (participantDocs || []).forEach((p) => {
      participants[p.id] = {
        id: p.id,
        teamName: p.teamName,
        token: p.token,
        teamPassword: p.passcode || '',
        registeredAt: p.registeredAt,
        lastActiveAt: p.lastActiveAt
      };
    });

    const question_assignments = {};
    (assignmentDocs || []).forEach((a) => {
      if (!question_assignments[a.participantId]) question_assignments[a.participantId] = [];
      question_assignments[a.participantId].push({
        assignmentId: a.assignmentId,
        questionId: a.questionId,
        sessionNumber: a.sessionNumber,
        questionOrder: a.questionOrder,
        assignedAt: a.assignedAt
      });
    });

    const participant_sessions = {};
    (sessionDocs || []).forEach((s) => {
      participant_sessions[s.participantId] = {
        participantId: s.participantId,
        teamName: s.teamName || '',
        session1: s.session1,
        session2: s.session2,
        totalScore: s.totalScore || 0,
        totalTime: s.totalTime || 0
      };
    });

    const hints_used = {};
    (hintDocs || []).forEach((h) => {
      if (!hints_used[h.participantId]) hints_used[h.participantId] = [];
      hints_used[h.participantId].push({
        questionId: h.questionId,
        hintIdx: h.hintIdx,
        penalty: h.penalty || 20,
        usedAt: h.usedAt
      });
    });

    return {
      event_state: eventStateDoc || null,
      questions: (questionsDocs && questionsDocs.length > 0) ? questionsDocs : null,
      participants,
      question_assignments,
      answers: answerDocs || [],
      participant_sessions,
      hints_used
    };
  } catch (err) {
    console.warn('[MongoDB] Error loading state from Mongo:', err.message);
    return null;
  }
}

export async function seedDataToMongo(data) {
  if (!isMongoConnected() || !data) return;
  try {
    const promises = [];

    if (data.event_state) {
      promises.push(MongoModels.EventState.findOneAndUpdate({}, data.event_state, { upsert: true, returnDocument: 'after' }));
    }
    if (data.questions && data.questions.length > 0) {
      const ops = data.questions.map((q) => ({
        updateOne: { filter: { id: q.id }, update: { $set: q }, upsert: true }
      }));
      promises.push(MongoModels.Question.bulkWrite(ops));
    }
    if (data.participants) {
      const pList = Object.values(data.participants);
      if (pList.length > 0) {
        const ops = pList.map((p) => ({
          updateOne: {
            filter: { id: p.id },
            update: {
              $set: {
                id: p.id,
                teamName: p.teamName,
                passcode: p.teamPassword || '',
                token: p.token,
                registeredAt: p.registeredAt,
                lastActiveAt: p.lastActiveAt
              }
            },
            upsert: true
          }
        }));
        promises.push(MongoModels.Participant.bulkWrite(ops));
      }
    }
    if (data.question_assignments) {
      const allAssignments = Object.values(data.question_assignments).flat();
      if (allAssignments.length > 0) {
        const ops = allAssignments.map((a) => ({
          updateOne: { filter: { assignmentId: a.assignmentId }, update: { $set: a }, upsert: true }
        }));
        promises.push(MongoModels.QuestionAssignment.bulkWrite(ops));
      }
    }
    if (data.answers && data.answers.length > 0) {
      const ops = data.answers.map((ans) => ({
        updateOne: { filter: { answerId: ans.answerId }, update: { $set: ans }, upsert: true }
      }));
      promises.push(MongoModels.Answer.bulkWrite(ops));
    }
    if (data.participant_sessions) {
      const entries = Object.entries(data.participant_sessions);
      if (entries.length > 0) {
        const ops = entries.map(([pId, sess]) => ({
          updateOne: { filter: { participantId: pId }, update: { $set: sess }, upsert: true }
        }));
        promises.push(MongoModels.ParticipantSession.bulkWrite(ops));
      }
    }
    if (data.hints_used) {
      const hintsList = [];
      for (const [pId, hints] of Object.entries(data.hints_used)) {
        for (const h of hints) {
          hintsList.push({ ...h, participantId: pId });
        }
      }
      if (hintsList.length > 0) {
        const ops = hintsList.map((h) => ({
          updateOne: {
            filter: { participantId: h.participantId, questionId: h.questionId, hintIdx: h.hintIdx },
            update: { $set: h },
            upsert: true
          }
        }));
        promises.push(MongoModels.HintUsed.bulkWrite(ops));
      }
    }

    await Promise.all(promises);
    console.log('[MongoDB] ✅ State synchronized to MongoDB Atlas in real-time.');
  } catch (err) {
    console.warn('[MongoDB] Error syncing state to Mongo:', err.message);
  }
}

// Background asynchronous MongoDB sync helper
export async function syncToMongo(collectionName, operation, filter, doc) {
  if (!isMongoConnected()) return;
  try {
    const Model = MongoModels[collectionName];
    if (!Model) return;

    if (operation === 'upsert') {
      await Model.findOneAndUpdate(filter, doc, { upsert: true, returnDocument: 'after' });
    } else if (operation === 'insert') {
      await Model.create(doc);
    } else if (operation === 'deleteMany') {
      await Model.deleteMany(filter);
    }
  } catch (err) {
    console.warn(`[MongoDB Sync] Warning during ${collectionName} ${operation}:`, err.message);
  }
}
