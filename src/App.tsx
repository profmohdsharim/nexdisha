import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  BookOpen,
  ClipboardList,
  Building2,
  HardDrive,
  Lock,
  Layers,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Search,
  User,
  GraduationCap,
  FlaskConical,
  Activity,
  FileText,
  DollarSign,
  DownloadCloud,
  FileCheck2,
  Compass,
  Users,
  Trophy,
  Download,
  Calendar,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import {
  INITIAL_USER,
  INITIAL_NAAC_METRICS,
  INITIAL_SOPS,
  INITIAL_AUDIT_RECORDS,
  INITIAL_LMS_COURSES,
  INITIAL_ASSETS,
  INITIAL_CHEMICALS,
  INITIAL_BUDGETS,
  INITIAL_BACKUPS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FACULTY_WORKLOAD,
  INITIAL_ACADEMIC_PROGRAMS,
  INITIAL_SESSIONAL_RECORDS,
  INITIAL_STUDENTS,
  INITIAL_FEE_ACCOUNTS,
  INITIAL_FEE_RECEIPTS,
  INITIAL_STUDENT_RESULTS,
} from './data/mockData';
import {
  INITIAL_FEEDBACK_ENTRIES,
} from './data/feedbackMockData';
import {
  INITIAL_FACULTY_MEMBERS,
  INITIAL_CAMPUS_ACTIVITIES,
} from './data/facultyAndActivitiesMockData';
import {
  initialTriggerRules,
  initialAlertEvents,
  initialCalendarEvents,
} from './data/calendarAndTriggerMockData';
import {
  UserProfile,
  NaacMetric,
  SOPDocument,
  AAAAuditRecord,
  LMSCourse,
  DepartmentAsset,
  ChemicalInventoryItem,
  FinancialBudgetRecord,
  BackupSnapshot,
  SystemAuditLog,
  FacultyWorkloadRecord,
  AcademicProgramOffering,
  SessionalAssessmentRecord,
  StakeholderFeedbackEntry,
  FacultyMember,
  CampusActivity,
  NotificationTriggerRule,
  TriggerAlertEvent,
  AcademicCalendarEvent,
  StudentRecord,
  StudentFeeAccount,
  FeeTransactionReceipt,
  StudentSemesterResult,
} from './types';
import { saveVaultData, loadVaultData } from './utils/storageVault';
import { AccreditationDashboard } from './components/AccreditationDashboard';
import { SOPStudio } from './components/SOPStudio';
import { AAAManager } from './components/AAAManager';
import { LMSPortal } from './components/LMSPortal';
import { DepartmentAdminCenter } from './components/DepartmentAdminCenter';
import { ExamManagementModule } from './components/ExamManagementModule';
import { BackupCenter } from './components/BackupCenter';
import { SystemSecurityConsole } from './components/SystemSecurityConsole';
import { FeedbackRadarModule } from './components/FeedbackRadarModule';
import { FacultyManagementSuite } from './components/FacultyManagementSuite';
import { CampusActivityManagement } from './components/CampusActivityManagement';
import { ExportUtilityModal } from './components/ExportUtilityModal';
import { AlertCenterModal } from './components/AlertCenterModal';
import { SmartAcademicCalendar } from './components/SmartAcademicCalendar';
import { SystemHelpModal } from './components/SystemHelpModal';
import { FeeManagementSuite } from './components/FeeManagementSuite';
import { StudentsDirectoryView } from './components/StudentsDirectoryView';
import { ResultsManagementView } from './components/ResultsManagementView';

type ActiveNav =
  | 'Accreditation'
  | 'AcademicCalendar'
  | 'StudentFinanceHub'
  | 'FeedbackRadar'
  | 'FacultySuite'
  | 'CampusEvents'
  | 'Exams'
  | 'SOPs'
  | 'AAA'
  | 'LMS'
  | 'DepartmentAdmin'
  | 'Backup'
  | 'Security';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [activeNav, setActiveNav] = useState<ActiveNav>('Accreditation');
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(
    'System Alert: ISO 21001:2025 Surveillance Audit & Semester Sessional schedules active.'
  );

  // Core ERP Persistent State
  const [metrics, setMetrics] = useState<NaacMetric[]>(INITIAL_NAAC_METRICS);
  const [sops, setSops] = useState<SOPDocument[]>(INITIAL_SOPS);
  const [audits, setAudits] = useState<AAAAuditRecord[]>(INITIAL_AUDIT_RECORDS);
  const [courses, setCourses] = useState<LMSCourse[]>(INITIAL_LMS_COURSES);
  const [assets, setAssets] = useState<DepartmentAsset[]>(INITIAL_ASSETS);
  const [chemicals, setChemicals] = useState<ChemicalInventoryItem[]>(INITIAL_CHEMICALS);
  const [budgets, setBudgets] = useState<FinancialBudgetRecord[]>(INITIAL_BUDGETS);
  const [backups, setBackups] = useState<BackupSnapshot[]>(INITIAL_BACKUPS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Faculty Workload & Exam Management State
  const [workloads, setWorkloads] = useState<FacultyWorkloadRecord[]>(INITIAL_FACULTY_WORKLOAD);
  const [programs, setPrograms] = useState<AcademicProgramOffering[]>(INITIAL_ACADEMIC_PROGRAMS);
  const [sessionals, setSessionals] = useState<SessionalAssessmentRecord[]>(INITIAL_SESSIONAL_RECORDS);

  // Student & Faculty Feedback Loop
  const [feedbackEntries, setFeedbackEntries] = useState<StakeholderFeedbackEntry[]>(INITIAL_FEEDBACK_ENTRIES);

  // Faculty Suite & Campus Activity Hub
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(INITIAL_FACULTY_MEMBERS);
  const [campusActivities, setCampusActivities] = useState<CampusActivity[]>(INITIAL_CAMPUS_ACTIVITIES);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Automated Trigger Rules & Alert Center State
  const [triggerRules, setTriggerRules] = useState<NotificationTriggerRule[]>(initialTriggerRules);
  const [alertEvents, setAlertEvents] = useState<TriggerAlertEvent[]>(initialAlertEvents);
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);

  // Smart Academic Calendar State
  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEvent[]>(initialCalendarEvents);

  // Student, Fee Management & Results State
  const [studentsList, setStudentsList] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [feeAccountsList, setFeeAccountsList] = useState<StudentFeeAccount[]>(INITIAL_FEE_ACCOUNTS);
  const [feeReceiptsList, setFeeReceiptsList] = useState<FeeTransactionReceipt[]>(INITIAL_FEE_RECEIPTS);
  const [studentResultsList, setStudentResultsList] = useState<StudentSemesterResult[]>(INITIAL_STUDENT_RESULTS);
  const [studentHubSubTab, setStudentHubSubTab] = useState<'fees' | 'students' | 'results'>('fees');
  const [studentHubFocusedId, setStudentHubFocusedId] = useState<string | null>(null);

  // System Help & PWA Installation Guide Modal State
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Check user authorization
  const isAdminOrAuthorized =
    currentUser.role === 'Dean_Principal' ||
    currentUser.role === 'IQAC_Director' ||
    currentUser.role === 'HOD_Faculty';

  // Initialize and register service worker for offline PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service Worker registration skipped:', err);
      });
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial data from local IndexedDB vault if available
    const initVault = async () => {
      const savedMetrics = await loadVaultData<NaacMetric[]>('metrics', INITIAL_NAAC_METRICS);
      const savedSops = await loadVaultData<SOPDocument[]>('sops', INITIAL_SOPS);
      const savedAudits = await loadVaultData<AAAAuditRecord[]>('audits', INITIAL_AUDIT_RECORDS);
      const savedCourses = await loadVaultData<LMSCourse[]>('courses', INITIAL_LMS_COURSES);
      const savedAssets = await loadVaultData<DepartmentAsset[]>('assets', INITIAL_ASSETS);
      const savedChemicals = await loadVaultData<ChemicalInventoryItem[]>('chemicals', INITIAL_CHEMICALS);
      const savedBudgets = await loadVaultData<FinancialBudgetRecord[]>('budgets', INITIAL_BUDGETS);
      const savedBackups = await loadVaultData<BackupSnapshot[]>('backups', INITIAL_BACKUPS);
      const savedLogs = await loadVaultData<SystemAuditLog[]>('auditLogs', INITIAL_AUDIT_LOGS);
      const savedWorkloads = await loadVaultData<FacultyWorkloadRecord[]>('workloads', INITIAL_FACULTY_WORKLOAD);
      const savedPrograms = await loadVaultData<AcademicProgramOffering[]>('programs', INITIAL_ACADEMIC_PROGRAMS);
      const savedSessionals = await loadVaultData<SessionalAssessmentRecord[]>('sessionals', INITIAL_SESSIONAL_RECORDS);
      const savedFeedback = await loadVaultData<StakeholderFeedbackEntry[]>('feedback', INITIAL_FEEDBACK_ENTRIES);
      const savedFaculty = await loadVaultData<FacultyMember[]>('faculty', INITIAL_FACULTY_MEMBERS);
      const savedActivities = await loadVaultData<CampusActivity[]>('activities', INITIAL_CAMPUS_ACTIVITIES);
      const savedTriggers = await loadVaultData<NotificationTriggerRule[]>('triggerRules', initialTriggerRules);
      const savedAlerts = await loadVaultData<TriggerAlertEvent[]>('alertEvents', initialAlertEvents);
      const savedCalendar = await loadVaultData<AcademicCalendarEvent[]>('calendarEvents', initialCalendarEvents);
      const savedStudents = await loadVaultData<StudentRecord[]>('students', INITIAL_STUDENTS);
      const savedFeeAccounts = await loadVaultData<StudentFeeAccount[]>('feeAccounts', INITIAL_FEE_ACCOUNTS);
      const savedFeeReceipts = await loadVaultData<FeeTransactionReceipt[]>('feeReceipts', INITIAL_FEE_RECEIPTS);
      const savedStudentResults = await loadVaultData<StudentSemesterResult[]>('studentResults', INITIAL_STUDENT_RESULTS);

      setMetrics(savedMetrics);
      setSops(savedSops);
      setAudits(savedAudits);
      setCourses(savedCourses);
      setAssets(savedAssets);
      setChemicals(savedChemicals);
      setBudgets(savedBudgets);
      setBackups(savedBackups);
      setAuditLogs(savedLogs);
      setWorkloads(savedWorkloads);
      setPrograms(savedPrograms);
      setSessionals(savedSessionals);
      setFeedbackEntries(savedFeedback);
      setFacultyList(savedFaculty);
      setCampusActivities(savedActivities);
      setTriggerRules(savedTriggers);
      setAlertEvents(savedAlerts);
      setCalendarEvents(savedCalendar);
      setStudentsList(savedStudents);
      setFeeAccountsList(savedFeeAccounts);
      setFeeReceiptsList(savedFeeReceipts);
      setStudentResultsList(savedStudentResults);
    };

    initVault();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to IndexedDB vault automatically with audit logging
  const logAudit = async (action: string, category: SystemAuditLog['category'], details: string) => {
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser.name,
      role: currentUser.role,
      action,
      category,
      ipAddress: '127.0.0.1 (IndexedDB Local Vault)',
      details,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    await saveVaultData('auditLogs', updatedLogs);
    setPendingSyncCount((prev) => prev + 1);
  };

  const handleSaveSOP = async (newSop: SOPDocument) => {
    const updated = [newSop, ...sops.filter((s) => s.id !== newSop.id)];
    setSops(updated);
    await saveVaultData('sops', updated);
    logAudit(`Saved SOP: ${newSop.sopNumber}`, 'SOP', `${newSop.title} [${newSop.faculty}]`);
  };

  const handleUpdateNCStatus = async (auditId: string, ncId: string, newStatus: any) => {
    const updated = audits.map((audit) => {
      if (audit.id !== auditId) return audit;
      return {
        ...audit,
        nonConformances: audit.nonConformances.map((nc) => {
          if (nc.id !== ncId) return nc;
          return { ...nc, status: newStatus };
        }),
      };
    });
    setAudits(updated);
    await saveVaultData('audits', updated);
    logAudit(`Updated NC ${ncId} to ${newStatus}`, 'Audit', `Audit Cycle: ${auditId}`);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setPendingSyncCount(0);
      setActiveNotification('Background Synchronization Complete. Local IndexedDB Vault mirrored to Cloud.');
      setTimeout(() => setActiveNotification(null), 5000);
    }, 1000);
  };

  const handleRoleSwitch = (newRole: any) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
    }));
    logAudit(`Role switched to ${newRole}`, 'Security', `Operator user changed active role view`);
  };

  // State bundle for backup generator
  // State bundle for backup generator
  const allDataBundle = {
    metrics,
    sops,
    audits,
    courses,
    assets,
    chemicals,
    budgets,
    backups,
    auditLogs,
    workloads,
    programs,
    sessionals,
    feedbackEntries,
    facultyList,
    campusActivities,
    triggerRules,
    alertEvents,
    calendarEvents,
  };

  // Bundle for Institutional Bulk Export Utility
  const allExportDataBundle = {
    institutionName: 'Higher Education University & Medical Center',
    generatedBy: `${currentUser.name} (${currentUser.role})`,
    timestamp: new Date().toISOString(),
    facultyMembers: facultyList,
    campusActivities: campusActivities,
    naacMetrics: metrics,
    audits: audits,
    sops: sops,
    feedbackEntries: feedbackEntries,
    sessionals: sessionals,
    assets: assets,
    calendarEvents: calendarEvents,
  };

  const handleRestoreSnapshot = async (restoredVault: any) => {
    if (restoredVault.metrics) {
      setMetrics(restoredVault.metrics);
      await saveVaultData('metrics', restoredVault.metrics);
    }
    if (restoredVault.sops) {
      setSops(restoredVault.sops);
      await saveVaultData('sops', restoredVault.sops);
    }
    if (restoredVault.audits) {
      setAudits(restoredVault.audits);
      await saveVaultData('audits', restoredVault.audits);
    }
    if (restoredVault.courses) {
      setCourses(restoredVault.courses);
      await saveVaultData('courses', restoredVault.courses);
    }
    if (restoredVault.assets) {
      setAssets(restoredVault.assets);
      await saveVaultData('assets', restoredVault.assets);
    }
    if (restoredVault.chemicals) {
      setChemicals(restoredVault.chemicals);
      await saveVaultData('chemicals', restoredVault.chemicals);
    }
    if (restoredVault.budgets) {
      setBudgets(restoredVault.budgets);
      await saveVaultData('budgets', restoredVault.budgets);
    }
    if (restoredVault.workloads) {
      setWorkloads(restoredVault.workloads);
      await saveVaultData('workloads', restoredVault.workloads);
    }
    if (restoredVault.programs) {
      setPrograms(restoredVault.programs);
      await saveVaultData('programs', restoredVault.programs);
    }
    if (restoredVault.sessionals) {
      setSessionals(restoredVault.sessionals);
      await saveVaultData('sessionals', restoredVault.sessionals);
    }
    if (restoredVault.feedbackEntries) {
      setFeedbackEntries(restoredVault.feedbackEntries);
      await saveVaultData('feedback', restoredVault.feedbackEntries);
    }
    if (restoredVault.facultyList) {
      setFacultyList(restoredVault.facultyList);
      await saveVaultData('faculty', restoredVault.facultyList);
    }
    if (restoredVault.campusActivities) {
      setCampusActivities(restoredVault.campusActivities);
      await saveVaultData('activities', restoredVault.campusActivities);
    }
    if (restoredVault.triggerRules) {
      setTriggerRules(restoredVault.triggerRules);
      await saveVaultData('triggerRules', restoredVault.triggerRules);
    }
    if (restoredVault.alertEvents) {
      setAlertEvents(restoredVault.alertEvents);
      await saveVaultData('alertEvents', restoredVault.alertEvents);
    }
    if (restoredVault.calendarEvents) {
      setCalendarEvents(restoredVault.calendarEvents);
      await saveVaultData('calendarEvents', restoredVault.calendarEvents);
    }
    setPendingSyncCount(0);
    logAudit(`Restored institutional database snapshot`, 'Backup', `Full disaster recovery applied`);
  };

  const handleAddNewBackup = async (newBkp: BackupSnapshot) => {
    const updated = [newBkp, ...backups];
    setBackups(updated);
    await saveVaultData('backups', updated);
  };

  // Alert Center Handlers
  const handleAcknowledgeAlert = async (alertId: string) => {
    const updated = alertEvents.map((a) =>
      a.id === alertId
        ? {
            ...a,
            status: 'ACKNOWLEDGED' as const,
            acknowledgedBy: `${currentUser.name} (${currentUser.role})`,
          }
        : a
    );
    setAlertEvents(updated);
    await saveVaultData('alertEvents', updated);
    logAudit(`Acknowledged Alert: ${alertId}`, 'Security', 'User review registered');
  };

  const handleResolveAlert = async (alertId: string) => {
    const updated = alertEvents.map((a) =>
      a.id === alertId ? { ...a, status: 'RESOLVED' as const } : a
    );
    setAlertEvents(updated);
    await saveVaultData('alertEvents', updated);
    logAudit(`Resolved Alert: ${alertId}`, 'Security', 'Escalation marked resolved');
  };

  // Automated Trigger Rule Evaluator Engine
  const handleRunTriggerEvaluation = (rulesList: NotificationTriggerRule[] = triggerRules) => {
    const generatedAlerts: TriggerAlertEvent[] = [];

    rulesList.filter((r) => r.enabled).forEach((rule) => {
      if (rule.metricType === 'NAAC_SCORE_DROP') {
        metrics.forEach((m) => {
          if (rule.operator === 'LESS_THAN' && m.currentScore < rule.thresholdValue) {
            generatedAlerts.push({
              id: `alt-${rule.id}-${m.metricCode}-${Date.now()}`,
              ruleId: rule.id,
              ruleName: rule.name,
              metricType: 'NAAC_SCORE_DROP',
              department: 'Institutional IQAC',
              currentValue: Number(m.currentScore.toFixed(2)),
              thresholdValue: rule.thresholdValue,
              unit: 'CGPA',
              severity: rule.severity,
              message: `${m.criterionTitle} (${m.metricCode}) has dropped to ${m.currentScore.toFixed(2)} CGPA (Configured threshold: < ${rule.thresholdValue.toFixed(2)} CGPA). Immediate QA review recommended.`,
              triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'UNREAD',
              actionUrl: 'Accreditation',
            });
          }
        });
      } else if (rule.metricType === 'BUDGET_OVERRUN') {
        budgets.forEach((b) => {
          const percent = (b.expenditure / b.allocatedBudget) * 100;
          if (rule.operator === 'GREATER_THAN' && percent > rule.thresholdValue) {
            generatedAlerts.push({
              id: `alt-${rule.id}-${b.department.replace(/\s+/g, '-')}-${Date.now()}`,
              ruleId: rule.id,
              ruleName: rule.name,
              metricType: 'BUDGET_OVERRUN',
              department: b.department,
              currentValue: Math.round(percent * 10) / 10,
              thresholdValue: rule.thresholdValue,
              unit: '%',
              severity: rule.severity,
              message: `Budget overrun alert: ${b.department} has utilized ${Math.round(percent)}% of sanctioned funding (₹${(b.expenditure / 100000).toFixed(1)}L / ₹${(b.allocatedBudget / 100000).toFixed(1)}L).`,
              triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'UNREAD',
              actionUrl: 'DepartmentAdmin',
            });
          }
        });
      }
    });

    if (generatedAlerts.length > 0) {
      const existingKeySet = new Set(alertEvents.map((a) => `${a.ruleId}-${a.department}`));
      const newUnique = generatedAlerts.filter((a) => !existingKeySet.has(`${a.ruleId}-${a.department}`));
      if (newUnique.length > 0) {
        const combined = [...newUnique, ...alertEvents];
        setAlertEvents(combined);
        saveVaultData('alertEvents', combined);
        setActiveNotification(`Trigger Alert Fired: ${newUnique[0].message}`);
      }
    }
  };

  const handleSaveTriggerRule = async (newRule: NotificationTriggerRule) => {
    const exists = triggerRules.some((r) => r.id === newRule.id);
    const updated = exists
      ? triggerRules.map((r) => (r.id === newRule.id ? newRule : r))
      : [newRule, ...triggerRules];
    setTriggerRules(updated);
    await saveVaultData('triggerRules', updated);
    logAudit(`Configured Trigger Rule: ${newRule.name}`, 'Security', `Metric: ${newRule.metricType}, Threshold: ${newRule.thresholdValue}`);
    handleRunTriggerEvaluation(updated);
  };

  const handleDeleteTriggerRule = async (ruleId: string) => {
    const updated = triggerRules.filter((r) => r.id !== ruleId);
    setTriggerRules(updated);
    await saveVaultData('triggerRules', updated);
    logAudit(`Deleted Trigger Rule: ${ruleId}`, 'Security', 'Rule removed');
  };

  const handleToggleTriggerRule = async (ruleId: string) => {
    const updated = triggerRules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    setTriggerRules(updated);
    await saveVaultData('triggerRules', updated);
    logAudit(`Toggled Trigger Rule: ${ruleId}`, 'Security', 'Active flag updated');
  };

  // Smart Academic Calendar Handlers
  const handleAddCalendarEvent = async (ev: AcademicCalendarEvent) => {
    const updated = [ev, ...calendarEvents];
    setCalendarEvents(updated);
    await saveVaultData('calendarEvents', updated);
    logAudit(`Added Calendar Event: ${ev.title}`, 'Accreditation', `${ev.category} on ${ev.startDate}`);
  };

  const handleUpdateCalendarEvent = async (ev: AcademicCalendarEvent) => {
    const updated = calendarEvents.map((c) => (c.id === ev.id ? ev : c));
    setCalendarEvents(updated);
    await saveVaultData('calendarEvents', updated);
    logAudit(`Updated Calendar Event: ${ev.title}`, 'Accreditation', `ID: ${ev.id}`);
  };

  const handleDeleteCalendarEvent = async (evId: string) => {
    const updated = calendarEvents.filter((c) => c.id !== evId);
    setCalendarEvents(updated);
    await saveVaultData('calendarEvents', updated);
    logAudit(`Deleted Calendar Event: ${evId}`, 'Accreditation', 'Event removed from calendar');
  };

  const handleSyncCalendarFromSources = async () => {
    const syncedItems: AcademicCalendarEvent[] = [];

    // Sync exams from sessionals
    sessionals.forEach((s) => {
      syncedItems.push({
        id: `cal-sync-exam-${s.id}`,
        title: `${s.subjectCode} - ${s.subjectName} (${s.sessionalNumber})`,
        category: 'EXAM',
        startDate: s.examDate,
        department: s.programName,
        venue: 'Examination Complex - Block B',
        targetAudience: `${s.programName} • ${s.termLabel}`,
        status: s.status === 'Controller Verified' ? 'COMPLETED' : 'SCHEDULED',
        syncSource: 'EXAM_MODULE',
        description: `Max Marks: ${s.maxMarks}, Class Average: ${s.averageMarksObtained} marks`,
        responsibleLead: s.evaluator || 'Controller of Examinations',
        naacCriterion: 2,
      });
    });

    // Sync audits from AAA
    audits.forEach((a) => {
      syncedItems.push({
        id: `cal-sync-audit-${a.id}`,
        title: `AAA Internal Quality Audit: ${a.department} (${a.auditCycle})`,
        category: 'AUDIT',
        startDate: a.auditDate,
        department: a.department,
        venue: 'Department Conference Hall',
        targetAudience: 'HOD, Course Coordinators, Criterion Leads',
        status: a.status === 'Closed' ? 'COMPLETED' : 'SCHEDULED',
        syncSource: 'AAA_MODULE',
        description: `Lead Auditor: ${a.leadAuditor}, Type: ${a.type}`,
        responsibleLead: a.leadAuditor,
        naacCriterion: 6,
      });
    });

    // Sync activities from CampusActivities
    campusActivities.forEach((act) => {
      syncedItems.push({
        id: `cal-sync-act-${act.id}`,
        title: act.title,
        category: act.category.includes('Sports') ? 'SPORTS_CULTURAL' : 'SEMINAR_SYMPOSIUM',
        startDate: act.startDate,
        endDate: act.endDate,
        department: act.organizingDepartment,
        venue: act.venue,
        targetAudience: `${act.participantCount} Expected Delegates`,
        status: act.status === 'Completed' ? 'COMPLETED' : 'SCHEDULED',
        syncSource: 'CAMPUS_ACTIVITY',
        description: act.keyOutcomes,
        responsibleLead: act.facultyCoordinator,
        naacCriterion: act.naacCriterionLink,
      });
    });

    const existingIds = new Set(calendarEvents.map((c) => c.id));
    const newItems = syncedItems.filter((item) => !existingIds.has(item.id));
    const merged = [...newItems, ...calendarEvents];
    setCalendarEvents(merged);
    await saveVaultData('calendarEvents', merged);
    logAudit(`Synced ${newItems.length} events from ERP modules to Academic Calendar`, 'Accreditation', 'Multi-Module Sync');
  };

  const handleClearCacheAndReset = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('institutional_eoms_vault');
      }
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
    } catch (err) {
      console.error('Error clearing local cache:', err);
    } finally {
      window.location.reload();
    }
  };

  const unreadAlertCount = alertEvents.filter((a) => a.status === 'UNREAD').length;
  const topCriticalAlert = alertEvents.find((a) => a.severity === 'CRITICAL' && a.status === 'UNREAD');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation & Operational Status Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-lg">
              ⚕
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">PharmMed ERP</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  ISO 21001:2025
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Multi-Faculty Medical, Pharmacy, Tech, Science &amp; Commerce IQAC Suite
              </p>
            </div>
          </div>

          {/* Offline / Cloud Sync & Role Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Bulk Export Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
              title="Institutional Bulk Export Utility (PDF, XLSX, CSV, XML)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Center</span>
            </button>

            {/* PWA Installation Guide & System Help Modal Button */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs transition-all cursor-pointer"
              title="PWA Installation SOP (Desktop & Mobile) & System Troubleshooting"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Help &amp; SOP</span>
            </button>

            {/* Real-Time Automated Trigger Alert Center Button */}
            <button
              onClick={() => setIsAlertCenterOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs transition-all cursor-pointer"
              title="Automated Trigger Alerts & Notification Center"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Alerts</span>
              {unreadAlertCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {/* Offline Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isOnline ? 'Cloud Synced' : 'Offline Vault'}</span>
            </div>

            {/* Pending Sync Queue */}
            {pendingSyncCount > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all cursor-pointer"
                title="Click to sync offline changes with cloud"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{pendingSyncCount} Pending Sync</span>
              </button>
            )}

            {/* Active Role Badge with Selector */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <div className="text-left">
                <div className="font-semibold text-slate-200 text-[11px] leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-sky-400 font-mono leading-tight">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <div className="border-t border-slate-800 bg-slate-900/60 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5 min-w-max">
            {[
              { id: 'Accreditation', label: 'IQAC & NAAC 1-10 Matrix', icon: Award },
              { id: 'AcademicCalendar', label: 'Smart Academic Calendar', icon: Calendar },
              { id: 'StudentFinanceHub', label: 'Student, Fees & Results Suite', icon: DollarSign },
              { id: 'FeedbackRadar', label: 'Student Feedback & Quality Radar', icon: Compass },
              { id: 'FacultySuite', label: 'Faculty & KYC Suite', icon: Users },
              { id: 'CampusEvents', label: 'Sports, Seminars & Activities', icon: Trophy },
              { id: 'Exams', label: 'Exams & Sessional Management', icon: FileCheck2 },
              { id: 'DepartmentAdmin', label: 'Workload, Labs & Ledger', icon: Building2 },
              { id: 'SOPs', label: 'Institutional SOP Studio', icon: FileText },
              { id: 'AAA', label: 'Academic & Admin Audit (AAA)', icon: ClipboardList },
              { id: 'LMS', label: 'Curriculum & Competency LMS', icon: GraduationCap },
              { id: 'Backup', label: 'Data Backup & Recovery', icon: HardDrive },
              { id: 'Security', label: 'RBAC, 2FA & Triggers', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeNav === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNav(tab.id as ActiveNav)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Real-time Critical Trigger Alert Banner Strip */}
      {topCriticalAlert && (
        <div className="bg-rose-950/50 border-b border-rose-500/40 px-4 py-2.5 text-xs text-rose-200 animate-in fade-in duration-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-rose-300 uppercase tracking-wider text-[11px] bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                  {topCriticalAlert.ruleName}
                </span>
                <span className="text-slate-200">{topCriticalAlert.message}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAlertCenterOpen(true)}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold cursor-pointer transition-colors"
              >
                Inspect in Alert Center
              </button>
              <button
                onClick={() => handleAcknowledgeAlert(topCriticalAlert.id)}
                className="text-rose-400 hover:text-rose-200 text-xs cursor-pointer ml-1 font-medium underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campus Alert Notification Strip */}
      {activeNotification && (
        <div className="bg-sky-500/10 border-b border-sky-500/20 px-4 py-2 text-xs text-sky-300 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{activeNotification}</span>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-sky-400/80 hover:text-sky-200 text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeNav === 'Accreditation' && (
          <AccreditationDashboard
            metrics={metrics}
            onSelectMetric={(m) => {
              setActiveNotification(`Inspecting ${m.metricCode}: ${m.criterionTitle}`);
            }}
          />
        )}

        {/* Smart Academic Calendar & Milestones Hub */}
        {activeNav === 'AcademicCalendar' && (
          <SmartAcademicCalendar
            events={calendarEvents}
            onAddEvent={handleAddCalendarEvent}
            onUpdateEvent={handleUpdateCalendarEvent}
            onDeleteEvent={handleDeleteCalendarEvent}
            onSyncExternalSources={handleSyncCalendarFromSources}
          />
        )}

        {/* Student, Fees & Results Management Suite */}
        {activeNav === 'StudentFinanceHub' && (
          <div className="space-y-6">
            {/* Hub Sub-Tab Selector Strip */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setStudentHubSubTab('fees');
                    setStudentHubFocusedId(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    studentHubSubTab === 'fees'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Fee Management &amp; Billing Suite</span>
                </button>
                <button
                  onClick={() => {
                    setStudentHubSubTab('students');
                    setStudentHubFocusedId(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    studentHubSubTab === 'students'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Student Dossier Directory</span>
                </button>
                <button
                  onClick={() => {
                    setStudentHubSubTab('results');
                    setStudentHubFocusedId(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    studentHubSubTab === 'results'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Examination Results &amp; Grade Cards</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800/80 font-medium">
                {studentHubSubTab === 'fees' && 'Integrated Indian Rupee (₹) Billing with UPI & Late-Fee Calculator'}
                {studentHubSubTab === 'students' && 'CBCS Academic Standings & Clearance Profiles'}
                {studentHubSubTab === 'results' && 'Official Grade Cards with Controller Verification'}
              </div>
            </div>

            {/* Sub-tab 1: Fee Management */}
            {studentHubSubTab === 'fees' && (
              <FeeManagementSuite
                feeAccounts={feeAccountsList}
                receipts={feeReceiptsList}
                students={studentsList}
                preselectedStudentId={studentHubFocusedId}
                onCollectFee={async (newReceipt, updatedAccount) => {
                  const updatedAccounts = feeAccountsList.map((a) =>
                    a.id === updatedAccount.id ? updatedAccount : a
                  );
                  const updatedReceipts = [newReceipt, ...feeReceiptsList];
                  setFeeAccountsList(updatedAccounts);
                  setFeeReceiptsList(updatedReceipts);

                  // Update student's fee status
                  const updatedStudents = studentsList.map((s) => {
                    if (s.id === updatedAccount.studentId) {
                      return { ...s, feeStatus: updatedAccount.paymentStatus };
                    }
                    return s;
                  });
                  setStudentsList(updatedStudents);

                  await saveVaultData('feeAccounts', updatedAccounts);
                  await saveVaultData('feeReceipts', updatedReceipts);
                  await saveVaultData('students', updatedStudents);

                  logAudit(
                    `Fee Collected: ₹${newReceipt.totalTransactionAmount} for ${newReceipt.studentName}`,
                    'Finance',
                    `Receipt: ${newReceipt.receiptNumber} (${newReceipt.paymentMethod})`
                  );
                  setActiveNotification(
                    `Payment of ₹${newReceipt.totalTransactionAmount.toLocaleString('en-IN')} received. Receipt ${newReceipt.receiptNumber} generated.`
                  );
                }}
              />
            )}

            {/* Sub-tab 2: Students Directory */}
            {studentHubSubTab === 'students' && (
              <StudentsDirectoryView
                students={studentsList}
                facultyFilter="All"
                onSelectStudentForFee={(stdId) => {
                  setStudentHubFocusedId(stdId);
                  setStudentHubSubTab('fees');
                }}
                onSelectStudentForResult={(stdId) => {
                  setStudentHubFocusedId(stdId);
                  setStudentHubSubTab('results');
                }}
                onAddNewStudent={async (newStudent) => {
                  const updated = [newStudent, ...studentsList];
                  setStudentsList(updated);

                  // Also create default fee account
                  const newFeeAccount: StudentFeeAccount = {
                    id: `fee-${Date.now()}`,
                    studentId: newStudent.id,
                    enrollmentNo: newStudent.enrollmentNo,
                    studentName: newStudent.fullName,
                    programName: newStudent.programName,
                    academicYear: '2025-2026',
                    termLabel: newStudent.currentYearOrSemester,
                    feeHeads: [
                      { id: `fh-${Date.now()}-1`, headName: 'Tuition', amount: 65000 },
                      { id: `fh-${Date.now()}-2`, headName: 'Laboratory & Consumables', amount: 20000 },
                      { id: `fh-${Date.now()}-3`, headName: 'Examination', amount: 4500 },
                      { id: `fh-${Date.now()}-4`, headName: 'Library & Digital', amount: 3500 },
                    ],
                    totalAssessed: 93000,
                    concessionOrScholarship: 0,
                    netPayable: 93000,
                    amountPaid: 0,
                    outstandingBalance: 93000,
                    dueDate: '2026-10-15',
                    paymentStatus: 'Pending',
                    applicableLateFeePerDay: 100,
                    calculatedLateFee: 0,
                    gracePeriodDays: 10,
                  };
                  const updatedAccounts = [newFeeAccount, ...feeAccountsList];
                  setFeeAccountsList(updatedAccounts);

                  await saveVaultData('students', updated);
                  await saveVaultData('feeAccounts', updatedAccounts);

                  logAudit(`Student Enrolled: ${newStudent.fullName}`, 'Security', `ENR: ${newStudent.enrollmentNo}`);
                  setActiveNotification(`Student ${newStudent.fullName} enrolled successfully.`);
                }}
              />
            )}

            {/* Sub-tab 3: Results Management */}
            {studentHubSubTab === 'results' && (
              <ResultsManagementView
                results={studentResultsList}
                students={studentsList}
                preselectedStudentId={studentHubFocusedId}
              />
            )}
          </div>
        )}

        {/* Student Feedback Loop & Institutional Quality Radar */}
        {activeNav === 'FeedbackRadar' && (
          <FeedbackRadarModule
            audits={audits}
            onAddAudit={async (newAudit) => {
              const updated = [newAudit, ...audits];
              setAudits(updated);
              await saveVaultData('audits', updated);
              logAudit(`Feedback Loop Scheduled Audit: ${newAudit.department}`, 'Audit', newAudit.triggerReason || 'ISO 10.2 Review');
              setActiveNotification(`Audit scheduled in AAA Manager for ${newAudit.department}`);
            }}
            onNavigateToAAAManager={() => setActiveNav('AAA')}
            feedbackList={feedbackEntries}
            onSaveFeedbackList={async (updatedList) => {
              setFeedbackEntries(updatedList);
              await saveVaultData('feedback', updatedList);
              logAudit(`Logged Stakeholder Feedback (${updatedList[0]?.role})`, 'Accreditation', `ID: ${updatedList[0]?.id}`);
            }}
            currentUser={currentUser}
          />
        )}

        {/* Faculty Management Suite with Statutory KYC Vault */}
        {activeNav === 'FacultySuite' && (
          <FacultyManagementSuite
            facultyList={facultyList}
            onAddFaculty={async (newFac) => {
              const updated = [newFac, ...facultyList];
              setFacultyList(updated);
              await saveVaultData('faculty', updated);
              logAudit(`Registered Faculty: ${newFac.name}`, 'Security', `${newFac.designation} (${newFac.empId})`);
              setActiveNotification(`Faculty member ${newFac.name} successfully registered.`);
            }}
            onUpdateFaculty={async (updatedFac) => {
              const updated = facultyList.map((f) => (f.id === updatedFac.id ? updatedFac : f));
              setFacultyList(updated);
              await saveVaultData('faculty', updated);
              logAudit(`Updated Faculty: ${updatedFac.name}`, 'Security', `Status: ${updatedFac.status}`);
              setActiveNotification(`Faculty record for ${updatedFac.name} updated.`);
            }}
            onDeleteFaculty={async (id) => {
              const updated = facultyList.filter((f) => f.id !== id);
              setFacultyList(updated);
              await saveVaultData('faculty', updated);
              logAudit(`Deleted Faculty Record: ${id}`, 'Security', 'Removed from faculty directory');
              setActiveNotification(`Faculty record removed.`);
            }}
            isAdminOrAuthorized={isAdminOrAuthorized}
          />
        )}

        {/* Sports, Seminars, Symposiums & Campus Activities Hub */}
        {activeNav === 'CampusEvents' && (
          <CampusActivityManagement
            activities={campusActivities}
            onAddActivity={async (newAct) => {
              const updated = [newAct, ...campusActivities];
              setCampusActivities(updated);
              await saveVaultData('activities', updated);
              logAudit(`Scheduled Campus Activity: ${newAct.title}`, 'Accreditation', `${newAct.category} (${newAct.activityCode})`);
              setActiveNotification(`Activity "${newAct.title}" scheduled.`);
            }}
            onUpdateActivity={async (updatedAct) => {
              const updated = campusActivities.map((a) => (a.id === updatedAct.id ? updatedAct : a));
              setCampusActivities(updated);
              await saveVaultData('activities', updated);
              logAudit(`Updated Campus Activity: ${updatedAct.title}`, 'Accreditation', `Status: ${updatedAct.status}`);
              setActiveNotification(`Activity "${updatedAct.title}" updated.`);
            }}
            onDeleteActivity={async (id) => {
              const updated = campusActivities.filter((a) => a.id !== id);
              setCampusActivities(updated);
              await saveVaultData('activities', updated);
              logAudit(`Deleted Campus Activity: ${id}`, 'Accreditation', 'Removed from events register');
              setActiveNotification(`Activity record removed.`);
            }}
            isAdminOrAuthorized={isAdminOrAuthorized}
          />
        )}

        {/* Dedicated Exam Management Module */}
        {activeNav === 'Exams' && (
          <ExamManagementModule
            programs={programs}
            sessionals={sessionals}
            onAddProgram={async (prog) => {
              const updated = [prog, ...programs];
              setPrograms(updated);
              await saveVaultData('programs', updated);
              logAudit(`Created Program: ${prog.programCode}`, 'Exams', prog.programName);
            }}
            onUpdateProgram={async (prog) => {
              const updated = programs.map((p) => (p.id === prog.id ? prog : p));
              setPrograms(updated);
              await saveVaultData('programs', updated);
              logAudit(`Updated Program: ${prog.programCode}`, 'Exams', prog.programName);
            }}
            onDeleteProgram={async (id) => {
              const updated = programs.filter((p) => p.id !== id);
              setPrograms(updated);
              await saveVaultData('programs', updated);
              logAudit(`Deleted Program: ${id}`, 'Exams', 'Removed offering');
            }}
            onAddSessional={async (sess) => {
              const updated = [sess, ...sessionals];
              setSessionals(updated);
              await saveVaultData('sessionals', updated);
              logAudit(`Scheduled Sessional: ${sess.subjectCode}`, 'Exams', `${sess.sessionalNumber} - ${sess.subjectName}`);
            }}
            onUpdateSessional={async (sess) => {
              const updated = sessionals.map((s) => (s.id === sess.id ? sess : s));
              setSessionals(updated);
              await saveVaultData('sessionals', updated);
              logAudit(`Updated Sessional Marks: ${sess.subjectCode}`, 'Exams', `${sess.averageMarksObtained} avg marks`);
            }}
            onDeleteSessional={async (id) => {
              const updated = sessionals.filter((s) => s.id !== id);
              setSessionals(updated);
              await saveVaultData('sessionals', updated);
              logAudit(`Deleted Sessional Record: ${id}`, 'Exams', 'Assessment purged');
            }}
            onImportSessionals={async (imported) => {
              const updated = [...imported, ...sessionals];
              setSessionals(updated);
              await saveVaultData('sessionals', updated);
              logAudit(`Imported ${imported.length} Sessional Records`, 'Exams', 'Batch CSV/JSON Import');
            }}
            isAdminOrAuthorized={isAdminOrAuthorized}
          />
        )}

        {/* Department Administration Center with Faculty Workload */}
        {activeNav === 'DepartmentAdmin' && (
          <DepartmentAdminCenter
            assets={assets}
            chemicals={chemicals}
            budgets={budgets}
            workloads={workloads}
            onAddAsset={async (newA) => {
              const updated = [newA, ...assets];
              setAssets(updated);
              await saveVaultData('assets', updated);
              logAudit(`Registered Asset: ${newA.name}`, 'Finance', `SN: ${newA.serialNumber}`);
            }}
            onUpdateAsset={async (upA) => {
              const updated = assets.map((a) => (a.id === upA.id ? upA : a));
              setAssets(updated);
              await saveVaultData('assets', updated);
              logAudit(`Updated Asset: ${upA.name}`, 'Finance', `Calibration: ${upA.calibrationDueDate}`);
            }}
            onDeleteAsset={async (id) => {
              const updated = assets.filter((a) => a.id !== id);
              setAssets(updated);
              await saveVaultData('assets', updated);
              logAudit(`Deleted Asset: ${id}`, 'Finance', 'Asset decommissioned');
            }}
            onImportAssets={async (imported) => {
              const updated = [...imported, ...assets];
              setAssets(updated);
              await saveVaultData('assets', updated);
              logAudit(`Imported ${imported.length} Assets`, 'Finance', 'Batch equipment import');
            }}
            onAddChemical={async (newC) => {
              const updated = [newC, ...chemicals];
              setChemicals(updated);
              await saveVaultData('chemicals', updated);
              logAudit(`Registered Chemical: ${newC.name}`, 'Audit', `CAS: ${newC.casNumber}`);
            }}
            onUpdateChemical={async (upC) => {
              const updated = chemicals.map((c) => (c.id === upC.id ? upC : c));
              setChemicals(updated);
              await saveVaultData('chemicals', updated);
              logAudit(`Updated Chemical: ${upC.name}`, 'Audit', `Stock: ${upC.currentStock} ${upC.unit}`);
            }}
            onDeleteChemical={async (id) => {
              const updated = chemicals.filter((c) => c.id !== id);
              setChemicals(updated);
              await saveVaultData('chemicals', updated);
              logAudit(`Deleted Chemical: ${id}`, 'Audit', 'Reagent decommissioned');
            }}
            onImportChemicals={async (imported) => {
              const updated = [...imported, ...chemicals];
              setChemicals(updated);
              await saveVaultData('chemicals', updated);
              logAudit(`Imported ${imported.length} Chemicals`, 'Audit', 'Batch chemical hazard import');
            }}
            onAddWorkload={async (newW) => {
              const updated = [newW, ...workloads];
              setWorkloads(updated);
              await saveVaultData('workloads', updated);
              logAudit(`Added Faculty Workload: ${newW.facultyName}`, 'Workload', `${newW.teachingHoursPerWeek}h/wk teaching`);
            }}
            onUpdateWorkload={async (upW) => {
              const updated = workloads.map((w) => (w.id === upW.id ? upW : w));
              setWorkloads(updated);
              await saveVaultData('workloads', updated);
              logAudit(`Updated Workload: ${upW.facultyName}`, 'Workload', `Score: ${upW.complianceScore}%`);
            }}
            onDeleteWorkload={async (id) => {
              const updated = workloads.filter((w) => w.id !== id);
              setWorkloads(updated);
              await saveVaultData('workloads', updated);
              logAudit(`Deleted Faculty Workload: ${id}`, 'Workload', 'Workload removed');
            }}
            onImportWorkloads={async (imported) => {
              const updated = [...imported, ...workloads];
              setWorkloads(updated);
              await saveVaultData('workloads', updated);
              logAudit(`Imported ${imported.length} Faculty Workload Records`, 'Workload', 'Batch Workload Import');
            }}
            isAdminOrAuthorized={isAdminOrAuthorized}
          />
        )}

        {activeNav === 'SOPs' && (
          <SOPStudio
            sops={sops}
            onSaveSOP={handleSaveSOP}
            currentUserRole={currentUser.role}
          />
        )}

        {activeNav === 'AAA' && (
          <AAAManager
            auditRecords={audits}
            metrics={metrics}
            onUpdateNCStatus={handleUpdateNCStatus}
            onAddAuditRecord={(rec) => {
              const updated = [rec, ...audits];
              setAudits(updated);
              saveVaultData('audits', updated);
              logAudit(`Scheduled Audit Cycle: ${rec.auditCycle}`, 'Audit', rec.department);
            }}
            onBatchAddAuditRecords={(recs) => {
              const updated = [...recs, ...audits];
              setAudits(updated);
              saveVaultData('audits', updated);
              logAudit(`Auto-Scheduled ${recs.length} Quality Audits`, 'Audit', 'ISO 21001 & NAAC Maturity Scheduler');
              setActiveNotification(`Auto-scheduled ${recs.length} internal audits in AAAManager.`);
            }}
            isAdminOrAuthorized={isAdminOrAuthorized}
          />
        )}

        {activeNav === 'LMS' && (
          <LMSPortal
            courses={courses}
            onSelectCourse={(c) => {
              setActiveNotification(`Loaded course pack for ${c.code} (${c.title})`);
            }}
          />
        )}

        {activeNav === 'Backup' && (
          <BackupCenter
            backups={backups}
            allDataState={allDataBundle}
            onRestoreSnapshot={handleRestoreSnapshot}
            onAddNewBackup={handleAddNewBackup}
          />
        )}

        {activeNav === 'Security' && (
          <SystemSecurityConsole
            currentUser={currentUser}
            auditLogs={auditLogs}
            onRoleSwitch={handleRoleSwitch}
            triggerRules={triggerRules}
            onSaveRule={handleSaveTriggerRule}
            onDeleteRule={handleDeleteTriggerRule}
            onToggleRule={handleToggleTriggerRule}
            onRunEvaluation={() => handleRunTriggerEvaluation()}
            onClearCache={handleClearCacheAndReset}
            onOpenPwaGuide={() => setIsHelpModalOpen(true)}
          />
        )}
      </main>

      {/* Institutional Notification & Trigger Alert Center Modal */}
      <AlertCenterModal
        isOpen={isAlertCenterOpen}
        onClose={() => setIsAlertCenterOpen(false)}
        alerts={alertEvents}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
        onNavigateToModule={(mod) => {
          if (mod === 'Accreditation' || mod === 'accreditation') setActiveNav('Accreditation');
          else if (mod === 'DepartmentAdmin' || mod === 'department-admin') setActiveNav('DepartmentAdmin');
          else if (mod === 'AAA' || mod === 'aaa') setActiveNav('AAA');
          else if (mod === 'FacultySuite' || mod === 'faculty') setActiveNav('FacultySuite');
          else if (mod === 'CampusEvents' || mod === 'campus-events') setActiveNav('CampusEvents');
          else if (mod === 'AcademicCalendar' || mod === 'calendar') setActiveNav('AcademicCalendar');
        }}
        onOpenTriggerConfig={() => setActiveNav('Security')}
      />

      {/* Institutional Bulk Export Modal (PDF, XLSX, CSV, XML) */}
      <ExportUtilityModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        dataBundle={allExportDataBundle}
      />

      {/* PWA Installation SOP & System Troubleshooting Modal */}
      <SystemHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onClearCacheAndReset={handleClearCacheAndReset}
        onTriggerSync={handleManualSync}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 PharmMed Institutional Governance &amp; IQAC ERP • Complying with ISO 21001:2025, NAAC, NBA, and NIRF
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>PWA Offline Vault Active</span>
            <span>•</span>
            <span>Local IndexedDB Ready</span>
            <span>•</span>
            <span className="text-emerald-400">AES-256 Cloud Sealed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
