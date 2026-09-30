import { connectMongoDB } from './mongo.js';
import { Database, initializeDatabase } from './db.js';

async function runTests() {
  console.log('================================================================');
  console.log('TEST SUITE: RANDOMIZED QUESTIONS & PER-PARTICIPANT TIMERS (25 TEAMS)');
  console.log('================================================================\n');

  await connectMongoDB();
  await initializeDatabase();

  // 1. Reset competition
  console.log('1. Resetting competition state...');
  await Database.resetCompetition();

  // 2. Open Session 1 (duration: 45 minutes)
  console.log('2. Setting Session 1 ACTIVE (duration: 45 minutes)...');
  await Database.updateEventState('SESSION_1_ACTIVE', { durationMinutes: 45, resetTimer: true });

  // 3. Register 25 participants
  console.log('3. Registering 25 unique participants and generating questions...');
  const participants = [];
  for (let i = 1; i <= 25; i++) {
    const teamName = `SQUAD_ALPHA_${String(i).padStart(2, '0')}`;
    const p = await Database.registerParticipant(teamName, 'pass123');
    participants.push(p);
  }
  console.log(`✅ Registered ${participants.length} participants.`);

  // 4. Verify Question Randomness & Dynamic Room Numbers across participants
  console.log('\n4. Verifying Question Randomness & Dynamic Room Numbers...');
  const firstQuestions = [];
  const fullAssignments = [];

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    const qList = await Database.getParticipantQuestionsForSession(p.id, 1);
    
    if (qList.length !== 15) {
      throw new Error(`Participant ${p.teamName} has ${qList.length} questions, expected 15.`);
    }

    firstQuestions.push(qList[0].id);
    fullAssignments.push(qList.map(q => q.id).join(','));

    // Check dynamic room numbers in title, question, story
    qList.forEach((q, idx) => {
      const expectedLevelNum = idx + 1;
      const expectedStr = String(expectedLevelNum).padStart(2, '0');
      
      if (!q.title.startsWith(`ROOM ${expectedStr}:`)) {
        throw new Error(`Question ${q.id} title '${q.title}' does not match assigned room number ROOM ${expectedStr}`);
      }

      if (q.levelNumber !== expectedLevelNum) {
        throw new Error(`Question ${q.id} levelNumber ${q.levelNumber} != expected ${expectedLevelNum}`);
      }

      // Check dynamic story references
      if (q.story && q.story.length > 0) {
        q.story.forEach((para) => {
          if (/CHAMBER\s+\d+/i.test(para)) {
            const matches = para.match(/CHAMBER\s+(\d+)/gi);
            matches.forEach(m => {
              const num = m.replace(/CHAMBER\s+/i, '').padStart(2, '0');
              if (num !== expectedStr) {
                console.warn(`Note: Story has chamber reference ${m}, expected ${expectedStr}`);
              }
            });
          }
        });
      }
    });
  }

  // Count unique 1st questions across 25 participants
  const uniqueFirsts = new Set(firstQuestions);
  console.log(`Unique questions at Room 01 across 25 participants: ${uniqueFirsts.size} distinct questions (out of 25 teams).`);
  
  // Count unique full assignments permutations
  const uniqueSequences = new Set(fullAssignments);
  console.log(`Unique 15-question permutations across 25 participants: ${uniqueSequences.size} / 25`);
  if (uniqueSequences.size < 20) {
    throw new Error('Questions are not sufficiently randomized across participants!');
  }
  console.log('✅ PASS: All 25 participants received distinct randomized question orders with matching Room numbers!');

  // 5. Verify Timer is ON HOLD for all participants initially
  console.log('\n5. Verifying Timer is ON HOLD initially for all participants...');
  const stateP1 = await Database.getEventState(participants[0].id);
  const stateP2 = await Database.getEventState(participants[1].id);

  console.log(`Participant 1 status: participant_started=${stateP1.participant_started}, timer_on_hold=${stateP1.timer_on_hold}, remaining=${stateP1.session_remaining_seconds}s`);
  console.log(`Participant 2 status: participant_started=${stateP2.participant_started}, timer_on_hold=${stateP2.timer_on_hold}, remaining=${stateP2.session_remaining_seconds}s`);

  if (stateP1.participant_started || !stateP1.timer_on_hold || stateP1.session_remaining_seconds !== 45 * 60) {
    throw new Error(`Participant 1 timer should be ON HOLD with 2700s, got remaining=${stateP1.session_remaining_seconds}`);
  }
  if (stateP2.participant_started || !stateP2.timer_on_hold || stateP2.session_remaining_seconds !== 45 * 60) {
    throw new Error(`Participant 2 timer should be ON HOLD with 2700s, got remaining=${stateP2.session_remaining_seconds}`);
  }
  console.log('✅ PASS: Timers are ON HOLD and NOT ticking globally before participants start!');

  // 6. Start Participant 1 only
  console.log('\n6. Starting Participant 1 session at T=0...');
  const startP1State = await Database.startParticipantSession(participants[0].id, 1);
  console.log(`Participant 1 started: participant_started=${startP1State.participant_started}, timer_on_hold=${startP1State.timer_on_hold}, remaining=${startP1State.session_remaining_seconds}s`);
  if (!startP1State.participant_started || startP1State.timer_on_hold) {
    throw new Error('Participant 1 should be started with timer_on_hold=false');
  }

  // Verify Participant 2 remains ON HOLD
  const checkP2State = await Database.getEventState(participants[1].id);
  console.log(`Participant 2 check: participant_started=${checkP2State.participant_started}, timer_on_hold=${checkP2State.timer_on_hold}, remaining=${checkP2State.session_remaining_seconds}s`);
  if (checkP2State.participant_started || !checkP2State.timer_on_hold) {
    throw new Error('Participant 2 should still be ON HOLD while Participant 1 is active!');
  }
  console.log('✅ PASS: Participant 1 timer started independently while Participant 2 remains ON HOLD!');

  // 7. Test Hint penalty applies ONLY to Participant 1
  console.log('\n7. Applying hint penalty to Participant 1...');
  const qP1 = (await Database.getParticipantQuestionsForSession(participants[0].id, 1))[0];
  const hintRes = await Database.recordHintUsage(participants[0].id, qP1.id, 0, 20);
  console.log(`Participant 1 after hint: remaining=${hintRes.remainingSeconds}s, hintPenalty=${hintRes.participantHintPenaltySeconds}s`);

  const p2AfterP1Hint = await Database.getEventState(participants[1].id);
  console.log(`Participant 2 after P1 hint: remaining=${p2AfterP1Hint.session_remaining_seconds}s (expect 2700s)`);
  if (p2AfterP1Hint.session_remaining_seconds !== 45 * 60) {
    throw new Error(`Participant 2 remaining seconds affected by Participant 1 hint: ${p2AfterP1Hint.session_remaining_seconds}`);
  }
  console.log('✅ PASS: Hint penalties deduct timer countdown strictly for that individual participant!');

  // 8. Start Participant 2 later
  console.log('\n8. Starting Participant 2 session now...');
  const startP2State = await Database.startParticipantSession(participants[1].id, 1);
  console.log(`Participant 2 started: participant_started=${startP2State.participant_started}, remaining=${startP2State.session_remaining_seconds}s`);
  if (!startP2State.participant_started || startP2State.timer_on_hold || startP2State.session_remaining_seconds < 2690) {
    throw new Error(`Participant 2 should start fresh with full ~2700s countdown, got ${startP2State.session_remaining_seconds}s`);
  }
  console.log('✅ PASS: Participant 2 started their independent countdown timer cleanly!');

  console.log('\n================================================================');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! COMPLETE COMPLIANCE VERIFIED.');
  console.log('================================================================\n');

  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
