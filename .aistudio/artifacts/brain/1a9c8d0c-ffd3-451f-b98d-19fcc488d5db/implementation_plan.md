# Implementation Plan: Comprehensive Academics, Student Governance & Advanced Fee Analytics Suite

## Executive Summary
This implementation introduces three major enterprise modules to the PharmMed ERP & IQAC Suite:
1. **Fee Analytics Dashboard & Overdue Notification Triggers**: Recharts visualization comparing actual monthly collections against projected academic budgets, coupled with an automated/manual SMS & Email trigger engine for overdue fee accounts linked with the System Security Console.
2. **Comprehensive Student Management & Governance Suite**: Full lifecycle management with Add, Edit, Bulk CSV/JSON Import, Multi-Format Export, Status Management (Active, Conditional, Suspended, Academic Ban with audit reasons), and granular CO/PO attainment and CGPA progression tracking.
3. **Academics & Curriculum Hub**: A dedicated primary tab featuring Program Timetables, Syllabus Progress Tracking (% completed), Outcome-Based Education (OBE) CO-PO Attainment Calculation (automated from sessional marks and attendance), Lesson Planning, and an interactive Teacher's Diary with daily lesson entries and HOD sign-offs.

---

## Architecture & Integration Strategy

### 1. Data Model Extensions (`src/types/index.ts`)
- **Fee Budget & Analytics**:
  - `MonthlyCollectionTrend`: `{ month: string, collected: number, projectedBudget: number, variance: number, collectionRate: number }`
  - `FeeNotificationDispatch`: `{ id: string, studentId: string, enrollmentNo: string, studentName: string, guardianPhone: string, studentEmail: string, overdueAmount: number, daysOverdue: number, channel: 'SMS' | 'EMAIL' | 'BOTH', status: 'Sent' | 'Failed' | 'Queued', triggerSource: 'AUTOMATED_RULE' | 'MANUAL_DISPATCH', timestamp: string }`
  - Integration with `NotificationTriggerRule` (`OVERDUE_FEE_ALERT` metric type).
- **Student Governance & Attainment**:
  - Extend `StudentRecord` with `statusReason?: string`, `bannedAt?: string`, `bannedBy?: string`, `coAttainments?: Record<string, number>`, `poAttainments?: Record<string, number>`, `mentorFacultyId?: string`, `disciplinaryRecords?: DisciplinaryRecord[]`.
- **Academics & Curriculum**:
  - `TimetableSlot`: `{ id: string, day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday', startTime: string, endTime: string, program: string, semester: string, subjectCode: string, subjectName: string, facultyName: string, classroom: string, sessionType: 'Theory' | 'Practical' | 'Tutorial' }`
  - `CourseSyllabus`: `{ id: string, courseCode: string, courseName: string, department: string, semester: string, totalHours: number, completedHours: number, percentageCovered: number, units: SyllabusUnit[] }`
  - `SyllabusUnit`: `{ unitNumber: number, title: string, plannedHours: number, completedHours: number, topics: string[], coMapping: string[] }`
  - `COPOMapping`: `{ courseCode: string, coCode: string, coDescription: string, mappedPOs: Record<string, 1 | 2 | 3>, targetAttainmentPercent: number, calculatedAttainmentPercent: number }`
  - `TeacherDiaryEntry`: `{ id: string, facultyId: string, facultyName: string, date: string, courseCode: string, courseName: string, semester: string, topicPlanned: string, topicCovered: string, methodology: 'Chalk & Board' | 'ICT & PPT' | 'Lab Demonstration' | 'Clinical Case Discussion' | 'Flipped Classroom', studentsPresent: number, totalStudents: number, remarks: string, hodSignOff: 'Pending' | 'Approved' | 'Review_Requested' }`

---

## User Review Required

> [!IMPORTANT]
> - **Navigation Placement**: The new **Academics & Curriculum Hub** will appear as a primary tab in the main header bar, containing sub-tabs for *Timetable*, *Syllabus Progress*, *CO-PO Attainment*, *Lesson Plans*, and *Teacher's Diary*.
> - **Fee Trigger Rules**: Automated notifications will register in the `SystemSecurityConsole` rules list with configurable threshold days (e.g. >15 days overdue) and overdue amount limits, while also offering instant manual one-click dispatch from the Fee Management Suite.
> - **OBE Calculation Formula**: Course Outcome attainment will automatically aggregate scores from internal sessional exams (weightage 80%) and student attendance compliance (weightage 20%), comparing against institutional benchmark targets (default 70%).

---

## Step-by-Step Implementation Plan

### Step 1: Types & Mock Data Enrichment
- Update `/src/types/index.ts` with models for `MonthlyCollectionTrend`, `FeeNotificationDispatch`, `TimetableSlot`, `CourseSyllabus`, `COPOMapping`, `TeacherDiaryEntry`, and student disciplinary/attainment extensions.
- Update `/src/data/mockData.ts` with initial realistic dataset for timetables across departments, complete syllabi with percentage tracking, CO-PO correlation matrix, teacher diary entries, and monthly collection trends for the academic year.

### Step 2: Fee Analytics & Notification Trigger Engine (`FeeManagementSuite.tsx`)
- Embed a **Recharts ComposedChart / BarChart** visualizer displaying monthly collections (Tuition, Lab, Exam, Library) against the budgeted institutional projection with variance indicators.
- Add an **Overdue Reminder & Notification Trigger Panel**:
  - Automated trigger status monitor linked to the active `NotificationTriggerRule` in the System Security Console.
  - Manual dispatch selector: filter overdue accounts, choose SMS/Email/Both template, and simulate multi-channel dispatch with delivery receipts.
  - Dispatch audit log stream tracking communication history.

### Step 3: Comprehensive Student Management Suite Expansion (`StudentsDirectoryView.tsx`)
- Add **Student Edit Modal** for updating academic details, mentor assignment, and contact numbers.
- Add **Bulk CSV / JSON Import & Template Download** with instant client-side validation and duplication safeguards.
- Add **Export Utility** (CSV and formatted PDF roster).
- Add **Academic Status & Disciplinary Actions**:
  - Suspend / Ban student toggle with reason modal (e.g., fee default, disciplinary infraction, attendance breach) and security audit log generation.
  - Re-activate student with reinstatement notes.
- Add **Student-Level CO & PO Attainment Inspector**:
  - Modal viewing student's attainment across NBA/NAAC Course Outcomes (CO1 to CO5) and Program Outcomes (PO1 to PO12), with spider/bar charts and CGPA progression curve.

### Step 4: Academics & Curriculum Hub (`AcademicsManagementHub.tsx`)
Create a new comprehensive module with 5 interactive sub-tabs:
1. **Interactive Timetable Matrix**:
   - Weekly grid view by department and semester with time slots (09:00 - 17:00).
   - Filter by faculty, classroom, or department.
   - Add/Edit slot with clash detection indicator.
2. **Syllabus Coverage Tracker**:
   - Visual progress bars (% completed vs. scheduled timeline).
   - Unit-wise topic completion checklist.
   - Faculty pace indicator (Ahead, On-Schedule, Behind Schedule).
3. **CO-PO Attainment Calculator (OBE Engine)**:
   - Direct attainment computation linked to sessional exam grades and attendance.
   - Attainment levels (Level 3: >80%, Level 2: 70-80%, Level 1: 60-70%, Level 0: <60%).
   - Program Articulation Matrix (PO1–PO12 & PSO1–PSO2) heat map.
4. **Lesson Planning Module**:
   - Structured unit plans with learning objectives, pedagogic tools, and reference books.
5. **Faculty Teacher's Diary**:
   - Daily log entry form (Date, Period, Class, Planned Topic, Delivered Topic, Pedagogy, Attendance count, Reflections).
   - HOD review & digital sign-off workflow.

### Step 5: Main Application Wiring (`App.tsx`)
- Add `'AcademicsHub'` to `ActiveNav` and header navigation bar.
- Manage persistent state and IndexedDB storage for timetable slots, syllabi, teacher diary entries, and notification dispatch logs.
- Connect fee notification triggers to `triggerRules` and `alertEvents` so fee overdue alerts reflect in the header critical alert banner and System Security Console.

---

## Verification & Build Checklist
- Verify full TypeScript compilation via `compile_applet`.
- Verify code health and zero missing imports via `lint_applet`.
- Ensure dark slate visual harmony across all newly added panels, charts, modals, and tables.
