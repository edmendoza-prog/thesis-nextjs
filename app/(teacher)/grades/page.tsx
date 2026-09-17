'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'unmarked';

type AttendanceCell = {
  date?: string;
  status?: AttendanceStatus;
  attended: boolean;
};

type AssessmentCell = {
  id: number;
  title: string;
  percentage?: number;
  score?: number;
  maxScore?: number;
};

type StudentRecord = {
  id: string;
  userId?: number;
  name: string;
  percentage: number;
  status: 'Good' | 'Needs Improvement' | 'Excellent';
  attendance: AttendanceCell[];
  assessments: AssessmentCell[];
};

type SectionItem = {
  id: string;
  name: string;
  count: number;
  students: StudentRecord[];
  activities: AssessmentCell[];
};

type ClassGroup = {
  name: string;
  totalCount: number;
  sections: SectionItem[];
};

type ViewMode = 'Attendance' | 'Assessments' | 'Badges';
type ModalState = {
  kind: 'class' | 'section' | 'student';
  action: 'add' | 'edit' | 'delete';
  className?: string;
  sectionId?: string;
  studentId?: string;
  studentUserId?: number;
  currentName?: string;
};

const badgeSummaries = [
  { name: 'Top Performer', count: 8, tone: 'bg-[#eee7ff] text-[#5d46b4]' },
  { name: 'Consistent', count: 12, tone: 'bg-[#e8f7ee] text-[#1c785d]' },
  { name: 'Improving', count: 6, tone: 'bg-[#fff2da] text-[#b36a14]' },
];

const classOptions = [
  'All Status',
  'Good',
  'Excellent',
  'Needs Improvement',
];

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'folder':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l1.5 2H18.5A2.5 2.5 0 0 1 21 9.5v6A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5v-8Z" /></svg>;
    case 'search':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></svg>;
    case 'calendar':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case 'check':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12.5 9.5 17 19 7.5" /></svg>;
    case 'x':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case 'clock':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case 'shield':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'badge':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v8A2.5 2.5 0 0 1 17.5 18H14l-2 3-2-3H6.5A2.5 2.5 0 0 1 4 15.5v-8Z" /><path d="M8 9.5h8M8 12.5h8" /></svg>;
    case 'download':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3v12" /><path d="m7 20 5 5 5-5" /><path d="M3 20h18" /></svg>;
    case 'file-text':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
    case 'printer':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>;
    case 'table':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>;
    case 'ellipsis':
      return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>;
    case 'plus':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14" /></svg>;
    case 'edit':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>;
    case 'trash':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" /></svg>;
    default:
      return null;
  }
}

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const getInitialRange = () => {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6, 12, 0, 0);
  return {
    start: toLocalDateString(start),
    end: toLocalDateString(end),
  };
};

export default function ClassRecordPage() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [activeView, setActiveView] = useState<ViewMode>('Attendance');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalStudentId, setModalStudentId] = useState('');
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [availableStudentDirectory, setAvailableStudentDirectory] = useState<StudentRecord[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Functional Calendar state
  const initialRange = useMemo(() => getInitialRange(), []);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [rangeSelecting, setRangeSelecting] = useState<'none' | 'start'>('none');
  const [tempStart, setTempStart] = useState<string | null>(null);
  const [openAttendanceCell, setOpenAttendanceCell] = useState<{
    studentId: string;
    date: string;
  } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csvContent = '\uFEFF' + rows.map(row => row.map(cell => {
      const str = cell === null || cell === undefined ? '' : String(cell);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')).join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportMasterCsv = () => {
    if (!selectedClass || !selectedSection) return;
    const students = selectedSection.students || [];
    const rows: (string | number)[][] = [];

    rows.push(['MASTER CLASS RECORD & GRADE REPORT']);
    rows.push(['Class', selectedClass.name]);
    rows.push(['Section', selectedSection.name]);
    rows.push(['Date Range', formatDateRange(startDate, endDate)]);
    rows.push(['Total Enrolled Learners', students.length]);
    rows.push(['Generated On', new Date().toLocaleString()]);
    rows.push([]);

    const header = ['Student ID', 'Student Name', 'Attendance Rate (%)', 'Present Days', 'Absent Days', 'Late Days', 'Excused Days'];
    assessmentColumns.forEach((col) => {
      header.push(`${col.title} (Score)`);
      header.push(`${col.title} (%)`);
    });
    header.push('Average Grade (%)');
    header.push('Status');
    rows.push(header);

    students.forEach((student) => {
      const presentCount = student.attendance.filter(a => a.status === 'present').length;
      const absentCount = student.attendance.filter(a => a.status === 'absent').length;
      const lateCount = student.attendance.filter(a => a.status === 'late').length;
      const excusedCount = student.attendance.filter(a => a.status === 'excused').length;

      const row: (string | number)[] = [
        student.id,
        student.name,
        `${student.percentage}%`,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
      ];

      assessmentColumns.forEach((col) => {
        const assessment = student.assessments.find(a => a.id === col.id);
        if (assessment && assessment.score !== undefined) {
          row.push(`${assessment.score} / ${assessment.maxScore ?? col.maxScore ?? 100}`);
          row.push(`${assessment.percentage}%`);
        } else {
          row.push('—');
          row.push('—');
        }
      });

      row.push(`${student.percentage}%`);
      row.push(student.status);
      rows.push(row);
    });

    const safeClassName = selectedClass.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSectionName = selectedSection.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadCsv(`Master_Class_Record_${safeClassName}_${safeSectionName}_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    setShowExportModal(false);
  };

  const handleExportAttendanceCsv = () => {
    if (!selectedClass || !selectedSection) return;
    const students = selectedSection.students || [];
    const rows: (string | number)[][] = [];

    rows.push(['ATTENDANCE LOG REPORT']);
    rows.push(['Class', selectedClass.name]);
    rows.push(['Section', selectedSection.name]);
    rows.push(['Period', formatDateRange(startDate, endDate)]);
    rows.push(['Total Enrolled Learners', students.length]);
    rows.push(['Class Average Attendance (%)', `${classAttendanceAverage}%`]);
    rows.push(['Generated On', new Date().toLocaleString()]);
    rows.push([]);

    const header = ['Student ID', 'Student Name'];
    attendanceDates.forEach((dateStr) => {
      const { dayName, monthDay } = formatDateHeader(dateStr);
      header.push(`${dayName} ${monthDay} (${dateStr})`);
    });
    header.push('Total Present');
    header.push('Total Absent');
    header.push('Total Late');
    header.push('Total Excused');
    header.push('Attendance Rate (%)');
    rows.push(header);

    students.forEach((student) => {
      const row: (string | number)[] = [student.id, student.name];
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      attendanceDates.forEach((dateStr, idx) => {
        const day = student.attendance.find(a => a.date === dateStr) || student.attendance[idx];
        const status = day?.status || 'unmarked';
        if (status === 'present') presentCount++;
        else if (status === 'absent') absentCount++;
        else if (status === 'late') lateCount++;
        else if (status === 'excused') excusedCount++;

        row.push(status.toUpperCase());
      });

      const totalMarked = presentCount + absentCount + lateCount + excusedCount;
      const attRate = totalMarked > 0 ? Math.round(((presentCount * 1.0 + lateCount * 0.8 + excusedCount * 1.0) / totalMarked) * 100) : 100;

      row.push(presentCount);
      row.push(absentCount);
      row.push(lateCount);
      row.push(excusedCount);
      row.push(`${attRate}%`);
      rows.push(row);
    });

    const safeClassName = selectedClass.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSectionName = selectedSection.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadCsv(`Attendance_Report_${safeClassName}_${safeSectionName}_${startDate}_to_${endDate}.csv`, rows);
    setShowExportModal(false);
  };

  const handleExportAssessmentsCsv = () => {
    if (!selectedClass || !selectedSection) return;
    const students = selectedSection.students || [];
    const rows: (string | number)[][] = [];

    rows.push(['ASSESSMENTS & GRADING REPORT']);
    rows.push(['Class', selectedClass.name]);
    rows.push(['Section', selectedSection.name]);
    rows.push(['Recorded Activities Count', assessmentColumns.length]);
    rows.push(['Total Enrolled Learners', students.length]);
    rows.push(['Generated On', new Date().toLocaleString()]);
    rows.push([]);

    const header = ['Student ID', 'Student Name'];
    assessmentColumns.forEach((col) => {
      header.push(`${col.title} (Score / ${col.maxScore ?? 100})`);
      header.push(`${col.title} (%)`);
    });
    header.push('Average Grade (%)');
    header.push('Status');
    rows.push(header);

    students.forEach((student) => {
      const row: (string | number)[] = [student.id, student.name];
      assessmentColumns.forEach((col) => {
        const assessment = student.assessments.find(a => a.id === col.id);
        if (assessment && assessment.score !== undefined) {
          row.push(assessment.score);
          row.push(`${assessment.percentage}%`);
        } else {
          row.push('—');
          row.push('—');
        }
      });
      row.push(`${student.percentage}%`);
      row.push(student.status);
      rows.push(row);
    });

    const safeClassName = selectedClass.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSectionName = selectedSection.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadCsv(`Assessment_Grades_${safeClassName}_${safeSectionName}_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    setShowExportModal(false);
  };

  const handlePrintReport = () => {
    if (!selectedClass || !selectedSection) return;
    const students = selectedSection.students || [];
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const className = selectedClass.name;
    const sectionName = selectedSection.name;
    const dateRangeStr = formatDateRange(startDate, endDate);
    const now = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const avgAttendance = classAttendanceAverage;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Class Record Report - ${className} (${sectionName})</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #24222a;
              padding: 24px;
              background: #fff;
              margin: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #5d43a0;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .title-area h1 {
              margin: 0;
              font-size: 24px;
              color: #2f2545;
              font-weight: 800;
            }
            .title-area p {
              margin: 4px 0 0 0;
              font-size: 13px;
              color: #6a6476;
            }
            .badge-portal {
              background: #f1ecf9;
              color: #5d43a0;
              padding: 6px 14px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .meta-cards {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }
            .card {
              background: #f8f6fc;
              border: 1px solid #e5dfee;
              border-radius: 10px;
              padding: 10px 14px;
            }
            .card-lbl {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #7b728a;
              letter-spacing: 0.05em;
            }
            .card-val {
              font-size: 15px;
              font-weight: 700;
              color: #2f2545;
              margin-top: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              margin-bottom: 24px;
            }
            th, td {
              border: 1px solid #ddd6e8;
              padding: 8px 10px;
              text-align: left;
            }
            th {
              background: #f4f0f9;
              color: #3b2c58;
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }
            td.center, th.center { text-align: center; }
            .pill {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 700;
            }
            .pill-excellent { background: #dff6ea; color: #167a56; }
            .pill-good { background: #e8f6f1; color: #236c5a; }
            .pill-needs { background: #fde7c8; color: #b8620d; }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #e0d9ec;
              padding-top: 14px;
              font-size: 11px;
              color: #8c8599;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-area">
              <h1>Official Class Record &amp; Grade Report</h1>
              <p>Generated on ${now} • Academic Year Class Performance</p>
            </div>
            <div class="badge-portal">
              Teacher Workspace
            </div>
          </div>

          <div class="meta-cards">
            <div class="card">
              <div class="card-lbl">Class &amp; Section</div>
              <div class="card-val">${className} - ${sectionName}</div>
            </div>
            <div class="card">
              <div class="card-lbl">Active Period</div>
              <div class="card-val">${dateRangeStr}</div>
            </div>
            <div class="card">
              <div class="card-lbl">Enrolled Students</div>
              <div class="card-val">${students.length} Learners</div>
            </div>
            <div class="card">
              <div class="card-lbl">Class Average</div>
              <div class="card-val">${avgAttendance}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;" class="center">#</th>
                <th style="width: 110px;">Student ID</th>
                <th>Student Name</th>
                <th class="center" style="width: 90px;">Attendance</th>
                ${assessmentColumns.map(col => `<th class="center">${col.title}<br/><span style="font-weight: normal; font-size: 10px;">/${col.maxScore ?? 100}</span></th>`).join('')}
                <th class="center" style="width: 80px;">Average</th>
                <th class="center" style="width: 110px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${students.length === 0 ? `
                <tr>
                  <td colspan="${assessmentColumns.length + 6}" class="center" style="padding: 20px; color: #8c8599;">
                    No students currently enrolled in this section.
                  </td>
                </tr>
              ` : students.map((st, i) => {
                const pillClass = st.status === 'Excellent' ? 'pill-excellent' : st.status === 'Good' ? 'pill-good' : 'pill-needs';
                return `
                  <tr>
                    <td class="center" style="color: #8c8599;">${i + 1}</td>
                    <td><strong>${st.id}</strong></td>
                    <td>${st.name}</td>
                    <td class="center"><strong>${st.percentage}%</strong></td>
                    ${assessmentColumns.map(col => {
                      const sc = st.assessments.find(a => a.id === col.id);
                      return `<td class="center">${sc?.score !== undefined ? `${sc.score} <span style="color:#777; font-size:10px;">(${sc.percentage}%)</span>` : '<span style="color:#aaa;">—</span>'}</td>`;
                    }).join('')}
                    <td class="center"><strong>${st.percentage}%</strong></td>
                    <td class="center"><span class="pill ${pillClass}">${st.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Verified institutional report generated via Learning Management System.</div>
            <div>Page 1 of 1</div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setShowExportModal(false);
  };

  const loadClassRecords = async (sDate = startDate, eDate = endDate) => {
    try {
      const url = `/api/teacher/grades?startDate=${sDate}&endDate=${eDate}`;
      const response = await fetch(url, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.grades)) return;

      const groupMap = new Map<string, ClassGroup>();
      for (const grade of data.grades) {
        const cName = String(grade.name || 'Grade 1').trim();
        const sName = String(grade.section || grade.sections?.[0]?.name || 'Main Section').trim();
        const studentList: StudentRecord[] = Array.isArray(grade.sections?.[0]?.studentList) ? grade.sections[0].studentList : [];
        const activities: AssessmentCell[] = Array.isArray(grade.sections?.[0]?.activities) ? grade.sections[0].activities : [];
        const sectionItem: SectionItem = {
          id: String(grade.id),
          name: sName,
          count: Number(grade.students ?? studentList.length ?? 0),
          students: studentList,
          activities,
        };

        if (!groupMap.has(cName)) {
          groupMap.set(cName, {
            name: cName,
            totalCount: 0,
            sections: [],
          });
        }
        const group = groupMap.get(cName)!;
        group.sections.push(sectionItem);
        group.totalCount += sectionItem.count;
      }

      const groups = Array.from(groupMap.values());
      setClassGroups(groups);
      setAvailableStudentDirectory(Array.isArray(data.availableStudents) ? data.availableStudents : []);
      setAttendanceDates(Array.isArray(data.dates) ? data.dates : []);

      if (groups.length > 0) {
        setSelectedClassName((prevName) => {
          const match = groups.find((g) => g.name === prevName);
          const nextName = match ? match.name : groups[0].name;
          const currentGroup = groups.find((g) => g.name === nextName) || groups[0];

          setSelectedSectionId((prevSecId) => {
            const secMatch = currentGroup.sections.find((s) => s.id === prevSecId);
            return secMatch ? secMatch.id : (currentGroup.sections[0]?.id ?? '');
          });

          return nextName;
        });
      } else {
        setSelectedClassName('');
        setSelectedSectionId('');
      }
    } catch (error) {
      console.error('Class records fetch error:', error);
    }
  };

  useEffect(() => {
    loadClassRecords();
  }, []);

  // Close calendar popover and attendance cell dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setRangeSelecting('none');
        setTempStart(null);
      }
      if (openAttendanceCell && !(event.target as Element)?.closest('.attendance-dropdown-wrapper')) {
        setOpenAttendanceCell(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openAttendanceCell]);

  const selectedClass = useMemo(
    () => classGroups.find((g) => g.name === selectedClassName) ?? classGroups[0] ?? null,
    [classGroups, selectedClassName]
  );

  const selectedSection = useMemo(
    () => selectedClass?.sections.find((s) => s.id === selectedSectionId) ?? selectedClass?.sections[0] ?? null,
    [selectedClass, selectedSectionId]
  );

  const filteredStudents = useMemo(() => {
    return (selectedSection?.students ?? []).filter((student) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All Status' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedSection, statusFilter]);

  const assessmentColumns = useMemo(() => {
    const columns = new Map<number, AssessmentCell>();
    selectedSection?.activities?.forEach((activity) => columns.set(activity.id, activity));
    selectedSection?.students.forEach((student) => student.assessments.forEach((assessment) => {
      if (!columns.has(assessment.id)) columns.set(assessment.id, assessment);
    }));
    return Array.from(columns.values());
  }, [selectedSection]);

  const getStudentAttendanceMetrics = (student: StudentRecord, dates: string[]) => {
    let presentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let absentCount = 0;
    let totalMarked = 0;

    dates.forEach((dateStr) => {
      const record = student.attendance.find((a) => a.date === dateStr);
      const status = record?.status;
      if (status === 'present') {
        presentCount++;
        totalMarked++;
      } else if (status === 'late') {
        lateCount++;
        totalMarked++;
      } else if (status === 'excused') {
        excusedCount++;
        totalMarked++;
      } else if (status === 'absent') {
        absentCount++;
        totalMarked++;
      }
    });

    if (totalMarked === 0) {
      return {
        percentage: 100,
        status: 'Unmarked',
        hasRecords: false,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        totalMarked,
      };
    }

    const scoreSum = (presentCount * 1.0) + (lateCount * 0.8) + (excusedCount * 1.0);
    const percentage = Number(((scoreSum / totalMarked) * 100).toFixed(1));
    const status = percentage >= 90 ? 'Excellent' : percentage >= 75 ? 'Good' : 'Needs Improvement';

    return {
      percentage,
      status,
      hasRecords: true,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      totalMarked,
    };
  };

  // Calculate the average attendance percentage of all students in the selected class and date range
  const classAttendanceAverage = useMemo(() => {
    if (!selectedSection || selectedSection.students.length === 0) return 0;
    const enrolledStudents = selectedSection.students;

    // Step 1: Calculate each enrolled student's attendance percentage within the selected date range
    const studentMetrics = enrolledStudents.map((student) => getStudentAttendanceMetrics(student, attendanceDates));
    const validStudents = studentMetrics.filter((m) => m.hasRecords);

    if (validStudents.length === 0) return 100;

    // Step 2: Calculate the arithmetic mean of those student percentages
    const sum = validStudents.reduce((acc, m) => acc + m.percentage, 0);
    return Number((sum / validStudents.length).toFixed(1));
  }, [selectedSection, attendanceDates]);

  const formatDate = (date: string) => {
    if (!date) return '';
    const [y, m, d] = date.split('-').map(Number);
    if (!y || !m || !d) return date;
    return new Date(y, m - 1, d, 12, 0, 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateHeader = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return { dayName: '', monthDay: dateStr };
    const dt = new Date(y, m - 1, d, 12, 0, 0);
    const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dayName, monthDay };
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 'Select dates';
    const [sy, sm, sd] = startStr.split('-').map(Number);
    const [ey, em, ed] = endStr.split('-').map(Number);
    if (!sy || !sm || !sd || !ey || !em || !ed) return `${startStr} - ${endStr}`;
    const start = new Date(sy, sm - 1, sd, 12, 0, 0);
    const end = new Date(ey, em - 1, ed, 12, 0, 0);
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startStr === endStr) {
      return `${startMonth} ${startDay}, ${year}`;
    }
    if (startMonth === endMonth && sy === ey) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  const applyDateRange = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setShowCalendar(false);
    setRangeSelecting('none');
    setTempStart(null);
    loadClassRecords(newStart, newEnd);
  };

  const shiftDateRange = (days: number) => {
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    if (!sy || !sm || !sd || !ey || !em || !ed) return;
    const s = new Date(sy, sm - 1, sd + days, 12, 0, 0);
    const e = new Date(ey, em - 1, ed + days, 12, 0, 0);
    applyDateRange(toLocalDateString(s), toLocalDateString(e));
  };

  const setPreset = (preset: 'today' | 'this-week' | 'last-week' | 'last-7' | 'last-14' | 'this-month') => {
    const today = new Date();
    let s = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    let e = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);

    if (preset === 'today') {
      // today only
    } else if (preset === 'this-week') {
      const day = today.getDay();
      const diffToMon = day === 0 ? -6 : 1 - day;
      s = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMon, 12, 0, 0);
      e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6, 12, 0, 0);
    } else if (preset === 'last-week') {
      const day = today.getDay();
      const diffToMon = day === 0 ? -6 : 1 - day;
      s = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMon - 7, 12, 0, 0);
      e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6, 12, 0, 0);
    } else if (preset === 'last-7') {
      s = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 12, 0, 0);
    } else if (preset === 'last-14') {
      s = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13, 12, 0, 0);
    } else if (preset === 'this-month') {
      s = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0);
      e = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12, 0, 0);
    }

    applyDateRange(toLocalDateString(s), toLocalDateString(e));
    setCalendarMonth(s);
  };

  const handleCalendarDayClick = (dayStr: string) => {
    if (rangeSelecting === 'none') {
      setTempStart(dayStr);
      setRangeSelecting('start');
    } else {
      if (tempStart && dayStr < tempStart) {
        applyDateRange(dayStr, tempStart);
      } else if (tempStart) {
        applyDateRange(tempStart, dayStr);
      } else {
        applyDateRange(dayStr, dayStr);
      }
    }
  };

  // Update student attendance status for a given date (Neo LMS style)
  const updateAttendanceStatus = async (student: StudentRecord, dateStr: string, newStatus: AttendanceStatus) => {
    if (!selectedSection) return;

    // Optimistic UI update
    setClassGroups((currentGroups) =>
      currentGroups.map((group) => {
        if (group.name !== selectedClass?.name) return group;
        return {
          ...group,
          sections: group.sections.map((sec) => {
            if (sec.id !== selectedSection.id) return sec;
            return {
              ...sec,
              students: sec.students.map((st) => {
                if (st.id !== student.id) return st;
                const nextAttendance = st.attendance.map((day) => {
                  if (day.date === dateStr) {
                    return {
                      ...day,
                      status: newStatus,
                      attended: newStatus === 'present' || newStatus === 'late',
                    };
                  }
                  return day;
                });
                const markedDays = nextAttendance.filter((d) => d.status && d.status !== 'unmarked');
                const totalMarked = markedDays.length;
                let percentage = 100;
                if (totalMarked > 0) {
                  const scoreSum = markedDays.reduce((acc, d) => {
                    if (d.status === 'present') return acc + 1;
                    if (d.status === 'late') return acc + 0.8;
                    if (d.status === 'excused') return acc + 1;
                    return acc;
                  }, 0);
                  percentage = Number(((scoreSum / totalMarked) * 100).toFixed(1));
                }
                const status: StudentRecord['status'] =
                  percentage >= 90 ? 'Excellent' : percentage >= 75 ? 'Good' : 'Needs Improvement';
                return {
                  ...st,
                  attendance: nextAttendance,
                  percentage,
                  status,
                };
              }),
            };
          }),
        };
      })
    );

    try {
      await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-attendance',
          classId: Number(selectedSection.id),
          studentId: student.userId ?? Number(student.id),
          date: dateStr,
          status: newStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to save attendance:', err);
    }
  };

  const openModal = (nextModal: ModalState) => {
    setModal(nextModal);
    setModalName(nextModal.currentName ?? '');
    setModalStudentId('');
  };

  const handleModalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modal) return;

    if (modal.action === 'delete') {
      if (modal.kind === 'student' && selectedSection) {
        const studentUserId = modal.studentUserId ?? Number(modal.studentId);
        if (studentUserId) {
          // Optimistic local update
          setClassGroups((prev) =>
            prev.map((group) => ({
              ...group,
              sections: group.sections.map((sec) => {
                if (sec.id !== selectedSection.id) return sec;
                return {
                  ...sec,
                  count: Math.max(0, sec.count - 1),
                  students: sec.students.filter(
                    (s) => s.id !== modal.studentId && s.userId !== studentUserId
                  ),
                };
              }),
            }))
          );
          await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'remove-student',
              classId: Number(selectedSection.id),
              studentId: studentUserId,
            }),
          });
          await loadClassRecords();
        }
        setModal(null);
        return;
      }
      if (modal.kind === 'class' && modal.className) {
        if (classGroups.length <= 1) {
          setModal(null);
          return;
        }
        await fetch('/api/teacher/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete-class-group', name: modal.className }),
        });
        await loadClassRecords();
      } else if (modal.kind === 'section' && modal.sectionId) {
        await fetch('/api/teacher/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete-class', id: Number(modal.sectionId) }),
        });
        await loadClassRecords();
      }
      setModal(null);
      return;
    }

    if (modal.kind === 'student' && selectedSection) {
      const student = availableStudentDirectory.find((entry) => entry.id === modalStudentId && !selectedSection.students.some((enrolled) => enrolled.id === entry.id));
      if (!student) return;
      const response = await fetch('/api/teacher/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          classId: Number(selectedSection.id),
          enrolledIds: [...selectedSection.students.map((entry) => entry.userId).filter((id): id is number => Boolean(id)), student.userId ?? Number(student.id)],
        }),
      });
      if (response.ok) {
        await loadClassRecords();
      }
      setModal(null);
      return;
    }

    if (!modalName.trim()) return;

    if (modal.kind === 'class') {
      if (modal.action === 'add') {
        const defaultSection = 'Section A';
        try {
          const response = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: modalName.trim(), section: defaultSection }),
          });
          const data = await response.json();
          if (!response.ok) {
            alert(data.error || 'Failed to create class');
          } else {
            setSelectedClassName(modalName.trim());
            await loadClassRecords();
          }
        } catch (err: any) {
          alert(err.message || 'Error creating class');
        }
      } else if (modal.className) {
        try {
          const response = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-class-name', oldName: modal.className, name: modalName.trim() }),
          });
          const data = await response.json();
          if (!response.ok) {
            alert(data.error || 'Failed to update class name');
          } else {
            setSelectedClassName(modalName.trim());
            await loadClassRecords();
          }
        } catch (err: any) {
          alert(err.message || 'Error updating class name');
        }
      }
    } else if (modal.kind === 'section') {
      if (modal.action === 'add' && modal.className) {
        try {
          const response = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add-section', name: modal.className, section: modalName.trim() }),
          });
          const data = await response.json();
          if (!response.ok) {
            alert(data.error || 'Failed to add section');
          } else {
            await loadClassRecords();
            if (data.grade?.id) {
              setSelectedSectionId(String(data.grade.id));
            }
          }
        } catch (err: any) {
          alert(err.message || 'Error adding section');
        }
      } else if (modal.action === 'edit' && modal.sectionId) {
        try {
          const response = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-section', id: Number(modal.sectionId), section: modalName.trim() }),
          });
          const data = await response.json();
          if (!response.ok) {
            alert(data.error || 'Failed to update section');
          } else {
            await loadClassRecords();
          }
        } catch (err: any) {
          alert(err.message || 'Error updating section');
        }
      }
    }
    setModal(null);
  };

  const availableStudents = useMemo(() => availableStudentDirectory.filter((student, index, directory) => (
    directory.findIndex((entry) => entry.id === student.id) === index &&
    !(selectedSection?.students ?? []).some((enrolled) => enrolled.id === student.id) &&
    (!modalName.trim() || `${student.name} ${student.id}`.toLowerCase().includes(modalName.trim().toLowerCase()))
  )), [modalName, selectedSection]);

  const renderCalendarPopover = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const monthName = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = new Date(year, month - 1, d, 12, 0, 0);
      cells.push({ dateStr: toLocalDateString(prevM), dayNum: d, isCurrentMonth: false });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curM = new Date(year, month, d, 12, 0, 0);
      cells.push({ dateStr: toLocalDateString(curM), dayNum: d, isCurrentMonth: true });
    }
    // Next month days to fill grid
    const remaining = (cells.length <= 35 ? 35 : 42) - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = new Date(year, month + 1, d, 12, 0, 0);
      cells.push({ dateStr: toLocalDateString(nextM), dayNum: d, isCurrentMonth: false });
    }

    const todayStr = toLocalDateString(new Date());
    const activeStart = tempStart || startDate;
    const activeEnd = rangeSelecting === 'start' ? (tempStart || startDate) : endDate;
    const minD = activeStart < activeEnd ? activeStart : activeEnd;
    const maxD = activeStart < activeEnd ? activeEnd : activeStart;

    return (
      <div className="absolute right-0 sm:left-0 top-full z-50 mt-2 w-[340px] sm:w-[380px] rounded-2xl border border-[#d8d0e7] bg-white p-4 shadow-2xl animate-fadeInUp">
        {/* Presets */}
        <div className="mb-3 flex flex-wrap gap-1.5 border-b border-[#f0ebf8] pb-3">
          {[
            { label: 'Today', key: 'today' as const },
            { label: 'This Week', key: 'this-week' as const },
            { label: 'Last 7 Days', key: 'last-7' as const },
            { label: 'Last Week', key: 'last-week' as const },
            { label: 'This Month', key: 'this-month' as const },
          ].map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setPreset(preset.key)}
              className="rounded-lg bg-[#f4effa] px-2.5 py-1 text-xs font-semibold text-[#5d43a0] transition hover:bg-[#e7dcf6]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5d43a0] transition hover:bg-[#f4effa]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <span className="text-sm font-bold text-[#2f2f36]">{monthName}</span>
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5d43a0] transition hover:bg-[#f4effa]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>

        {/* Week Day Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-[#817889]">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 mt-1">
          {cells.map((cell) => {
            const inRange = cell.dateStr >= minD && cell.dateStr <= maxD;
            const isStart = cell.dateStr === minD;
            const isEnd = cell.dateStr === maxD;
            const isToday = cell.dateStr === todayStr;

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => handleCalendarDayClick(cell.dateStr)}
                className={`relative flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium transition ${isStart || isEnd
                    ? 'bg-[#7257aa] font-bold text-white shadow-sm'
                    : inRange
                      ? 'bg-[#eee7ff] font-semibold text-[#5d46b4]'
                      : cell.isCurrentMonth
                        ? 'text-[#2f2f36] hover:bg-[#f4effa]'
                        : 'text-[#bbb4c7] hover:bg-[#f8f5fb]'
                  } ${isToday && !isStart && !isEnd ? 'ring-1 ring-[#7257aa]' : ''}`}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>

        {/* Footer info & Done */}
        <div className="mt-4 flex items-center justify-between border-t border-[#f0ebf8] pt-3 text-xs">
          <span className="text-[#6e6978] font-medium truncate max-w-[200px]">
            {rangeSelecting === 'start'
              ? `Select end date (Start: ${tempStart})`
              : formatDateRange(startDate, endDate)}
          </span>
          <button
            type="button"
            onClick={() => {
              setShowCalendar(false);
              setRangeSelecting('none');
              setTempStart(null);
            }}
            className="rounded-lg bg-[#7257aa] px-3 py-1.5 font-bold text-white transition hover:bg-[#5d4694]"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  const renderAttendanceView = () => (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Icon type="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b728a]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search students..."
            className="w-full rounded-xl border border-[#d7d2e5] bg-white py-2.5 pl-10 pr-3 text-sm text-[#2f2f36] outline-none placeholder:text-[#8a8597] focus:border-[#c5b9e8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Shift Previous 7 days */}
          <button
            type="button"
            onClick={() => shiftDateRange(-7)}
            aria-label="Previous 7 days"
            title="Previous 7 days"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d7d2e5] bg-white text-[#4a4852] shadow-sm transition hover:bg-[#f4f0f9] hover:text-[#2f2f36]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          {/* Functional Calendar Trigger */}
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition ${showCalendar
                  ? 'border-[#7257aa] bg-[#f5efff] text-[#5d43a0] ring-2 ring-[#7257aa]/20'
                  : 'border-[#d7d2e5] bg-white text-[#4a4852] hover:bg-[#f4f0f9]'
                }`}
            >
              <Icon type="calendar" className="h-4 w-4 text-[#7257aa]" />
              <span>{formatDateRange(startDate, endDate)}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-[#7b728a]"><path d="m6 9 6 6 6-6" /></svg>
            </button>

            {showCalendar && renderCalendarPopover()}
          </div>

          {/* Quick Shift Next 7 days */}
          <button
            type="button"
            onClick={() => shiftDateRange(7)}
            aria-label="Next 7 days"
            title="Next 7 days"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d7d2e5] bg-white text-[#4a4852] shadow-sm transition hover:bg-[#f4f0f9] hover:text-[#2f2f36]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6" /></svg>
          </button>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[#d7d2e5] bg-white px-3 py-2 text-sm text-[#4a4852] outline-none focus:border-[#c5b9e8]"
          >
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 rounded-xl border border-[#e5def2] bg-[#f9f7fc] px-3.5 py-2 text-xs font-semibold text-[#4a4852] shadow-xs">
            <span className="text-[11px] uppercase font-bold text-[#7257aa]">Class Average:</span>
            <span className="font-bold text-[#2f2f36]">{classAttendanceAverage}%</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#d7d2e5] bg-white">
        <div className="overflow-x-auto min-h-[360px] pb-28">
          <table className="min-w-245 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#ece5f5] bg-[#f6f3fa] text-[11px] font-bold uppercase tracking-[0.12em] text-[#726b7b]">
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Student Name</th>
                {attendanceDates.map((date) => {
                  const { dayName, monthDay } = formatDateHeader(date);
                  return (
                    <th key={date} className="px-3 py-2 text-center min-w-[65px]">
                      <span className="block text-[10px] font-bold text-[#7b5fb0] uppercase tracking-wider">{dayName}</span>
                      <span className="block text-xs font-semibold text-[#2f2f36]">{monthDay}</span>
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-center">Percentage</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={attendanceDates.length + 5} className="py-8 text-center text-sm text-[#726d7d]">
                    No students enrolled in this section yet. Click &quot;Add Student&quot; to enroll learners.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, studentIndex) => (
                  <tr key={student.id} className="border-b border-[#f0eaef] text-sm text-[#2f2f36] last:border-b-0 hover:bg-[#faf7fd]/60 transition-colors">
                    <td className="px-4 py-3 font-semibold">{student.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6dff5] text-[11px] font-bold text-[#56439a]">
                          {student.name
                            .split(' ')
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                        <span>{student.name}</span>
                      </div>
                    </td>

                    {student.attendance.map((day, index) => {
                      const cellDate = day.date || attendanceDates[index] || '';
                      const status: AttendanceStatus = day.status || 'unmarked';
                      const isOpen = openAttendanceCell?.studentId === student.id && openAttendanceCell?.date === cellDate;
                      const isNearBottom = filteredStudents.length >= 5 && studentIndex >= filteredStudents.length - 2 && studentIndex >= 2;

                      return (
                        <td key={`${student.id}-${cellDate}-${index}`} className="px-3 py-3 text-center">
                          <div className="relative inline-flex items-center justify-center attendance-dropdown-wrapper">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenAttendanceCell(isOpen ? null : { studentId: student.id, date: cellDate });
                              }}
                              title={`Attendance for ${student.name} on ${formatDate(cellDate)}: ${status === 'unmarked' ? 'UNRECORDED (Click to mark)' : status.toUpperCase() + ' (Click to change)'}`}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer shadow-xs ${
                                status === 'present'
                                  ? 'bg-[#dff6ea] text-[#1a8d64] hover:bg-[#bdf0d4] ring-1 ring-[#1a8d64]/20'
                                  : status === 'late'
                                  ? 'bg-[#fef3c7] text-[#b45309] hover:bg-[#fde68a] ring-1 ring-[#b45309]/20'
                                  : status === 'excused'
                                  ? 'bg-[#e0e7ff] text-[#4338ca] hover:bg-[#c7d2fe] ring-1 ring-[#4338ca]/20'
                                  : status === 'absent'
                                  ? 'bg-[#fde5e4] text-[#d75353] hover:bg-[#fad0ce] ring-1 ring-[#d75353]/20'
                                  : 'bg-[#f8f6fc] text-[#9b94a7] hover:bg-[#ede7f5] hover:border-[#bdaed3] border border-dashed border-[#d8d0e5]'
                              }`}
                            >
                              {status === 'present' && <Icon type="check" className="h-3.5 w-3.5" />}
                              {status === 'late' && <Icon type="clock" className="h-3.5 w-3.5" />}
                              {status === 'excused' && <Icon type="shield" className="h-3.5 w-3.5" />}
                              {status === 'absent' && <Icon type="x" className="h-3.5 w-3.5" />}
                              {status === 'unmarked' && <span className="text-xs font-semibold leading-none text-[#9b94a7]">—</span>}
                            </button>

                            {/* Neo LMS Style Dropdown */}
                            {isOpen && (
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 z-50 w-38 rounded-xl border border-[#dcd3ea] bg-white p-1.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 ${
                                  isNearBottom ? 'bottom-full mb-2' : 'top-full mt-2'
                                }`}
                              >
                                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8b8496] border-b border-[#f0ebf7] mb-1 text-left">
                                  Mark Attendance
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenAttendanceCell(null);
                                    updateAttendanceStatus(student, cellDate, 'present');
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition text-left ${
                                    status === 'present' ? 'bg-[#dff6ea] text-[#1a8d64]' : 'text-[#2f2f36] hover:bg-[#f2fcf6]'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dff6ea] text-[#1a8d64]">
                                    <Icon type="check" className="h-3 w-3" />
                                  </span>
                                  <span>Present</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenAttendanceCell(null);
                                    updateAttendanceStatus(student, cellDate, 'absent');
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition text-left ${
                                    status === 'absent' ? 'bg-[#fde5e4] text-[#d75353]' : 'text-[#2f2f36] hover:bg-[#fef2f2]'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fde5e4] text-[#d75353]">
                                    <Icon type="x" className="h-3 w-3" />
                                  </span>
                                  <span>Absent</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenAttendanceCell(null);
                                    updateAttendanceStatus(student, cellDate, 'late');
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition text-left ${
                                    status === 'late' ? 'bg-[#fef3c7] text-[#b45309]' : 'text-[#2f2f36] hover:bg-[#fffbeb]'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fef3c7] text-[#b45309]">
                                    <Icon type="clock" className="h-3 w-3" />
                                  </span>
                                  <span>Late</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenAttendanceCell(null);
                                    updateAttendanceStatus(student, cellDate, 'excused');
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition text-left ${
                                    status === 'excused' ? 'bg-[#e0e7ff] text-[#4338ca]' : 'text-[#2f2f36] hover:bg-[#f0f4ff]'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e0e7ff] text-[#4338ca]">
                                    <Icon type="shield" className="h-3 w-3" />
                                  </span>
                                  <span>Excused</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenAttendanceCell(null);
                                    updateAttendanceStatus(student, cellDate, 'unmarked');
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition text-left border-t border-[#f0ebf7] mt-1 pt-1.5 ${
                                    status === 'unmarked' ? 'bg-[#f4f0f9] text-[#5e5868]' : 'text-[#7a7485] hover:bg-[#f8f6fc]'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ede7f5] text-[#7a7485] text-xs font-bold">
                                    —
                                  </span>
                                  <span>Clear (Empty)</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {(() => {
                      const att = getStudentAttendanceMetrics(student, attendanceDates);
                      return (
                        <>
                          <td className="px-4 py-3 text-center font-semibold text-[#2f2f36]">
                            {att.hasRecords ? `${att.percentage}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                !att.hasRecords
                                  ? 'bg-slate-100 text-slate-500'
                                  : att.status === 'Excellent'
                                    ? 'bg-[#dff6ea] text-[#1a8d64]'
                                    : att.status === 'Good'
                                      ? 'bg-[#e8f6f1] text-[#2b7d68]'
                                      : 'bg-[#fde7c8] text-[#c77219]'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                        </>
                      );
                    })()}
                    <td className="px-4 py-3 text-center">
                      <select
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'remove') {
                            openModal({
                              kind: 'student',
                              action: 'delete',
                              studentId: student.id,
                              studentUserId: student.userId,
                              currentName: student.name,
                            });
                          }
                        }}
                        aria-label={`Action for ${student.name}`}
                        className="rounded-xl border border-[#d7d2e5] bg-white px-3 py-1.5 text-xs font-semibold text-[#4a4852] outline-none transition hover:border-[#9b80d1] focus:border-[#7257aa] cursor-pointer shadow-sm"
                      >
                        <option value="" disabled>Action</option>
                        <option value="remove" className="text-[#dc2626]">Remove (Delete)</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-[#756d7c] sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {filteredStudents.length} of {selectedSection?.students.length ?? 0} students</span>

        <div className="flex items-center gap-2">
          <button type="button" className="h-8 w-8 rounded-lg border border-[#d7d2e5] bg-white text-[#434150]">&lt;</button>
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              type="button"
              className={`h-8 w-8 rounded-lg ${page === 1 ? 'bg-[#7257aa] text-white' : 'border border-[#d7d2e5] bg-white text-[#434150]'}`}
            >
              {page}
            </button>
          ))}
          <button type="button" className="h-8 w-8 rounded-lg border border-[#d7d2e5] bg-white text-[#434150]">&gt;</button>
        </div>
      </div>
    </>
  );

  const renderAssessmentsView = () => (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Icon type="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b728a]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search students..."
            className="w-full rounded-xl border border-[#d7d2e5] bg-white py-2.5 pl-10 pr-3 text-sm text-[#2f2f36] outline-none placeholder:text-[#8a8597] focus:border-[#c5b9e8]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#d7d2e5] bg-white px-3 py-2.5 text-sm text-[#4a4852]">
            <Icon type="calendar" className="h-4 w-4" />
            <span>{assessmentColumns.length ? `${assessmentColumns.length} recorded activities` : 'No recorded activities'}</span>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-[#d7d2e5] bg-white px-3 py-2.5 text-sm text-[#4a4852] outline-none focus:border-[#c5b9e8]"
          >
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#d7d2e5] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-225 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#ece5f5] bg-[#f6f3fa] text-[11px] font-bold uppercase tracking-[0.12em] text-[#726b7b]">
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Student Name</th>
                {assessmentColumns.map((assessment) => <th key={assessment.id} className="px-4 py-3 text-center">{assessment.title}<br /><span className="font-normal normal-case">/{assessment.maxScore ?? 100}</span></th>)}
                <th className="px-4 py-3 text-center">Average</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={assessmentColumns.length + 5} className="py-8 text-center text-sm text-[#726d7d]">
                    No students enrolled in this section yet.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, studentIndex) => {
                  return (
                    <tr key={student.id} className="border-b border-[#f0eaef] text-sm text-[#2f2f36] last:border-b-0 hover:bg-[#faf7fd]/60 transition-colors">
                      <td className="px-4 py-3 font-semibold">{student.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6dff5] text-[11px] font-bold text-[#56439a]">
                            {student.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}
                          </span>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      {assessmentColumns.map((assessment) => {
                        const savedAssessment = student.assessments.find((item) => item.id === assessment.id);
                        const score = savedAssessment?.percentage;
                        const scoreTone = score === undefined ? 'bg-[#f3edf9] text-[#756d7c]' : score >= 90 ? 'bg-[#dff6ea] text-[#1a8d64]' : score >= 75 ? 'bg-[#e8f6f1] text-[#2b7d68]' : 'bg-[#fde7c7] text-[#c77219]';
                        return <td key={`${student.id}-assessment-${assessment.id}`} className="px-4 py-3 text-center">
                          <span className={`inline-flex min-w-12 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${scoreTone}`}>
                            {score === undefined ? '-' : `${score}%`}
                          </span>
                          {savedAssessment?.score !== undefined && <span className="mt-1 block text-[10px] text-[#756d7c]">{savedAssessment.score}/{savedAssessment.maxScore ?? assessment.maxScore ?? 100}</span>}
                        </td>
                      })}
                      <td className="px-4 py-3 text-center font-semibold">{student.percentage}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${student.status === 'Excellent' ? 'bg-[#dff6ea] text-[#1a8d64]' : student.status === 'Good' ? 'bg-[#e8f6f1] text-[#2b7d68]' : 'bg-[#fde7c8] text-[#c77219]'}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'remove') {
                              openModal({
                                kind: 'student',
                                action: 'delete',
                                studentId: student.id,
                                studentUserId: student.userId,
                                currentName: student.name,
                              });
                            }
                          }}
                          aria-label={`Action for ${student.name}`}
                          className="rounded-xl border border-[#d7d2e5] bg-white px-3 py-1.5 text-xs font-semibold text-[#4a4852] outline-none transition hover:border-[#9b80d1] focus:border-[#7257aa] cursor-pointer shadow-sm"
                        >
                          <option value="" disabled>Action</option>
                          <option value="remove" className="text-[#dc2626]">Remove (Delete)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-[#756d7c] sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {filteredStudents.length} of {selectedSection?.students.length ?? 0} students</span>
        <div className="flex items-center gap-2">
          <button type="button" className="h-8 w-8 rounded-lg border border-[#d7d2e5] bg-white text-[#434150]">&lt;</button>
          {[1, 2, 3, 4].map((page) => (
            <button key={page} type="button" className={`h-8 w-8 rounded-lg ${page === 1 ? 'bg-[#7257aa] text-white' : 'border border-[#d7d2e5] bg-white text-[#434150]'}`}>{page}</button>
          ))}
          <button type="button" className="h-8 w-8 rounded-lg border border-[#d7d2e5] bg-white text-[#434150]">&gt;</button>
        </div>
      </div>
    </>
  );

  const renderBadgesView = () => (
    <div className="rounded-2xl border border-[#d8d0e7] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#7b5fb0]">Student awards</p>
          <h3 className="mt-1 text-xl font-bold text-[#2f2f36]">Badge overview</h3>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {badgeSummaries.map((badge) => (
          <div key={badge.name} className="rounded-2xl border border-[#ecdef6] bg-[#faf7ff] p-4">
            <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.tone}`}>
              {badge.name}
            </div>
            <p className="mt-4 text-3xl font-bold text-[#2d2b33]">{badge.count}</p>
            <p className="mt-1 text-xs text-[#726d7d]">students currently hold this award</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e8dff1] px-3 py-4 lg:px-5 lg:py-5">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7257aa]">Teacher Workspace</p>
            <h1 className="font-heading text-4xl font-bold text-[#2f2f36]">Class Record</h1>
            <p className="mt-2 text-sm text-[#5c5a63]">View and manage class records, attendance, assessments, and badges.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7d1e5] bg-white px-4 py-2.5 text-sm font-semibold text-[#31313a] shadow-sm transition hover:bg-[#f8f5fb] cursor-pointer hover:border-[#9b80d1]"
          >
            <Icon type="download" className="h-4 w-4 text-[#7257aa]" />
            Export Report
          </button>
        </header>

        <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[20px] border border-[#d7d2e5] bg-[#f2edf7] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-[1.05rem] font-bold text-[#2f2f36]">Classes &amp; Sections</h2>
              <button type="button" onClick={() => openModal({ kind: 'class', action: 'add' })} aria-label="Add class" title="Add class" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5d43a0] transition hover:bg-[#e8def5]">
                <Icon type="plus" className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-5 text-sm text-[#6e6978]">Select a class to view students</p>

            <div className="space-y-2">
              {classGroups.map((classGroup, index) => {
                const isSelected = classGroup.name === selectedClassName;
                return (
                  <div key={classGroup.name} className={`rounded-xl ${isSelected ? 'bg-[#f3eff9] shadow-inner' : 'bg-transparent'}`}>
                    <div className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition ${isSelected ? 'text-[#2f2f36]' : 'text-[#4c4853] hover:bg-[#efeaf9]'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassName(classGroup.name);
                          if (classGroup.sections[0]) {
                            setSelectedSectionId(classGroup.sections[0].id);
                          }
                        }}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f3e7b3] text-[11px] font-bold text-[#8b5b1b]">
                          {index + 1}
                        </span>
                        <span className="text-[15px] font-semibold">{classGroup.name}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#6c6774]">{classGroup.totalCount}</span>
                        <button type="button" onClick={(event) => { event.stopPropagation(); openModal({ kind: 'class', action: 'edit', className: classGroup.name, currentName: classGroup.name }); }} aria-label={`Edit ${classGroup.name}`} title="Edit class" className="flex h-7 w-7 items-center justify-center rounded-md text-[#756b82] transition hover:bg-[#e8def5] hover:text-[#5d43a0]">
                          <Icon type="edit" className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); openModal({ kind: 'class', action: 'delete', className: classGroup.name, currentName: classGroup.name }); }} aria-label={`Delete ${classGroup.name}`} title="Delete class" className="flex h-7 w-7 items-center justify-center rounded-md text-[#a66b78] transition hover:bg-[#f8e2e5] hover:text-[#a33f50]">
                          <Icon type="trash" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="ml-8 space-y-1 pb-2 pt-1">
                        <div className="flex items-center justify-between px-2 pb-1">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#817889]">Sections</span>
                          <button type="button" onClick={() => openModal({ kind: 'section', action: 'add', className: classGroup.name })} aria-label={`Add section to ${classGroup.name}`} title="Add section" className="flex h-7 w-7 items-center justify-center rounded-md text-[#5d43a0] transition hover:bg-[#e8def5]"><Icon type="plus" className="h-3.5 w-3.5" /></button>
                        </div>
                        {classGroup.sections.map((section) => {
                          const isSectionActive = section.id === selectedSectionId;
                          return (
                            <div key={section.id} className={`flex items-center justify-between gap-1 rounded-md px-2 py-1.5 text-sm transition ${isSectionActive ? 'bg-[#e5dcf4] font-semibold text-[#2f2f36]' : 'text-[#5d5a62] hover:bg-[#eae2f7]'}`}>
                              <button
                                type="button"
                                onClick={() => setSelectedSectionId(section.id)}
                                className="min-w-0 flex-1 truncate text-left"
                              >
                                <span>{section.name}</span>
                              </button>
                              <span className="text-xs text-[#6d6974]">{section.count}</span>
                              <button type="button" onClick={() => openModal({ kind: 'section', action: 'edit', className: classGroup.name, sectionId: section.id, currentName: section.name })} aria-label={`Edit ${section.name}`} title="Edit section" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#756b82] transition hover:bg-[#e8def5] hover:text-[#5d43a0]"><Icon type="edit" className="h-3.5 w-3.5" /></button>
                              <button type="button" onClick={() => openModal({ kind: 'section', action: 'delete', className: classGroup.name, sectionId: section.id, currentName: section.name })} aria-label={`Delete ${section.name}`} title="Delete section" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#a66b78] transition hover:bg-[#f8e2e5] hover:text-[#a33f50]"><Icon type="trash" className="h-3.5 w-3.5" /></button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="rounded-[20px] border border-[#d7d2e5] bg-[#f2edf7] p-4 md:p-5">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d9d1ea] bg-[#f5f0fb] text-[#5d43a0]">
                  <Icon type="folder" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[1.05rem] font-bold text-[#2f2f36]">
                    {selectedClass ? (selectedSection ? `${selectedClass.name} - ${selectedSection.name}` : selectedClass.name) : 'No class selected'}
                  </h2>
                  <p className="text-sm text-[#6c6975]">{selectedSection?.students?.length ?? 0} students enrolled</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['Attendance', 'Assessments', 'Badges'] as ViewMode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveView(item)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${activeView === item
                        ? 'border-[#bfaee6] bg-[#7257aa] text-white shadow-sm'
                        : 'border-[#d7d2e5] bg-white text-[#4a4852] hover:bg-[#f4f0f9]'
                      }`}
                  >
                    {item}
                  </button>
                ))}
                <button type="button" onClick={() => openModal({ kind: 'student', action: 'add' })} className="inline-flex items-center gap-2 rounded-xl border border-[#bfaee6] bg-white px-3 py-2 text-sm font-semibold text-[#5d43a0] transition hover:bg-[#f4f0f9]">
                  <Icon type="plus" className="h-4 w-4" />
                  Add Student
                </button>
              </div>
            </div>

            {activeView === 'Attendance' && renderAttendanceView()}
            {activeView === 'Assessments' && renderAssessmentsView()}
            {activeView === 'Badges' && renderBadgesView()}
          </section>
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241d2d]/45 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <form onSubmit={handleModalSubmit} className="w-full max-w-md rounded-2xl border border-[#ddd3e8] bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="class-record-modal-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="class-record-modal-title" className="text-lg font-bold text-[#2f2f36]">
                  {modal.kind === 'student'
                    ? modal.action === 'delete'
                      ? 'Remove Student'
                      : 'Add Student'
                    : modal.action === 'delete'
                      ? `Delete ${modal.kind}`
                      : `${modal.action === 'add' ? 'Add' : 'Edit'} ${modal.kind}`}
                </h2>
                <p className="mt-1 text-sm text-[#6e6978]">
                  {modal.kind === 'student' && modal.action === 'delete'
                    ? `Are you sure you want to remove "${modal.currentName}" from this section?`
                    : modal.kind === 'student'
                      ? `Select a student to enroll in ${selectedClass?.name || 'class'} - ${selectedSection?.name || 'section'}.`
                      : modal.action === 'delete'
                        ? `Are you sure you want to delete "${modal.currentName}"?`
                        : `Enter the details for this ${modal.kind}.`}
                </p>
              </div>
              <button type="button" onClick={() => setModal(null)} aria-label="Close modal" title="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#756b82] hover:bg-[#f2edf7]"><Icon type="x" className="h-4 w-4" /></button>
            </div>
            {modal.kind === 'student' && modal.action === 'add' ? (
              <div className="mt-5">
                <div className="relative">
                  <Icon type="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b728a]" />
                  <input autoFocus value={modalName} onChange={(event) => setModalName(event.target.value)} placeholder="Search students..." className="w-full rounded-xl border border-[#d7d2e5] bg-white py-2.5 pl-10 pr-3 text-sm text-[#2f2f36] outline-none placeholder:text-[#8a8597] focus:border-[#9b80d1]" />
                </div>
                <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-[#e5deed]">
                  {availableStudents.length > 0 ? availableStudents.map((student) => (
                    <button key={student.id} type="button" onClick={() => setModalStudentId(student.id)} className={`flex w-full items-center gap-3 border-b border-[#eee9f2] px-3 py-3 text-left last:border-b-0 ${modalStudentId === student.id ? 'bg-[#f1ebfa]' : 'bg-white hover:bg-[#faf7fd]'}`}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6dff5] text-xs font-bold text-[#56439a]">{student.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#2f2f36]">{student.name}</span><span className="block truncate text-xs text-[#756d7c]">{student.id}</span></span>
                      {modalStudentId === student.id && <Icon type="check" className="h-5 w-5 text-[#5d43a0]" />}
                    </button>
                  )) : <p className="p-6 text-center text-sm text-[#756d7c]">No students available to enroll.</p>}
                </div>
              </div>
            ) : modal.action !== 'delete' && (
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-[#4a4852]">Name
                  <input autoFocus value={modalName} onChange={(event) => setModalName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d7d2e5] px-3 py-2.5 text-sm font-normal text-[#2f2f36] outline-none focus:border-[#9b80d1]" />
                </label>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[#d7d2e5] px-4 py-2.5 text-sm font-semibold text-[#4a4852] hover:bg-[#f7f4fa]">Cancel</button>
              <button
                type="submit"
                disabled={modal.kind === 'student' && modal.action === 'add' && !modalStudentId}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                  modal.action === 'delete' ? 'bg-[#dc2626] hover:bg-[#b91c1c]' : 'bg-[#7257aa] hover:bg-[#5d4694]'
                }`}
              >
                {modal.action === 'delete' ? (modal.kind === 'student' ? 'Remove Student' : 'Delete') : modal.kind === 'student' ? 'Enroll Student' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#241d2d]/45 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowExportModal(false); }}>
          <div className="w-full max-w-2xl rounded-2xl border border-[#ddd3e8] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
            <div className="flex items-start justify-between gap-4 border-b border-[#f0ebf7] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6dff5] text-[#56439a]">
                    <Icon type="download" className="h-5 w-5" />
                  </span>
                  <h2 id="export-modal-title" className="text-xl font-bold text-[#2f2f36]">
                    Export Class Record &amp; Reports
                  </h2>
                </div>
                <p className="mt-1 text-sm text-[#6e6978]">
                  Select an export format for <strong className="text-[#2f2f36]">{selectedClass?.name || 'Class'} - {selectedSection?.name || 'Section'}</strong> ({selectedSection?.students?.length ?? 0} enrolled students).
                </p>
              </div>
              <button type="button" onClick={() => setShowExportModal(false)} aria-label="Close modal" title="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#756b82] hover:bg-[#f2edf7]">
                <Icon type="x" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-xl border border-[#dcd3ea] bg-[#faf8fc] p-4 transition hover:border-[#9b80d1] hover:bg-white hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dff6ea] text-[#1a8d64]">
                      <Icon type="table" className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-[#e8f6f1] px-2.5 py-0.5 text-[11px] font-bold text-[#2b7d68]">
                      CSV Spreadsheet
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#2f2f36]">Master Class Record</h3>
                  <p className="mt-1 text-xs text-[#6e6978] leading-relaxed">
                    Complete summary with student IDs, attendance rates, all assessment grades, and overall final performance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportMasterCsv}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7257aa] py-2.5 text-xs font-bold text-white transition hover:bg-[#5d4694] cursor-pointer"
                >
                  <Icon type="download" className="h-3.5 w-3.5" />
                  Download Master CSV
                </button>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-[#dcd3ea] bg-[#faf8fc] p-4 transition hover:border-[#9b80d1] hover:bg-white hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8e4ff] text-[#6b52bd]">
                      <Icon type="calendar" className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-[#f1ebfa] px-2.5 py-0.5 text-[11px] font-bold text-[#5d43a0]">
                      CSV Spreadsheet
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#2f2f36]">Attendance Sheet Log</h3>
                  <p className="mt-1 text-xs text-[#6e6978] leading-relaxed">
                    Date-by-date breakdown ({formatDateRange(startDate, endDate)}) with Present, Absent, Late, and Excused records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportAttendanceCsv}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7257aa] py-2.5 text-xs font-bold text-white transition hover:bg-[#5d4694] cursor-pointer"
                >
                  <Icon type="download" className="h-3.5 w-3.5" />
                  Download Attendance CSV
                </button>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-[#dcd3ea] bg-[#faf8fc] p-4 transition hover:border-[#9b80d1] hover:bg-white hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff0da] text-[#d77a17]">
                      <Icon type="file-text" className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-[#fff4e5] px-2.5 py-0.5 text-[11px] font-bold text-[#b45309]">
                      CSV Spreadsheet
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#2f2f36]">Assessments &amp; Scores</h3>
                  <p className="mt-1 text-xs text-[#6e6978] leading-relaxed">
                    Detailed points earned, total max scores, and percentage grades for all class activities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportAssessmentsCsv}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7257aa] py-2.5 text-xs font-bold text-white transition hover:bg-[#5d4694] cursor-pointer"
                >
                  <Icon type="download" className="h-3.5 w-3.5" />
                  Download Grades CSV
                </button>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-[#dcd3ea] bg-[#faf8fc] p-4 transition hover:border-[#9b80d1] hover:bg-white hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e0f4ea] text-[#16a34a]">
                      <Icon type="printer" className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-[#dff6ea] px-2.5 py-0.5 text-[11px] font-bold text-[#167a56]">
                      Print / PDF
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#2f2f36]">Official Summary Sheet</h3>
                  <p className="mt-1 text-xs text-[#6e6978] leading-relaxed">
                    Formatted landscape print sheet with institutional header, metadata cards, and official table.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] py-2.5 text-xs font-bold text-white transition hover:bg-[#15803d] cursor-pointer"
                >
                  <Icon type="printer" className="h-3.5 w-3.5" />
                  Print / Save as PDF
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end border-t border-[#f0ebf7] pt-4">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-xl border border-[#d7d2e5] px-4 py-2 text-sm font-semibold text-[#4a4852] hover:bg-[#f7f4fa]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
