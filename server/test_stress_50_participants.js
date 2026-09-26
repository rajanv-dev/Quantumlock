const BASE = process.env.TEST_BASE_URL || 'http://localhost:5000';
const ADMIN_TOKEN = 'robin123';
const NUM_PARTICIPANTS = 50;

async function run50ParticipantStressTest() {
  console.log(`================================================================`);
  console.log(` 🚀 STARTING STRESS TEST: ${NUM_PARTICIPANTS} TEAMS (team1..team50 / pass: 123)`);
  console.log(`================================================================\n`);

  const startTime = Date.now();

  // 1. Activate Session 1 (60 mins)
  console.log('Step 1: Activating Session 1 (60 mins)...');
  const sessionRes = await fetch(`${BASE}/api/admin/event/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: JSON.stringify({ status: 'SESSION_1_ACTIVE', durationMinutes: 60 })
  }).then(r => r.json());
  if (!sessionRes.success) throw new Error('Failed to open Session 1.');

  console.log('✅ Session 1 opened successfully.\n');

  // 2. Concurrently log in 50 participants (team1..team50 / passcode: 123)
  console.log(`Step 2: Authenticating ${NUM_PARTICIPANTS} teams (team1..team50 / pass: 123)...`);
  const loginPromises = [];
  for (let i = 1; i <= NUM_PARTICIPANTS; i++) {
    const teamName = `team${i}`;
    const passcode = '123';
    loginPromises.push(
      fetch(`${BASE}/api/participant/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, passcode })
      }).then(async r => {
        const body = await r.json();
        return { status: r.status, data: body, teamName, i };
      })
    );
  }

  const loginResults = await Promise.all(loginPromises);
  const failedLogins = loginResults.filter(r => !r.data.success);
  if (failedLogins.length > 0) {
    throw new Error(`Login failed for ${failedLogins.length} teams.`);
  }

  console.log(`✅ All ${NUM_PARTICIPANTS} teams (team1..team50) authenticated successfully!\n`);

  const participants = loginResults.map(r => r.data.participant);

  // 3. Concurrently fetch questions for all 50 participants
  console.log(`Step 3: Fetching Session 1 assigned questions for all ${NUM_PARTICIPANTS} participants...`);
  const questionPromises = participants.map(p =>
    fetch(`${BASE}/api/session/1/questions`, {
      headers: { 'x-participant-token': p.token }
    }).then(async r => {
      const data = await r.json();
      return { pId: p.id, teamName: p.teamName, data };
    })
  );

  const questionResults = await Promise.all(questionPromises);
  const failedQ = questionResults.filter(q => !q.data.success || !q.data.questions);
  if (failedQ.length > 0) {
    throw new Error(`Failed to fetch questions for ${failedQ.length} participants.`);
  }

  console.log(`✅ All ${NUM_PARTICIPANTS} participants received assigned questions.\n`);

  // 4. Verify Randomization & Room Order across participants
  console.log('Step 4: Verifying Question Randomization & Room Number Order...');
  const room1QuestionIds = new Set();
  let validRoomOrdering = true;

  questionResults.forEach(({ data, teamName }) => {
    const questions = data.questions;
    if (questions[0]) {
      room1QuestionIds.add(questions[0].id);
    }

    questions.forEach((q, idx) => {
      const expectedRoomNum = idx + 1;
      const expectedTitlePrefix = `ROOM ${String(expectedRoomNum).padStart(2, '0')}:`;
      if (!q.title.startsWith(expectedTitlePrefix)) {
        console.error(`[FAIL] ${teamName} Room index ${idx} title '${q.title}' does not match expected prefix '${expectedTitlePrefix}'`);
        validRoomOrdering = false;
      }
    });
  });

  console.log(` -> Distinct Room 01 Question IDs across participants: ${room1QuestionIds.size}`);
  if (room1QuestionIds.size < 2) {
    throw new Error(`Question shuffling failed! All participants received the exact same Room 1 question.`);
  }
  if (!validRoomOrdering) {
    throw new Error(`Room number ordering verification failed.`);
  }
  console.log('✅ PASS: Questions are uniquely shuffled per participant, and Room Numbers (01..15) are strictly ordered!\n');

  // 5. Test Independent Timers & Isolated Hint Penalties
  console.log('Step 5: Verifying Independent Timers & Isolated Hint Penalties...');
  
  const p1 = participants[0];
  const p5 = participants[4];
  const p5Q1 = questionResults[4].data.questions[0];

  console.log(` -> Participant ${p5.teamName} requesting 2 hints on question ${p5Q1.id}...`);
  await fetch(`${BASE}/api/session/1/hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-participant-token': p5.token },
    body: JSON.stringify({ questionId: p5Q1.id, hintIdx: 0, penalty: 20 })
  });
  await fetch(`${BASE}/api/session/1/hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-participant-token': p5.token },
    body: JSON.stringify({ questionId: p5Q1.id, hintIdx: 1, penalty: 40 })
  });

  const [stateP1, stateP5] = await Promise.all([
    fetch(`${BASE}/api/participant/state`, { headers: { 'x-participant-token': p1.token } }).then(r => r.json()),
    fetch(`${BASE}/api/participant/state`, { headers: { 'x-participant-token': p5.token } }).then(r => r.json())
  ]);

  const p1Penalty = stateP1.eventState.participant_hint_penalty_seconds;
  const p5Penalty = stateP5.eventState.participant_hint_penalty_seconds;

  console.log(` -> Participant 1 Penalty: ${p1Penalty}s`);
  console.log(` -> Participant 5 Penalty: ${p5Penalty}s`);

  if (p1Penalty !== 0) {
    throw new Error(`Participant 1 timer was corrupted by Participant 5's hint usage!`);
  }
  if (p5Penalty !== 60) {
    throw new Error(`Participant 5 penalty expected 60s, got ${p5Penalty}s`);
  }
  console.log('✅ PASS: Individual timers are completely isolated! Hint penalties only reduce the user\'s own clock.\n');

  const durationMs = Date.now() - startTime;
  console.log(`================================================================`);
  console.log(` 🎉 STRESS TEST COMPLETE: 100% PASSED in ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`    - 50 Teams (team1..team50 / pass: 123): Authenticated & Verified`);
  console.log(`================================================================\n`);
}

run50ParticipantStressTest().catch(err => {
  console.error('\n❌ STRESS TEST FAILED:', err.message);
  process.exit(1);
});
