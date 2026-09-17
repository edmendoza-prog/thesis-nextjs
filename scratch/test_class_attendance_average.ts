import pool from '../lib/db';

interface StudentAttendanceRecord {
  id: string;
  name: string;
  attendance: Array<{ date: string; status: string }>;
}

function calculateClassAttendanceAverage(students: StudentAttendanceRecord[], dates: string[]) {
  console.log(`\n--- Calculating Class Attendance Average for ${dates.length} Days [${dates[0]} to ${dates[dates.length - 1]}] ---`);
  
  // Step 1: Calculate each student's attendance percentage within selected date range
  const studentResults = students.map((student) => {
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;
    let totalMarked = 0;

    dates.forEach((dateStr) => {
      const record = student.attendance.find((a) => a.date === dateStr);
      if (record?.status === 'present') { present++; totalMarked++; }
      else if (record?.status === 'late') { late++; totalMarked++; }
      else if (record?.status === 'excused') { excused++; totalMarked++; }
      else if (record?.status === 'absent') { absent++; totalMarked++; }
    });

    const score = (present * 1.0) + (late * 0.8) + (excused * 1.0);
    const percentage = totalMarked > 0 ? Number(((score / totalMarked) * 100).toFixed(1)) : 100;
    
    return {
      studentId: student.id,
      name: student.name,
      present,
      late,
      excused,
      absent,
      totalMarked,
      percentage,
      hasRecords: totalMarked > 0,
    };
  });

  console.log('Step 1: Individual Student Attendance Percentages:');
  console.table(studentResults);

  // Step 2: Calculate the arithmetic mean of those student percentages
  const valid = studentResults.filter(s => s.hasRecords);
  const sum = valid.reduce((acc, s) => acc + s.percentage, 0);
  const classAverage = valid.length > 0 ? Number((sum / valid.length).toFixed(1)) : 100;

  console.log(`Step 2: Arithmetic Mean Calculation:`);
  console.log(`Sum of Student Percentages = ${sum}`);
  console.log(`Number of Evaluated Students = ${valid.length}`);
  console.log(`Class Average Attendance Rate = ${classAverage}%`);

  return classAverage;
}

async function run() {
  const dates = ['2026-09-12', '2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18'];
  
  // Sample testing data matching our 2 students
  const sampleStudents: StudentAttendanceRecord[] = [
    {
      id: 'ed.mendoza@urios.edu.ph',
      name: 'Ed Ryan Mendoza',
      attendance: [
        { date: '2026-09-14', status: 'present' },
        { date: '2026-09-15', status: 'present' },
      ],
    },
    {
      id: 'kent.hinayon@urios.edu.ph',
      name: 'Kent Hinayon',
      attendance: [
        { date: '2026-09-17', status: 'present' },
      ],
    },
  ];

  const avg = calculateClassAttendanceAverage(sampleStudents, dates);
  if (avg === 100) {
    console.log('\n✅ PASS: Arithmetic mean of (100% + 100%) / 2 = 100.0% exactly matches!');
  } else {
    console.error('\n❌ FAIL: Calculation error');
    process.exit(1);
  }

  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
