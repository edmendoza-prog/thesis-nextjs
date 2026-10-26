'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import UserAvatar from '@/app/components/UserAvatar';

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
  email?: string;
  avatarSeed?: string;
  lifeSpan?: number;
  hearts?: number;
  createdAt?: string;
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

type ViewMode = 'Attendance' | 'Assessments';
type ModalState = {
  kind: 'class' | 'section' | 'student';
  action: 'add' | 'edit' | 'delete';
  className?: string;
  sectionId?: string;
  studentId?: string;
  studentUserId?: number;
  currentName?: string;
  currentSection?: string;
};

const classOptions = [
  'All Status',
  'Excellent',
  'Good',
  'Needs Improvement',
];

function Icon({ type, className = 'h-5 w-5' }: { type: string; className?: string }) {
  switch (type) {
    case 'folder':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l1.5 2H18.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" /></svg>;
    case 'search':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></svg>;
    case 'calendar':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case 'check':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12.5 9.5 17 19 7.5" /></svg>;
    case 'x':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case 'clock':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case 'shield':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'download':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3v12" /><path d="m7 20 5 5 5-5" /><path d="M3 20h18" /></svg>;
    case 'file-text':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
    case 'printer':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>;
    case 'table':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>;
    case 'plus':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14" /></svg>;
    case 'trash':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" /></svg>;
    case 'users':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'arrow-left':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6" /></svg>;
    case 'arrow-right':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6 6-6" /></svg>;
    case 'award':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>;
    case 'sparkles':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;
    case 'user':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case 'heart':
      return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
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

function ClassRecordContent() {
  const searchParams = useSearchParams();
  const queryClass = searchParams?.get('class') || '';
  const querySection = searchParams?.get('section') || '';

  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [selectedClassName, setSelectedClassName] = useState(queryClass);
  const [selectedSectionId, setSelectedSectionId] = useState(querySection);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [activeView, setActiveView] = useState<ViewMode>('Attendance');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalStudentId, setModalStudentId] = useState('');
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [availableStudentDirectory, setAvailableStudentDirectory] = useState<StudentRecord[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Right-click context menu and student profile modal
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    student: StudentRecord;
  } | null>(null);
  const [profileModalStudent, setProfileModalStudent] = useState<StudentRecord | null>(null);
  const [profileModalTab, setProfileModalTab] = useState<'overview' | 'assessments' | 'attendance'>('overview');

  const handleStudentContextMenu = (e: React.MouseEvent, student: StudentRecord) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 240;
    const menuHeight = 180;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
    setContextMenu({ x, y, student });
  };

  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClose);
      window.addEventListener('contextmenu', handleClose);
      window.addEventListener('scroll', handleClose, true);
      return () => {
        window.removeEventListener('click', handleClose);
        window.removeEventListener('contextmenu', handleClose);
        window.removeEventListener('scroll', handleClose, true);
      };
    }
  }, [contextMenu]);

  // Calendar State
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

    rows.push(['OFFICIAL MASTER CLASS RECORD & GRADE REPORT']);
    rows.push(['Institution', 'Department of Education / Academic Portal']);
    rows.push(['Class Level', selectedClass.name]);
    rows.push(['Section Name', selectedSection.name]);
    rows.push(['Reporting Period', formatDateRange(startDate, endDate)]);
    rows.push(['Total Enrolled Learners', students.length]);
    rows.push(['Class Attendance Average', `${classAttendanceAverage}%`]);
    rows.push(['Class Grade Average', `${classGradeAverage}%`]);
    rows.push(['Generated On', new Date().toLocaleString()]);
    rows.push([]);

    const header = ['Student LRN/ID', 'Learner Full Name', 'Attendance Rate (%)', 'Present', 'Absent', 'Late', 'Excused'];
    assessmentColumns.forEach((col) => {
      header.push(`${col.title} (Score)`);
      header.push(`${col.title} (%)`);
    });
    header.push('Final Grade Equivalent (%)');
    header.push('Academic Status');
    rows.push(header);

    students.forEach((student) => {
      const presentCount = student.attendance.filter(a => a.status === 'present').length;
      const absentCount = student.attendance.filter(a => a.status === 'absent').length;
      const lateCount = student.attendance.filter(a => a.status === 'late').length;
      const excusedCount = student.attendance.filter(a => a.status === 'excused').length;
      const attMetrics = getStudentAttendanceMetrics(student, attendanceDates);

      const row: (string | number)[] = [
        student.id,
        student.name,
        attMetrics.hasRecords ? `${attMetrics.percentage}%` : '—',
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

    rows.push(['OFFICIAL ATTENDANCE LOG REPORT']);
    rows.push(['Class Level', selectedClass.name]);
    rows.push(['Section Name', selectedSection.name]);
    rows.push(['Date Range', formatDateRange(startDate, endDate)]);
    rows.push(['Enrolled Learners', students.length]);
    rows.push(['Class Attendance Average', `${classAttendanceAverage}%`]);
    rows.push(['Generated On', new Date().toLocaleString()]);
    rows.push([]);

    const header = ['Student ID', 'Learner Name'];
    attendanceDates.forEach((dateStr) => {
      const { dayName, monthDay } = formatDateHeader(dateStr);
      header.push(`${dayName} ${monthDay} (${dateStr})`);
    });
    header.push('Present Total');
    header.push('Absent Total');
    header.push('Late Total');
    header.push('Excused Total');
    header.push('Attendance Rate (%)');
    rows.push(header);

    students.forEach((student) => {
      const row: (string | number)[] = [student.id, student.name];

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      attendanceDates.forEach((dateStr) => {
        const record = student.attendance.find(a => a.date === dateStr);
        const st = record?.status || 'unmarked';
        if (st === 'present') presentCount++;
        else if (st === 'absent') absentCount++;
        else if (st === 'late') lateCount++;
        else if (st === 'excused') excusedCount++;

        row.push(st === 'unmarked' ? '—' : st.toUpperCase());
      });

      const metrics = getStudentAttendanceMetrics(student, attendanceDates);
      row.push(presentCount);
      row.push(absentCount);
      row.push(lateCount);
      row.push(excusedCount);
      row.push(metrics.hasRecords ? `${metrics.percentage}%` : '—');

      rows.push(row);
    });

    const safeClassName = selectedClass.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSectionName = selectedSection.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadCsv(`Attendance_Log_${safeClassName}_${safeSectionName}_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    setShowExportModal(false);
  };

  const handleExportAssessmentsCsv = () => {
    if (!selectedClass || !selectedSection) return;
    const students = selectedSection.students || [];
    const rows: (string | number)[][] = [];

    rows.push(['ASSESSMENT & ACTIVITY GRADES REPORT']);
    rows.push(['Class Level', selectedClass.name]);
    rows.push(['Section Name', selectedSection.name]);
    rows.push(['Total Graded Items', assessmentColumns.length]);
    rows.push(['Enrolled Learners', students.length]);
    rows.push(['Class Grade Average', `${classGradeAverage}%`]);
    rows.push(['Generated On', new Date().toLocaleString()]);
    rows.push([]);

    const header = ['Student ID', 'Learner Full Name'];
    assessmentColumns.forEach((col) => {
      header.push(`${col.title} (Score)`);
      header.push(`${col.title} (Max)`);
      header.push(`${col.title} (%)`);
    });
    header.push('Average Grade (%)');
    header.push('Performance Level');
    rows.push(header);

    students.forEach((student) => {
      const row: (string | number)[] = [student.id, student.name];

      assessmentColumns.forEach((col) => {
        const assessment = student.assessments.find(a => a.id === col.id);
        if (assessment && assessment.score !== undefined) {
          row.push(assessment.score);
          row.push(assessment.maxScore ?? col.maxScore ?? 100);
          row.push(`${assessment.percentage}%`);
        } else {
          row.push('—');
          row.push(col.maxScore ?? 100);
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
    const className = selectedClass.name;
    const sectionName = selectedSection.name;

    const printWindow = window.open('', '_blank', 'width=1200,height=880');
    if (!printWindow) {
      alert('Please allow popups to open official print report.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Official Master Class Record - ${className} (${sectionName})</title>
          <style>
            @page {
              size: landscape;
              margin: 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 24px;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-banner {
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 14px;
              margin-bottom: 18px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .org-title {
              font-size: 20px;
              font-weight: 800;
              color: #1e1b4b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .org-sub {
              font-size: 11px;
              color: #64748b;
              margin-top: 3px;
              font-weight: 600;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 20px;
            }
            .meta-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px 14px;
            }
            .meta-box .label {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
              letter-spacing: 0.05em;
            }
            .meta-box .val {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 7px 10px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              color: #334155;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.04em;
            }
            .center { text-align: center; }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-weight: 700;
              font-size: 9px;
              text-transform: uppercase;
            }
            .badge-excellent { background: #dcfce7; color: #166534; }
            .badge-good { background: #e0f2fe; color: #0369a1; }
            .badge-needs { background: #fef3c7; color: #92400e; }
            .footer-signatures {
              margin-top: 36px;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            .sig-line {
              border-top: 1px solid #0f172a;
              margin-top: 40px;
              padding-top: 6px;
              text-align: center;
              font-size: 11px;
              font-weight: 700;
              color: #334155;
            }
            .sig-title {
              font-size: 10px;
              color: #64748b;
              text-align: center;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="org-title">Official Master Class Record &amp; Grade Report</div>
              <div class="org-sub">Institutional Learning Management System · Academic Term 2025–2026</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #475569;">
              <strong>Date Issued:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <div class="label">Class &amp; Section</div>
              <div class="val">${className} · ${sectionName}</div>
            </div>
            <div class="meta-box">
              <div class="label">Reporting Period</div>
              <div class="val">${formatDateRange(startDate, endDate)}</div>
            </div>
            <div class="meta-box">
              <div class="label">Total Enrolled</div>
              <div class="val">${students.length} Learners</div>
            </div>
            <div class="meta-box">
              <div class="label">Section Grade Average</div>
              <div class="val">${classGradeAverage}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="center" style="width: 30px;">#</th>
                <th style="width: 95px;">LRN / Student ID</th>
                <th>Learner Full Name</th>
                <th class="center" style="width: 85px;">Attendance</th>
                ${assessmentColumns.map(col => `<th class="center">${col.title} <span style="font-weight: normal; color: #64748b;">(${col.maxScore ?? 100}p)</span></th>`).join('')}
                <th class="center" style="width: 85px;">Average</th>
                <th class="center" style="width: 110px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${students.length === 0 ? `
                <tr>
                  <td colspan="${assessmentColumns.length + 6}" class="center" style="padding: 24px; color: #64748b;">
                    No learners currently enrolled in this section.
                  </td>
                </tr>
              ` : students.map((st, i) => {
                const badgeClass = st.status === 'Excellent' ? 'badge-excellent' : st.status === 'Good' ? 'badge-good' : 'badge-needs';
                const att = getStudentAttendanceMetrics(st, attendanceDates);
                return `
                  <tr>
                    <td class="center" style="color: #64748b;">${i + 1}</td>
                    <td style="font-family: monospace; font-weight: 700;">${st.id}</td>
                    <td style="font-weight: 600;">${st.name}</td>
                    <td class="center"><strong>${att.hasRecords ? `${att.percentage}%` : '—'}</strong></td>
                    ${assessmentColumns.map(col => {
                      const sc = st.assessments.find(a => a.id === col.id);
                      return `<td class="center">${sc?.score !== undefined ? `<strong>${sc.score}</strong> <span style="color:#64748b; font-size:10px;">(${sc.percentage}%)</span>` : '<span style="color:#cbd5e1;">—</span>'}</td>`;
                    }).join('')}
                    <td class="center"><strong>${st.percentage}%</strong></td>
                    <td class="center"><span class="badge ${badgeClass}">${st.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer-signatures">
            <div>
              <div class="sig-line">Class Adviser / Subject Teacher</div>
              <div class="sig-title">Signature over Printed Name</div>
            </div>
            <div>
              <div class="sig-line">Department Head / Academic Coordinator</div>
              <div class="sig-title">Verified and Reviewed</div>
            </div>
            <div>
              <div class="sig-line">School Principal / Registrar</div>
              <div class="sig-title">Official Approval</div>
            </div>
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

  const loadClassRecords = async (
    sDate = startDate,
    eDate = endDate,
    preferredClassName?: string,
    preferredSectionId?: string
  ) => {
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
        let nextClassName = preferredClassName;
        if (!nextClassName) {
          const exists = groups.some((g) => g.name === selectedClassName);
          nextClassName = exists ? selectedClassName : groups[0].name;
        } else {
          const exists = groups.some((g) => g.name === nextClassName);
          if (!exists) nextClassName = groups[0].name;
        }

        const currentGroup = groups.find((g) => g.name === nextClassName) || groups[0];
        setSelectedClassName(currentGroup.name);

        let nextSecId = preferredSectionId;
        if (!nextSecId) {
          const secExists = currentGroup.sections.some((s) => s.id === selectedSectionId);
          nextSecId = secExists ? selectedSectionId : (currentGroup.sections[0]?.id ?? '');
        } else {
          const secExists = currentGroup.sections.some((s) => s.id === nextSecId);
          if (!secExists) nextSecId = currentGroup.sections[0]?.id ?? '';
        }
        setSelectedSectionId(nextSecId);
      } else {
        setSelectedClassName('');
        setSelectedSectionId('');
      }
    } catch (error) {
      console.error('Class records fetch error:', error);
    }
  };

  useEffect(() => {
    loadClassRecords(startDate, endDate, queryClass || undefined, querySection || undefined);
  }, [queryClass, querySection]);

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

  const classAttendanceAverage = useMemo(() => {
    if (!selectedSection || selectedSection.students.length === 0) return 0;
    const enrolledStudents = selectedSection.students;
    const studentMetrics = enrolledStudents.map((student) => getStudentAttendanceMetrics(student, attendanceDates));
    const validStudents = studentMetrics.filter((m) => m.hasRecords);
    if (validStudents.length === 0) return 100;
    const sum = validStudents.reduce((acc, m) => acc + m.percentage, 0);
    return Number((sum / validStudents.length).toFixed(1));
  }, [selectedSection, attendanceDates]);

  const classGradeAverage = useMemo(() => {
    if (!selectedSection || selectedSection.students.length === 0) return 0;
    const enrolledStudents = selectedSection.students;
    const sum = enrolledStudents.reduce((acc, s) => acc + (s.percentage || 0), 0);
    return Number((sum / enrolledStudents.length).toFixed(1));
  }, [selectedSection]);

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
    loadClassRecords(newStart, newEnd, selectedClassName, selectedSectionId);
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

  const handleMarkAllPresent = async () => {
    if (!selectedSection || selectedSection.students.length === 0 || attendanceDates.length === 0) return;
    setIsMarkingAll(true);

    const updates: Array<{ studentId: number; date: string; status: 'present' }> = [];

    // Optimistic batch update
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
                const nextAttendance = st.attendance.map((day) => {
                  if (day.date && attendanceDates.includes(day.date)) {
                    const stId = st.userId ?? Number(st.id);
                    if (stId) {
                      updates.push({ studentId: stId, date: day.date, status: 'present' });
                    }
                    return { ...day, status: 'present' as AttendanceStatus, attended: true };
                  }
                  return day;
                });
                return {
                  ...st,
                  attendance: nextAttendance,
                  status: 'Excellent' as const,
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
          action: 'bulk-save-attendance',
          classId: Number(selectedSection.id),
          updates,
        }),
      });
    } catch (err) {
      console.error('Failed to bulk mark present:', err);
    } finally {
      setIsMarkingAll(false);
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
        await loadClassRecords(startDate, endDate, selectedClassName, selectedSectionId);
      }
      setModal(null);
      return;
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
      <div className="absolute right-0 sm:left-0 top-full z-50 mt-2 w-[340px] sm:w-[380px] rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Presets */}
        <div className="mb-3.5 flex flex-wrap gap-1.5 border-b border-slate-100 pb-3.5">
          {[
            { label: 'Today', key: 'today' as const },
            { label: 'This Week', key: 'this-week' as const },
            { label: 'Last 7 Days', key: 'last-7' as const },
            { label: 'Last 14 Days', key: 'last-14' as const },
            { label: 'This Month', key: 'this-month' as const },
          ].map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setPreset(preset.key)}
              className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
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
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 cursor-pointer"
          >
            <Icon type="arrow-left" className="h-4 w-4" />
          </button>
          <span className="text-sm font-extrabold text-slate-900">{monthName}</span>
          <button
            type="button"
            onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 cursor-pointer"
          >
            <Icon type="arrow-right" className="h-4 w-4" />
          </button>
        </div>

        {/* Week Day Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
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
                className={`relative flex h-8 w-full items-center justify-center rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isStart || isEnd
                    ? 'bg-indigo-600 font-extrabold text-white shadow-sm'
                    : inRange
                    ? 'bg-indigo-50 font-bold text-indigo-700'
                    : cell.isCurrentMonth
                    ? 'text-slate-800 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-50'
                } ${isToday && !isStart && !isEnd ? 'ring-2 ring-indigo-400/40' : ''}`}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>

        {/* Footer info & Done */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-slate-500 font-medium truncate max-w-[200px]">
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
            className="rounded-xl bg-indigo-600 px-4 py-1.5 font-bold text-white transition hover:bg-indigo-700 cursor-pointer shadow-xs"
          >
            Apply Range
          </button>
        </div>
      </div>
    );
  };

  const renderAttendanceView = () => (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icon type="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search learners by name or student ID..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Shift Previous 7 days */}
          <button
            type="button"
            onClick={() => shiftDateRange(-7)}
            aria-label="Previous 7 days"
            title="Previous 7 days"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
          >
            <Icon type="arrow-left" className="h-4 w-4" />
          </button>

          {/* Calendar Picker Trigger */}
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold shadow-2xs transition cursor-pointer ${
                showCalendar
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon type="calendar" className="h-4 w-4 text-indigo-600" />
              <span>{formatDateRange(startDate, endDate)}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-slate-400"><path d="m6 9 6 6 6-6" /></svg>
            </button>

            {showCalendar && renderCalendarPopover()}
          </div>

          {/* Quick Shift Next 7 days */}
          <button
            type="button"
            onClick={() => shiftDateRange(7)}
            aria-label="Next 7 days"
            title="Next 7 days"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
          >
            <Icon type="arrow-right" className="h-4 w-4" />
          </button>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600 shadow-2xs cursor-pointer"
          >
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {/* Mark All Present Fast Button */}
          <button
            type="button"
            disabled={isMarkingAll || filteredStudents.length === 0}
            onClick={handleMarkAllPresent}
            title="Fast 1-click attendance: Mark all students present for the visible date range"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Icon type="check" className="h-4 w-4" />
            <span>{isMarkingAll ? 'Marking...' : 'Mark All Present'}</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto min-h-[380px] pb-24">
          <table className="min-w-260 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="sticky left-0 bg-slate-50 px-4 py-3.5 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] w-28">
                  Student ID
                </th>
                <th className="sticky left-28 bg-slate-50 px-4 py-3.5 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] min-w-[200px]">
                  Learner Full Name
                </th>
                {attendanceDates.map((date) => {
                  const { dayName, monthDay } = formatDateHeader(date);
                  return (
                    <th key={date} className="px-3 py-2.5 text-center min-w-[68px]">
                      <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest">{dayName}</span>
                      <span className="block text-xs font-bold text-slate-800 mt-0.5">{monthDay}</span>
                    </th>
                  );
                })}
                <th className="px-4 py-3.5 text-center min-w-[90px]">Rate</th>
                <th className="px-4 py-3.5 text-center min-w-[120px]">Evaluation</th>
                <th className="px-4 py-3.5 text-center min-w-[90px]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={attendanceDates.length + 5} className="py-14 text-center text-sm text-slate-400 font-medium">
                    No learners found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, studentIndex) => (
                  <tr
                    key={student.id}
                    onContextMenu={(e) => handleStudentContextMenu(e, student)}
                    className="text-sm text-slate-800 hover:bg-slate-50/70 transition-colors group cursor-context-menu"
                  >
                    {/* Sticky Student ID */}
                    <td
                      onContextMenu={(e) => handleStudentContextMenu(e, student)}
                      className="sticky left-0 bg-white group-hover:bg-slate-50/70 px-4 py-3 font-mono font-bold text-xs text-slate-600 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-context-menu"
                    >
                      {student.id}
                    </td>

                    {/* Sticky Student Name with Avatar & Profile trigger */}
                    <td
                      onContextMenu={(e) => handleStudentContextMenu(e, student)}
                      className="sticky left-28 bg-white group-hover:bg-slate-50/70 px-4 py-3 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-context-menu"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileModalStudent(student);
                            setProfileModalTab('overview');
                          }}
                          title="Click or right-click to view student profile"
                          className="flex items-center gap-3 text-left group/name hover:opacity-90 transition cursor-pointer"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50 shadow-2xs group-hover/name:ring-2 group-hover/name:ring-indigo-300 transition-all">
                            <UserAvatar seed={student.avatarSeed || student.id} size={32} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 whitespace-nowrap group-hover/name:text-indigo-600 transition block">
                              {student.name}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileModalStudent(student);
                            setProfileModalTab('overview');
                          }}
                          title="View Profile (or right-click)"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                        >
                          <Icon type="user" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Attendance Cells */}
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
                              title={`${student.name} (${formatDate(cellDate)}): ${status === 'unmarked' ? 'Unmarked (Click to record)' : status.toUpperCase()}`}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${
                                status === 'present'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                                  : status === 'late'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100'
                                  : status === 'excused'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100'
                                  : status === 'absent'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-dashed border-slate-300'
                              }`}
                            >
                              {status === 'present' && <Icon type="check" className="h-4 w-4" />}
                              {status === 'late' && <Icon type="clock" className="h-4 w-4" />}
                              {status === 'excused' && <Icon type="shield" className="h-4 w-4" />}
                              {status === 'absent' && <Icon type="x" className="h-4 w-4" />}
                              {status === 'unmarked' && <span className="text-xs font-bold text-slate-400">—</span>}
                            </button>

                            {/* Floating Fast Popover */}
                            {isOpen && (
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 z-50 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 ${
                                  isNearBottom ? 'bottom-full mb-2' : 'top-full mt-2'
                                }`}
                              >
                                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1.5 text-left">
                                  Mark Attendance
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenAttendanceCell(null);
                                    updateAttendanceStatus(student, cellDate, 'present');
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition text-left cursor-pointer ${
                                    status === 'present' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-emerald-50/60'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
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
                                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition text-left cursor-pointer ${
                                    status === 'absent' ? 'bg-rose-50 text-rose-700' : 'text-slate-700 hover:bg-rose-50/60'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
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
                                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition text-left cursor-pointer ${
                                    status === 'late' ? 'bg-amber-50 text-amber-700' : 'text-slate-700 hover:bg-amber-50/60'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
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
                                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold transition text-left cursor-pointer ${
                                    status === 'excused' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50/60'
                                  }`}
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
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
                                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition text-left border-t border-slate-100 mt-1 pt-1.5 cursor-pointer"
                                >
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 text-xs font-black">
                                    —
                                  </span>
                                  <span>Clear Record</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Calculated Attendance Rate */}
                    {(() => {
                      const att = getStudentAttendanceMetrics(student, attendanceDates);
                      return (
                        <>
                          <td className="px-4 py-3 text-center font-bold font-mono text-slate-900">
                            {att.hasRecords ? `${att.percentage}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                                !att.hasRecords
                                  ? 'bg-slate-100 text-slate-500'
                                  : att.status === 'Excellent'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : att.status === 'Good'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                        </>
                      );
                    })()}

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          openModal({
                            kind: 'student',
                            action: 'delete',
                            studentId: student.id,
                            studentUserId: student.userId,
                            currentName: student.name,
                          })
                        }
                        title="Remove student from this section"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <Icon type="trash" className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderAssessmentsView = () => (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icon type="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search learners by name or student ID..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs">
            <Icon type="table" className="h-4 w-4 text-indigo-600" />
            <span>{assessmentColumns.length} Graded Activities</span>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-indigo-600 shadow-2xs cursor-pointer"
          >
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spreadsheet Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto min-h-[380px] pb-12">
          <table className="min-w-260 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="sticky left-0 bg-slate-50 px-4 py-3.5 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] w-28">
                  Student ID
                </th>
                <th className="sticky left-28 bg-slate-50 px-4 py-3.5 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] min-w-[200px]">
                  Learner Full Name
                </th>
                {assessmentColumns.map((col) => (
                  <th key={col.id} className="px-4 py-3.5 text-center min-w-[110px]">
                    <span className="block font-bold text-slate-800">{col.title}</span>
                    <span className="block text-[10px] font-semibold text-slate-400 normal-case">
                      Max: {col.maxScore ?? 100} pts
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-center min-w-[90px]">Average</th>
                <th className="px-4 py-3.5 text-center min-w-[120px]">Performance</th>
                <th className="px-4 py-3.5 text-center min-w-[90px]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={assessmentColumns.length + 5} className="py-14 text-center text-sm text-slate-400 font-medium">
                    No learners found in this section.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onContextMenu={(e) => handleStudentContextMenu(e, student)}
                    className="text-sm text-slate-800 hover:bg-slate-50/70 transition-colors group cursor-context-menu"
                  >
                    <td
                      onContextMenu={(e) => handleStudentContextMenu(e, student)}
                      className="sticky left-0 bg-white group-hover:bg-slate-50/70 px-4 py-3 font-mono font-bold text-xs text-slate-600 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-context-menu"
                    >
                      {student.id}
                    </td>

                    <td
                      onContextMenu={(e) => handleStudentContextMenu(e, student)}
                      className="sticky left-28 bg-white group-hover:bg-slate-50/70 px-4 py-3 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-context-menu"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileModalStudent(student);
                            setProfileModalTab('overview');
                          }}
                          title="Click or right-click to view student profile"
                          className="flex items-center gap-3 text-left group/name hover:opacity-90 transition cursor-pointer"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50 shadow-2xs group-hover/name:ring-2 group-hover/name:ring-indigo-300 transition-all">
                            <UserAvatar seed={student.avatarSeed || student.id} size={32} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 whitespace-nowrap group-hover/name:text-indigo-600 transition block">
                              {student.name}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileModalStudent(student);
                            setProfileModalTab('overview');
                          }}
                          title="View Profile (or right-click)"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                        >
                          <Icon type="user" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {assessmentColumns.map((col) => {
                      const assessment = student.assessments.find((a) => a.id === col.id);
                      const score = assessment?.percentage;
                      const scoreTone =
                        score === undefined
                          ? 'bg-slate-50 text-slate-400 border border-slate-200'
                          : score >= 90
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : score >= 75
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200';

                      return (
                        <td key={`${student.id}-assessment-${col.id}`} className="px-4 py-3 text-center">
                          <span className={`inline-flex min-w-12 justify-center rounded-xl px-2.5 py-1 text-xs font-bold ${scoreTone}`}>
                            {score === undefined ? '—' : `${score}%`}
                          </span>
                          {assessment?.score !== undefined && (
                            <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">
                              {assessment.score}/{assessment.maxScore ?? col.maxScore ?? 100}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-4 py-3 text-center font-bold font-mono text-slate-900">
                      {student.percentage}%
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                          student.status === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : student.status === 'Good'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          openModal({
                            kind: 'student',
                            action: 'delete',
                            studentId: student.id,
                            studentUserId: student.userId,
                            currentName: student.name,
                          })
                        }
                        title="Remove student from this section"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        <Icon type="trash" className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Back Navigation & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <Link
            href="/classes"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition cursor-pointer"
          >
            <Icon type="arrow-left" className="h-4 w-4" />
            <span>Classes &amp; Sections</span>
          </Link>

          {selectedClass && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl">
                {selectedClass.name} • {selectedSection?.name || 'Main Section'}
              </span>
            </div>
          )}
        </div>

        {/* Master Gradebook Header Banner */}
        <header className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  Official Gradebook &amp; Class Record
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {selectedClass ? `${selectedClass.name} - ${selectedSection?.name}` : 'Class Record'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openModal({ kind: 'student', action: 'add' })}
                disabled={!selectedSection}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <Icon type="plus" className="h-4 w-4" />
                <span>Enroll Student</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                disabled={!selectedClass || !selectedSection}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition cursor-pointer disabled:opacity-50"
              >
                <Icon type="download" className="h-4 w-4 text-indigo-600" />
                <span>Export &amp; Reports</span>
              </button>
            </div>
          </div>

          {/* Quick Class Stats KPI Banner */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Enrolled Learners</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {selectedSection?.students?.length ?? 0}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class Attendance</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
                {classAttendanceAverage}%
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Grade Average</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-0.5">
                {classGradeAverage}%
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Recorded Items</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {assessmentColumns.length} Activities
              </p>
            </div>
          </div>
        </header>

        {/* Top Class & Section Toolbar */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Class:</span>
              <select
                value={selectedClassName}
                onChange={(e) => {
                  const nextClassName = e.target.value;
                  setSelectedClassName(nextClassName);
                  const group = classGroups.find((g) => g.name === nextClassName);
                  if (group && group.sections[0]) {
                    setSelectedSectionId(group.sections[0].id);
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 shadow-2xs cursor-pointer"
              >
                {classGroups.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name} ({g.totalCount} learners)
                  </option>
                ))}
              </select>
            </div>

            {/* Section Dropdown */}
            {selectedClass && selectedClass.sections.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Section:</span>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 shadow-2xs cursor-pointer"
                >
                  {selectedClass.sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} ({sec.count} learners)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* View Toggle Tabs */}
          <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
            {(['Attendance', 'Assessments'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveView(mode)}
                className={`rounded-xl px-4 py-1.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeView === mode
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'Attendance' ? 'Attendance Sheet' : 'Assessment Grades'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Spreadsheets Section */}
        <section className="space-y-4">
          {activeView === 'Attendance' && renderAttendanceView()}
          {activeView === 'Assessments' && renderAssessmentsView()}
        </section>

        {/* Export Dialog Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon type="download" className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Export Class Record &amp; Reports</h3>
                    <p className="text-xs text-slate-400 font-medium">Download official reports in Excel CSV or print official report sheets</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Icon type="x" className="h-4 w-4" />
                </button>
              </div>

              <div className="py-6 space-y-3">
                {/* Option 1: Master Combined */}
                <button
                  type="button"
                  onClick={handleExportMasterCsv}
                  className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <Icon type="file-text" className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600">
                      Master Class Record (Full Combined Sheet)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Export complete roster with both attendance metrics and all assessment scores in spreadsheet format (.csv).
                    </p>
                  </div>
                </button>

                {/* Option 2: Attendance Only */}
                <button
                  type="button"
                  onClick={handleExportAttendanceCsv}
                  className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Icon type="calendar" className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600">
                      Attendance Log Sheet
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Detailed day-by-day attendance records for the selected date range ({formatDateRange(startDate, endDate)}).
                    </p>
                  </div>
                </button>

                {/* Option 3: Assessments Only */}
                <button
                  type="button"
                  onClick={handleExportAssessmentsCsv}
                  className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-violet-400 hover:bg-violet-50/30 cursor-pointer group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition">
                    <Icon type="table" className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-violet-600">
                      Assessment &amp; Activity Grades
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Itemized scores, percentages, and final grade equivalent breakdown for all activities.
                    </p>
                  </div>
                </button>

                {/* Option 4: Formatted Print Sheet */}
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="flex w-full items-start gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 text-left transition hover:bg-indigo-100/60 cursor-pointer group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition">
                    <Icon type="printer" className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-indigo-950">
                      Print Official School Grade Sheet (PDF / Print)
                    </h4>
                    <p className="text-xs text-indigo-800/80 mt-0.5">
                      Generate official landscape PDF report with institutional header, signature blocks, and verification stamp.
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Enrollment / Delete Modal */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <form onSubmit={handleModalSubmit} className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  {modal.action === 'delete' ? 'Remove Student' : 'Enroll Student to Section'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Icon type="x" className="h-4 w-4" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                {modal.action === 'delete' ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Are you sure you want to remove{' '}
                    <strong className="text-slate-900">{modal.currentName || 'this student'}</strong> from{' '}
                    <span className="font-bold text-indigo-600">{selectedSection?.name}</span>?
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Filter Available Learners
                      </label>
                      <input
                        type="text"
                        value={modalName}
                        onChange={(e) => setModalName(e.target.value)}
                        placeholder="Search by student name..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Select Student from Directory
                      </label>
                      {availableStudents.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 font-medium">
                          No available unenrolled students found.
                        </p>
                      ) : (
                        <select
                          value={modalStudentId}
                          onChange={(e) => setModalStudentId(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
                          required
                        >
                          <option value="" disabled>Choose student to enroll...</option>
                          {availableStudents.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name} ({st.id})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition shadow-sm cursor-pointer ${
                    modal.action === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  {modal.action === 'delete' ? 'Confirm Removal' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Right-Click Floating Context Menu */}
        {contextMenu && (
          <div
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="fixed z-50 w-60 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Student Preview Header */}
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-100 mb-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-indigo-50">
                <UserAvatar seed={contextMenu.student.avatarSeed || contextMenu.student.id} size={32} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{contextMenu.student.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">ID: {contextMenu.student.id}</p>
              </div>
            </div>

            {/* Primary Action: View Profile */}
            <button
              type="button"
              onClick={() => {
                setProfileModalStudent(contextMenu.student);
                setProfileModalTab('overview');
                setContextMenu(null);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-extrabold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Icon type="user" className="h-4 w-4 text-indigo-600" />
                <span>View Profile</span>
              </span>
              <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-1.5 py-0.5 rounded-md font-bold">Modal</span>
            </button>

            {/* Secondary: Copy ID */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(contextMenu.student.id);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer mt-0.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Student ID</span>
            </button>

            {/* Tertiary: Copy Email */}
            {contextMenu.student.email && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(contextMenu.student.email!);
                  setContextMenu(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Copy Email</span>
              </button>
            )}
          </div>
        )}

        {/* Student Profile Pop-Up Modal */}
        {profileModalStudent && (() => {
          const student = profileModalStudent;
          const markedAttendance = student.attendance.filter((a) => a.status && a.status !== 'unmarked');
          const presentCount = student.attendance.filter((a) => a.status === 'present').length;
          const lateCount = student.attendance.filter((a) => a.status === 'late').length;
          const absentCount = student.attendance.filter((a) => a.status === 'absent').length;
          const attendanceRate = markedAttendance.length > 0
            ? Math.round(((presentCount + lateCount * 0.8) / markedAttendance.length) * 100)
            : 100;
          const completedAssessments = student.assessments.filter((a) => a.score != null);
          const heartsCount = student.hearts ?? 5;

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
              onClick={() => setProfileModalStudent(null)}
            >
              <div
                className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Top Hero Header */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-7 text-white">
                  <button
                    type="button"
                    onClick={() => setProfileModalStudent(null)}
                    className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                    title="Close modal"
                  >
                    <Icon type="x" className="h-5 w-5" />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="relative">
                      <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-3xl border-3 border-white/90 bg-white/20 backdrop-blur-xs p-1 shadow-xl overflow-hidden shrink-0">
                        <UserAvatar seed={student.avatarSeed || student.id} size={88} className="h-full w-full object-cover rounded-2xl" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold border-2 border-white shadow-sm" title="Active Student">
                        ✓
                      </span>
                    </div>

                    <div className="text-center sm:text-left flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-white/95 text-xs font-bold backdrop-blur-xs border border-white/20">
                          <span>🎓</span>
                          <span>{selectedClass ? `${selectedClass.name} • ${selectedSection?.name}` : 'Student Profile'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/80 text-white text-xs font-extrabold border border-white/20">
                          <span>❤️</span>
                          <span>{heartsCount} / 5 Life</span>
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                        {student.name}
                      </h2>

                      <div className="mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-indigo-100 font-medium">
                        <span className="font-mono bg-black/20 px-2 py-0.5 rounded-md text-white/90">
                          ID: {student.id}
                        </span>
                        {student.email && (
                          <span className="text-white/80 truncate max-w-xs">
                            ✉️ {student.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick 4 Stats Metric Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-50/90 border-b border-slate-100">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Grade</p>
                    <p className={`text-xl font-black mt-0.5 ${
                      student.percentage >= 90 ? 'text-emerald-600' : student.percentage >= 75 ? 'text-indigo-600' : 'text-amber-600'
                    }`}>
                      {student.percentage}%
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{student.status}</p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Rate</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      {attendanceRate}%
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                      {presentCount + lateCount} / {markedAttendance.length || student.attendance.length} Days
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assessments</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      {completedAssessments.length} / {student.assessments.length || assessmentColumns.length}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">Activities Done</p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Life Standing</p>
                    <div className="flex items-center gap-0.5 mt-1 text-rose-500 text-sm">
                      {[1, 2, 3, 4, 5].map((h) => (
                        <span key={h}>{h <= heartsCount ? '❤️' : '🤍'}</span>
                      ))}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{heartsCount >= 5 ? 'Full Life' : heartsCount >= 3 ? 'Good Standing' : 'Needs Support'}</p>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center border-b border-slate-100 px-6 pt-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setProfileModalTab('overview')}
                    className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                      profileModalTab === 'overview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📋 Profile Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileModalTab('assessments')}
                    className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                      profileModalTab === 'assessments'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🎯 Assessments ({student.assessments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileModalTab('attendance')}
                    className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                      profileModalTab === 'attendance'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📅 Attendance History ({student.attendance.length})
                  </button>
                </div>

                {/* Tab Body */}
                <div className="p-6 max-h-[380px] overflow-y-auto space-y-4">
                  {profileModalTab === 'overview' && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Academic Performance</h4>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-bold text-slate-700">
                          <span>Cumulative Grade Average</span>
                          <span className={student.percentage >= 90 ? 'text-emerald-600' : 'text-indigo-600'}>{student.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              student.percentage >= 90 ? 'bg-emerald-500' : student.percentage >= 75 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, student.percentage))}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Classroom Assignment</h4>
                          <p className="text-sm font-bold text-slate-900">{selectedClass?.name || 'Assigned Class'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Section: {selectedSection?.name || 'Main'}</p>
                          <p className="text-[11px] text-slate-400 mt-2">Active Enrollment • Official Gradebook</p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Attendance Summary</h4>
                          <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">✓ {presentCount} Present</span>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">⏰ {lateCount} Late</span>
                            <span className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">✕ {absentCount} Absent</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {profileModalTab === 'assessments' && (
                    <div className="space-y-2.5">
                      {student.assessments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs font-bold">
                          No activities or assessments recorded yet for this student.
                        </div>
                      ) : (
                        student.assessments.map((a, i) => {
                          const hasScore = a.score != null;
                          const pct = a.percentage ?? (hasScore && a.maxScore ? Math.round((a.score! / a.maxScore) * 100) : null);
                          return (
                            <div key={a.id || i} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-200 bg-white transition shadow-2xs">
                              <div>
                                <p className="text-sm font-bold text-slate-900">{a.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                  {hasScore ? `Score: ${a.score} / ${a.maxScore || 100} points` : 'Not submitted / unmarked'}
                                </p>
                              </div>
                              <div>
                                {pct != null ? (
                                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-extrabold border ${
                                    pct >= 90
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : pct >= 75
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                    {pct}%
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold">
                                    Unscored
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {profileModalTab === 'attendance' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                        <span>Date Session</span>
                        <span>Recorded Attendance Status</span>
                      </div>
                      {student.attendance.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs font-bold">
                          No attendance sessions tracked in the current date range.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {student.attendance.map((att, i) => {
                            const st = att.status || 'unmarked';
                            return (
                              <div key={att.date || i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white text-xs">
                                <span className="font-mono font-bold text-slate-700">{att.date}</span>
                                <span className={`px-2.5 py-0.5 rounded-lg font-bold capitalize border ${
                                  st === 'present'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : st === 'late'
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : st === 'absent'
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : st === 'excused'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                  {st === 'present' ? '✓ Present' : st === 'late' ? '⏰ Late' : st === 'absent' ? '✕ Absent' : st === 'excused' ? '🛡️ Excused' : '— Unmarked'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50">
                  <span className="text-xs text-slate-400 font-medium">
                    💡 Tip: Right-click any student row in Class Record to view profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setProfileModalStudent(null)}
                    className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function ClassRecordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm font-bold text-indigo-600">
          Loading Class Record System...
        </div>
      }
    >
      <ClassRecordContent />
    </Suspense>
  );
}
