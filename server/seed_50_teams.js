import { Database, initializeDatabase } from './db.js';
import { connectMongoDB, MongoModels } from './mongo.js';

async function seed50Teams() {
  console.log('================================================================');
  console.log(' 🛠️ SEEDING 50 CLEAN PARTICIPANT TEAMS (team1..team50 / pass: 123)');
  console.log('================================================================\n');

  await connectMongoDB();
  await initializeDatabase();

  // Clear existing participant data
  console.log('1. Clearing old participant records...');
  await Promise.all([
    MongoModels.Participant.deleteMany({}),
    MongoModels.ParticipantSession.deleteMany({}),
    MongoModels.QuestionAssignment.deleteMany({}),
    MongoModels.HintUsed.deleteMany({}),
    MongoModels.Answer.deleteMany({})
  ]);
  console.log('✅ Old participant data cleared.\n');

  // Create 50 teams: team1 .. team50 with password '123'
  console.log('2. Creating 50 participant credentials (team1..team50 with passcode "123")...');
  const count = 50;
  const created = [];

  for (let i = 1; i <= count; i++) {
    const teamName = `team${i}`;
    const passcode = '123';
    try {
      const p = await Database.createParticipantCredentials(teamName, passcode);
      created.push(p);
    } catch (err) {
      console.error(`Failed to create ${teamName}:`, err.message);
    }
  }

  console.log(`\n✅ ${created.length}/${count} teams created successfully!`);
  console.log('   All 50 teams configured with Password: "123"\n');
  console.log('Sample Teams:');
  created.slice(0, 5).forEach((t, idx) => {
    console.log(`   ${idx + 1}. Team: ${t.teamName} | Password: ${t.teamPassword}`);
  });
  console.log('   ...');
  created.slice(-3).forEach((t, idx) => {
    console.log(`   ${50 - 3 + idx + 1}. Team: ${t.teamName} | Password: ${t.teamPassword}`);
  });

  console.log('\n================================================================');
  console.log(' 🎉 50 TEAMS SEEDED SUCCESSFULLY IN MONGODB ATLAS!');
  console.log('================================================================');
  process.exit(0);
}

seed50Teams().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
