import pool from '../lib/db';
import { BADGE_CATALOG, getStudentBadgesAndExp } from '../lib/badges';

type StudentRow = {
  id: number | string;
  name: string;
  email: string;
};

async function main() {
  console.log('====================================================');
  console.log('🏅 GO LEARNING - BADGES & EXP SYNC RUNNER');
  console.log('====================================================\n');

  try {
    // 1. Seed all 27 badges in the `badges` table
    console.log(`📦 Seeding ${BADGE_CATALOG.length} badges into database...`);
    for (const badge of BADGE_CATALOG) {
      const criteriaJson = JSON.stringify({
        slug: badge.slug,
        category: badge.category,
        rarity: badge.rarity,
        exp: badge.exp,
        requirementText: badge.requirementText,
      });

      await pool.query(
        `INSERT INTO badges (id, name, description, icon, criteria)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           icon = EXCLUDED.icon,
           criteria = EXCLUDED.criteria`,
        [badge.id, badge.name, badge.description, badge.icon, criteriaJson]
      );
    }
    console.log(`✅ All ${BADGE_CATALOG.length} badges synced in "badges" table!\n`);

    // 2. Evaluate badges & EXP for all students
    const [studentRows] = await pool.query(
      `SELECT id, name, email FROM users WHERE user_type = 'student' ORDER BY id ASC`
    );
    const students = studentRows as StudentRow[];

    console.log(`👩‍🎓 Evaluating badges & EXP for ${students.length} students...\n`);

    for (const student of students) {
      const studentId = Number(student.id);
      const { badges, expSummary, newlyUnlocked } = await getStudentBadgesAndExp(studentId);
      const unlockedNames = badges
        .filter((b) => b.unlocked)
        .map((b) => `${b.name} (+${b.exp} EXP)`);

      console.log(
        `• [${student.id}] ${student.name} (${student.email}) -> Level ${expSummary.level} (${expSummary.levelTitle}) | Total EXP: ${expSummary.totalExp} EXP | Unlocked: ${expSummary.unlockedCount}/${expSummary.totalBadgesCount}`
      );
      if (unlockedNames.length > 0) {
        console.log(`    🏅 Badges: ${unlockedNames.join(', ')}`);
      }
      if (newlyUnlocked.length > 0) {
        console.log(
          `    ✨ Newly Awarded: ${newlyUnlocked.map((b) => b.name).join(', ')}`
        );
      }
    }

    console.log('\n====================================================');
    console.log('🎉 Badges & EXP evaluation finished successfully!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Error running badges sync:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();

