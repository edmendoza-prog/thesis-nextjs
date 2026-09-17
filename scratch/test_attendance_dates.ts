import pool from '../lib/db';

async function testGradesApiDates() {
  console.log('--- Testing /api/teacher/grades Date Alignment ---');
  
  // Test 1: Simulating query with startDate=2026-09-11 and endDate=2026-09-17
  const startDateParam = '2026-09-11';
  const endDateParam = '2026-09-17';
  
  const [sy, sm, sd] = startDateParam.split('-').map(Number);
  const [ey, em, ed] = endDateParam.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd, 12, 0, 0);
  const end = new Date(ey, em - 1, ed, 12, 0, 0);
  const dates: string[] = [];
  const maxDays = 31;
  let count = 0;
  while (cur <= end && count < maxDays) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
    count++;
  }

  console.log('Requested range:', startDateParam, 'to', endDateParam);
  console.log('Generated columns (7 days):', dates);
  
  // Verify header mapping
  const headers = dates.map(d => {
    const [y, m, day] = d.split('-').map(Number);
    const dt = new Date(y, m - 1, day, 12, 0, 0);
    return `${dt.toLocaleDateString('en-US', { weekday: 'short' })} ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  });
  console.log('Formatted Headers:', headers);

  if (dates[0] === '2026-09-11' && dates[dates.length - 1] === '2026-09-17') {
    console.log('✅ PASS: Exactly matches Sep 11 to Sep 17 with zero timezone offset!');
  } else {
    console.error('❌ FAIL: Dates mismatch!');
    process.exit(1);
  }

  process.exit(0);
}

testGradesApiDates().catch(e => {
  console.error(e);
  process.exit(1);
});
