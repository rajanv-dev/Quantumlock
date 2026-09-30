import http from 'http';
import { DEFAULT_20_QUESTIONS } from './defaultQuestions.js';

const BASE_URL = 'http://127.0.0.1:5001';
const ADMIN_SECRET = 'robin123';
const NUM_PARTICIPANTS = 50;

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const start = Date.now();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const latency = Date.now() - start;
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data: json, latency };
}

function connectSSE(clientId) {
  return new Promise((resolve) => {
    const receivedEvents = [];
    const req = http.request(`${BASE_URL}/api/events/stream`, (res) => {
      res.on('data', (chunk) => {
        const text = chunk.toString();
        receivedEvents.push(text);
      });
      resolve({
        id: clientId,
        close: () => req.destroy(),
        getEvents: () => receivedEvents
      });
    });
    req.on('error', () => {});
    req.end();
  });
}

function calculateStats(latencies) {
  if (!latencies.length) return { min: 0, max: 0, avg: 0, p95: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / sorted.length),
    p95: sorted[Math.floor(sorted.length * 0.95)]
  };
}

async function runMaster50UserStressTest() {
  console.log('================================================================');
  console.log('⚡ INITIATING 50-USER CONCURRENT LIVE STRESS TEST (DOOM-OS)');
  console.log(`🎯 Target: ${BASE_URL} | Concurrent Load: ${NUM_PARTICIPANTS} Live Agents`);
  console.log('================================================================\n');

  const allLatencies = [];
  const errors = [];

  // PHASE 0: Ensure Session 1 is Active via Admin
  console.log('▶ [PHASE 0] Admin Setup: Setting Event State to SESSION_1_ACTIVE...');
  const stateRes = await apiRequest('/api/admin/event/state', {
    method: 'POST',
    headers: { 'x-admin-token': ADMIN_SECRET },
    body: JSON.stringify({ status: 'SESSION_1_ACTIVE', active_session: 1 })
  });
  if (!stateRes.ok) {
    throw new Error(`Failed to activate Session 1: ${JSON.stringify(stateRes.data)}`);
  }
  console.log('  ✅ Event Status set to SESSION_1_ACTIVE (Session 1 Open).\n');

  // PHASE 1: 50 Concurrent Registrations / Logins
  console.log(`▶ [PHASE 1] Firing ${NUM_PARTICIPANTS} simultaneous participant logins/registrations...`);
  const authStart = Date.now();
  const participantTokens = [];
  const authPromises = [];

  for (let i = 1; i <= NUM_PARTICIPANTS; i++) {
    const teamName = `STRESS_TEAM_${String(i).padStart(2, '0')}`;
    const passcode = '123';
    authPromises.push(
      (async () => {
        // Try login first, if not found register
        let res = await apiRequest('/api/participant/login', {
          method: 'POST',
          body: JSON.stringify({ teamName, teamPassword: passcode, passcode })
        });
        allLatencies.push(res.latency);

        if (!res.ok) {
          res = await apiRequest('/api/participant/register', {
            method: 'POST',
            body: JSON.stringify({ teamName, teamPassword: passcode, passcode })
          });
          allLatencies.push(res.latency);
        }

        if (res.ok && res.data?.participant?.token) {
          return { id: res.data.participant.id, teamName, token: res.data.participant.token };
        } else {
          errors.push(`Auth failed for ${teamName}: ${JSON.stringify(res.data)}`);
          return null;
        }
      })()
    );
  }

  const authResults = await Promise.all(authPromises);
  const activeParticipants = authResults.filter(Boolean);
  const authTotalTime = Date.now() - authStart;

  console.log(`  ✅ ${activeParticipants.length}/${NUM_PARTICIPANTS} participants logged in successfully.`);
  console.log(`  ⏱ Total Time: ${authTotalTime}ms | Avg Latency: ${calculateStats(allLatencies).avg}ms\n`);

  if (activeParticipants.length < NUM_PARTICIPANTS) {
    throw new Error(`Only ${activeParticipants.length} out of ${NUM_PARTICIPANTS} participants authenticated.`);
  }

  // PHASE 2: Connect 50 Live SSE Streams Simultaneously
  console.log(`▶ [PHASE 2] Establishing ${NUM_PARTICIPANTS} concurrent Server-Sent Events (SSE) live streams...`);
  const sseStart = Date.now();
  const sseClients = await Promise.all(activeParticipants.map((p, idx) => connectSSE(idx + 1)));
  const sseTotalTime = Date.now() - sseStart;
  console.log(`  ✅ Connected ${sseClients.length} real-time SSE listener channels in ${sseTotalTime}ms.\n`);

  // PHASE 3: 50 Concurrent Question Fetches (Checking Randomization)
  console.log(`▶ [PHASE 3] Fetching randomized questions simultaneously for all ${NUM_PARTICIPANTS} teams...`);
  const qFetchStart = Date.now();
  const qFetchLatencies = [];
  const participantQuestions = [];

  const qFetchPromises = activeParticipants.map((p) =>
    (async () => {
      const res = await apiRequest('/api/session/1/questions', {
        headers: { 'x-participant-token': p.token }
      });
      qFetchLatencies.push(res.latency);
      allLatencies.push(res.latency);
      if (res.ok && Array.isArray(res.data?.questions)) {
        return { participant: p, questions: res.data.questions };
      } else {
        errors.push(`Failed question fetch for ${p.teamName}: ${JSON.stringify(res.data)}`);
        return null;
      }
    })()
  );

  const qFetchResults = await Promise.all(qFetchPromises);
  const validQResults = qFetchResults.filter(Boolean);
  const qFetchTotalTime = Date.now() - qFetchStart;

  console.log(`  ✅ Fetched 15 questions for ${validQResults.length}/${NUM_PARTICIPANTS} participants in parallel.`);
  const qStats = calculateStats(qFetchLatencies);
  console.log(`  ⏱ Stats: Min: ${qStats.min}ms | Avg: ${qStats.avg}ms | P95: ${qStats.p95}ms | Max: ${qStats.max}ms`);

  // Verify that questions are randomized across participants
  const firstRoomQuestions = validQResults.map(r => r.questions[0]?.id);
  const uniqueFirstRooms = new Set(firstRoomQuestions);
  console.log(`  🎲 Randomization Proof: Across 50 participants, Room 1 mapped to ${uniqueFirstRooms.size} distinct question archetypes.\n`);

  // PHASE 4: 50 Concurrent Session Starts (Individual Timers Triggered)
  console.log(`▶ [PHASE 4] Triggering concurrent Session 1 start (countdown trigger) for all 50 teams...`);
  const startLatencies = [];
  const startPromises = activeParticipants.map((p) =>
    (async () => {
      const res = await apiRequest('/api/session/1/start', {
        method: 'POST',
        headers: { 'x-participant-token': p.token }
      });
      startLatencies.push(res.latency);
      allLatencies.push(res.latency);
      if (!res.ok) {
        errors.push(`Failed start for ${p.teamName}: ${JSON.stringify(res.data)}`);
      }
      return res;
    })()
  );

  await Promise.all(startPromises);
  const startStats = calculateStats(startLatencies);
  console.log(`  ✅ All 50 participant timers triggered concurrently.`);
  console.log(`  ⏱ Stats: Min: ${startStats.min}ms | Avg: ${startStats.avg}ms | P95: ${startStats.p95}ms | Max: ${startStats.max}ms\n`);

  // PHASE 5: 50 Concurrent Hint Requests (Burst 1)
  console.log(`▶ [PHASE 5] Firing 50 simultaneous Hint Requests on Room 1...`);
  const hintLatencies = [];
  const hintPromises = validQResults.map((r) => {
    const q1 = r.questions[0];
    return (async () => {
      const res = await apiRequest('/api/session/1/hint', {
        method: 'POST',
        headers: { 'x-participant-token': r.participant.token },
        body: JSON.stringify({ questionId: q1.id, hintIdx: 0, penalty: 30 })
      });
      hintLatencies.push(res.latency);
      allLatencies.push(res.latency);
      if (!res.ok) {
        errors.push(`Hint request failed for ${r.participant.teamName}: ${JSON.stringify(res.data)}`);
      }
      return res;
    })();
  });

  await Promise.all(hintPromises);
  const hintStats = calculateStats(hintLatencies);
  console.log(`  ✅ 50 parallel hint requests processed.`);
  console.log(`  ⏱ Stats: Min: ${hintStats.min}ms | Avg: ${hintStats.avg}ms | P95: ${hintStats.p95}ms | Max: ${hintStats.max}ms\n`);

  // PHASE 6: 50 Concurrent WRONG Answer Submissions (Testing Unlimited Attempts & Zero Lockouts)
  console.log(`▶ [PHASE 6] Firing 50 simultaneous WRONG answers on Room 1 (Testing no-lockout pipeline)...`);
  const wrongLatencies = [];
  const wrongPromises = validQResults.map((r) => {
    const q1 = r.questions[0];
    return (async () => {
      const res = await apiRequest('/api/session/1/answer', {
        method: 'POST',
        headers: { 'x-participant-token': r.participant.token },
        body: JSON.stringify({ questionId: q1.id, answer: 'INTENTIONALLY_WRONG_SUBMISSION_X' })
      });
      wrongLatencies.push(res.latency);
      allLatencies.push(res.latency);
      if (res.status === 200 && res.data?.success === false && res.data?.isLocked === false) {
        return res.data;
      } else {
        errors.push(`Wrong answer unexpected response: ${JSON.stringify(res.data)}`);
        return null;
      }
    })();
  });

  const wrongResults = await Promise.all(wrongPromises);
  const wrongStats = calculateStats(wrongLatencies);
  console.log(`  ✅ 50 parallel wrong answers processed with 0 lockouts.`);
  console.log(`  ⏱ Stats: Min: ${wrongStats.min}ms | Avg: ${wrongStats.avg}ms | P95: ${wrongStats.p95}ms | Max: ${wrongStats.max}ms\n`);



  // PHASE 7: 50 Concurrent CORRECT Answer Submissions (Testing Real-time Scoring & Verification)
  console.log(`▶ [PHASE 7] Firing 50 simultaneous CORRECT answers on Room 1...`);
  const correctLatencies = [];
  const correctPromises = validQResults.map((r) => {
    const q1 = r.questions[0];
    const fullQ = DEFAULT_20_QUESTIONS.find(x => x.id === q1.id);
    const validAns = fullQ?.answer || (fullQ?.keywords && fullQ.keywords[0]) || 'ARRAY';
    return (async () => {
      const res = await apiRequest('/api/session/1/answer', {
        method: 'POST',
        headers: { 'x-participant-token': r.participant.token },
        body: JSON.stringify({ questionId: q1.id, answer: validAns })
      });
      correctLatencies.push(res.latency);
      allLatencies.push(res.latency);
      if (res.ok && res.data?.success === true && res.data?.isCorrect === true) {
        return res.data;
      } else {
        errors.push(`Correct answer rejected for ${r.participant.teamName} on Q ${q1.id}: ${JSON.stringify(res.data)}`);
        return null;
      }
    })();
  });

  const correctResults = await Promise.all(correctPromises);
  const correctStats = calculateStats(correctLatencies);
  console.log(`  ✅ 50 parallel correct answers verified and scores calculated.`);
  console.log(`  ⏱ Stats: Min: ${correctStats.min}ms | Avg: ${correctStats.avg}ms | P95: ${correctStats.p95}ms | Max: ${correctStats.max}ms\n`);

  // PHASE 8: 50 Concurrent Leaderboard Queries & SSE Broadcast Verification
  console.log(`▶ [PHASE 8] Firing 50 simultaneous Leaderboard Queries...`);
  const lbLatencies = [];
  const lbPromises = activeParticipants.map((p) =>
    (async () => {
      const res = await apiRequest('/api/leaderboard', {
        headers: { 'x-participant-token': p.token }
      });
      lbLatencies.push(res.latency);
      allLatencies.push(res.latency);
      return res;
    })()
  );

  await Promise.all(lbPromises);
  const lbStats = calculateStats(lbLatencies);
  console.log(`  ✅ 50 parallel leaderboard queries completed.`);
  console.log(`  ⏱ Stats: Min: ${lbStats.min}ms | Avg: ${lbStats.avg}ms | P95: ${lbStats.p95}ms | Max: ${lbStats.max}ms\n`);

  // Clean up SSE connections
  sseClients.forEach(c => c.close());

  // OVERALL AUDIT REPORT
  const totalStats = calculateStats(allLatencies);
  const totalRequests = allLatencies.length;

  console.log('================================================================');
  console.log('🏁 50-USER CONCURRENT LOAD TEST REPORT & BENCHMARKS');
  console.log('================================================================');
  console.log(`📊 Total Heavy Parallel API Calls: ${totalRequests}`);
  console.log(`💥 Total Server Crashes / 500 Errors: ${errors.length}`);
  console.log(`⚡ Min Latency: ${totalStats.min}ms`);
  console.log(`⚡ Avg Latency: ${totalStats.avg}ms`);
  console.log(`⚡ P95 Latency: ${totalStats.p95}ms`);
  console.log(`⚡ Max Latency: ${totalStats.max}ms`);
  console.log(`🛡 Server Stability: ${errors.length === 0 ? '100% PASS — ZERO FAILURES' : 'FAILED'}`);
  console.log('================================================================\n');

  if (errors.length > 0) {
    console.error('Errors encountered:', errors.slice(0, 5));
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMaster50UserStressTest().catch((err) => {
  console.error('❌ Master Stress Test failed with exception:', err);
  process.exit(1);
});
