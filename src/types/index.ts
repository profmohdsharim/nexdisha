// Extended Domain models for PharmMed Enterprise ERP & IQAC Suite

export type FacultyCluster = 
  | 'Medical'
  | 'Pharmacy'
  | 'Paramedical'
  | 'Engineering'
  | 'Sciences'
  | 'Arts'
  | 'Commerce';

export type UserRole = 
  | 'Dean_Principal'
  | 'IQAC_Director'
  | 'HOD_Faculty'
  | 'Lab_Incharge'
  | 'Student_Resident'
  | 'Finance_Officer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty: FacultyCluster;
  department: string;
  avatar?: string;
  twoFactorEnabled: boolean;
}

export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

export interface NaacMetric {
  criterionId: number; // 1 to 10
  criterionTitle: string;
  metricCode: string;
  metricDescription: string;
  metricType: 'Quantitative' | 'Qualitative';
  benchmark: string;
  currentScore: number; // 0-100 or weighted score
  maxScore: number;
  weightage: number;
  status: 'Compliant' | 'Needs Improvement' | 'Pending Review' | 'Verified';
  evidenceCount: number;
  lastUpdated: string;
  remarks: string;
}

export interface AccreditationSummary {
  overallScorePercentage: number;
  projectedCGPA: number;
  binaryStatus: 'Accredited' | 'Awaiting Accreditation';
  maturityLevel: MaturityLevel;
  maturityLabel: string;
  nirfProjectedRank: string;
  nbaAccreditedPrograms: number;
  totalPrograms: number;
  iso21001ComplianceScore: number;
}

export interface SOPDocument {
  id: string;
  sopNumber: string;
  title: string;
  faculty: FacultyCluster;
  department: string;
  category: 'Safety' | 'Equipment' | 'Clinical' | 'Academic' | 'Administrative' | 'Chemical & Bio-waste';
  version: string;
  effectiveDate: string;
  reviewDate: string;
  author: string;
  reviewer: string;
  approver: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Published';
  scope: string;
  procedureSteps: string[];
  safetyPrecautions: string[];
  wasteDisposalCode: string;
  hazards: string[];
}

export interface AAAAuditRecord {
  id: string;
  auditCycle: string;
  type: 'Internal' | 'External Peer Review' | 'Surprise Quality Check';
  department: string;
  faculty: FacultyCluster;
  leadAuditor: string;
  auditDate: string;
  status: 'Scheduled' | 'In Progress' | 'Action Required' | 'Closed';
  // Automated Scheduling & ISO 21001:2025 Trigger Metadata
  isAutoScheduled?: boolean;
  triggerType?: 'Maturity Score Drop' | 'ISO 21001 Timeline' | 'High-Risk Lab Check' | 'Manual Request';
  triggerReason?: string;
  isoClause?: string; // e.g. "ISO 21001:2025 Clause 9.2 (Internal Audit)"
  targetCriterionId?: number;
  scoreDropPercentage?: number;
  complianceDeadline?: string;
  nonConformances: {
    id: string;
    type: 'Major NC' | 'Minor NC' | 'OFI' | 'Good Practice';
    description: string;
    rootCause: string;
    capaPlan: string;
    assignee: string;
    dueDate: string;
    status: 'Open' | 'Under Review' | 'Verified & Closed';
  }[];
}

export interface LMSCourse {
  id: string;
  code: string;
  title: string;
  faculty: FacultyCluster;
  program: string;
  instructor: string;
  credits: number;
  enrolledStudents: number;
  modulesCount: number;
  completedLectures: number;
  totalLectures: number;
  coCount: number;
  averageAttainment: number;
  recentTopic: string;
  hasLabOrClinical: boolean;
  labLocation?: string;
}

export interface DepartmentAsset {
  id: string;
  name: string;
  department: string;
  faculty: FacultyCluster;
  serialNumber: string;
  calibrationDueDate: string;
  amcStatus: 'Active' | 'Expiring Soon' | 'Overdue';
  operationalStatus: 'Operational' | 'Under Maintenance' | 'Calibration Due';
  cost: number;
  custodian: string;
}

export interface ChemicalInventoryItem {
  id: string;
  name: string;
  casNumber: string;
  department: string;
  faculty: FacultyCluster;
  currentStock: number;
  unit: 'g' | 'kg' | 'mL' | 'L';
  minimumThreshold: number;
  hazardClass: 'Flammable' | 'Toxic/Poison' | 'Corrosive' | 'Biohazard' | 'General';
  storageLocation: string;
  lastInspected: string;
}

export interface FinancialBudgetRecord {
  department: string;
  faculty: FacultyCluster;
  allocatedBudget: number;
  expenditure: number;
  committed: number;
  availableBalance: number;
  grantFunded: number;
}

// ----------------------------------------------------
// Faculty Workload & NAAC/NBA Research Metrics
// ----------------------------------------------------
export interface FacultyWorkloadRecord {
  id: string;
  facultyName: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Clinical Instructor' | 'Lab Demonstrator';
  facultyCluster: FacultyCluster;
  department: string;
  teachingHoursPerWeek: number; // NAAC/AICTE norm: Asst Prof 16h, Assoc Prof 14h, Prof 12-14h
  prescribedHoursNorm: number;
  labPracticalHours: number;
  clinicalWardHours: number;
  mentoringHours: number;
  administrativeHours: number;
  scopusWosPapers: number; // NBA/NAAC Metric
  patentsGrantedOrFiled: number;
  fundedGrantAmountLakhs: number;
  phdScholarsGuided: number;
  naacComplianceStatus: 'Optimal (Compliant)' | 'Overloaded' | 'Underutilized' | 'Research Deficit';
  complianceScore: number; // 0 - 100
}

// ----------------------------------------------------
// Exam Management (Semester & Yearly Mode)
// ----------------------------------------------------
export type AcademicCycleMode = '6-Month Semester' | 'Yearly Annual';

export interface SubjectModule {
  id: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  type: 'Theory' | 'Practical / Lab' | 'Clinical Posting' | 'Project / Viva';
  maxTheoryMarks: number;
  maxPracticalMarks: number;
  maxSessionalMarks: number;
}

export interface AcademicProgramOffering {
  id: string;
  programCode: string;
  programName: string; // e.g. "B.Pharm", "Pharm.D", "MBBS", "BMLT", "B.Tech Biomedical"
  facultyCluster: FacultyCluster;
  cycleMode: AcademicCycleMode;
  totalTerms: number; // e.g. 8 Semesters or 4 Years
  currentTermIndex: number; // e.g. Semester 4 or Year 2
  termLabel: string; // e.g. "Semester IV" or "Year II"
  academicSession: string; // e.g. "2025-2026"
  subjects: SubjectModule[];
}

export interface SessionalAssessmentRecord {
  id: string;
  programId: string;
  programName: string;
  termLabel: string;
  subjectCode: string;
  subjectName: string;
  sessionalNumber: 'Sessional 1' | 'Sessional 2' | 'Sessional 3 / Improvement' | 'Internal Practical Exam';
  examDate: string;
  totalCandidates: number;
  passPercentage: number;
  averageMarksObtained: number;
  maxMarks: number;
  evaluator: string;
  status: 'Draft Scheduled' | 'Marks Uploaded' | 'HOD Approved' | 'Controller Verified';
}

export interface SyncQueueItem {
  id: string;
  timestamp: string;
  entity: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payloadSummary: string;
  status: 'Synced' | 'Pending Cloud Sync' | 'Conflict Resolved';
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  type: 'Automated Scheduled' | 'Manual Cold Export' | 'Pre-Audit Snapshot';
  sizeKB: number;
  recordCount: number;
  sha256Checksum: string;
  status: 'Verified Healthy' | 'Archived' | 'Cloud Mirrored';
  operator: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: 'Accreditation' | 'SOP' | 'Audit' | 'LMS' | 'Security' | 'Backup' | 'Finance' | 'Exams' | 'Workload';
  ipAddress: string;
  details: string;
}

export type StakeholderRole = 'student' | 'faculty';

export interface FeedbackRatingItem {
  id: string;
  dimensionKey: string;
  label: string;
  isoClause: string;
  naacCriterionId: number;
  score: number; // 1 to 5
}

export interface StakeholderFeedbackEntry {
  id: string;
  role: StakeholderRole;
  department: string;
  academicYear: string;
  semesterCohort: string;
  respondentIdentifier: string; // Anonymous or pseudonym
  submittedAt: string;
  ratings: Record<string, number>; // dimensionKey -> 1..5
  qualitativeComments: string;
  sentiment: 'positive' | 'neutral' | 'critical';
  isoClauseTags: string[];
  naacCriterionTags: number[];
  status: 'Reviewed' | 'Action Triggered' | 'CAPA Completed' | 'Archived';
  escalatedAuditId?: string;
}

export interface RadarQualityDimension {
  dimensionKey: string;
  shortLabel: string;
  fullLabel: string;
  isoClause: string;
  isoClauseTitle: string;
  naacCriterionId: number;
  naacCriterionTitle: string;
  studentAttainment: number; // 0..100
  facultyAttainment: number; // 0..100
  compositeAttainment: number; // 0..100
  benchmarkTarget: number; // e.g. 85
  auditScore: number; // e.g. 88
  responseCount: number;
  gapStatus: 'Exceeds Benchmark' | 'On Track' | 'Under Surveillance' | 'Critical Non-Conformance';
}

export type FacultyDesignation =
  | 'Professor'
  | 'Associate Professor'
  | 'Assistant Professor'
  | 'Lecturer'
  | 'Guest Faculty'
  | 'Visiting Scholar'
  | 'Emeritus Professor';

export type FacultyEmploymentType =
  | 'Permanent / Regular'
  | 'Tenure-Track'
  | 'Contractual'
  | 'Guest Faculty (Short-Term)'
  | 'Adjunct';

export type FacultyStatus = 'Active' | 'On Sabbatical' | 'Restricted / Inactive' | 'Retired';

export interface FacultyKYCDocuments {
  aadhaarNumber: string; // Stored securely, displayed masked e.g. XXXX-XXXX-1234
  panNumber: string; // e.g. ABCDE1234F
  passportNumber?: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankBranch: string;
  appointmentLetterNumber: string;
  appointmentDate: string;
  appointmentLetterUrl?: string;
  isKycVerified: boolean;
  testimonials: Array<{
    id: string;
    title: string;
    issuingOrganization: string;
    year: number;
    verified: boolean;
  }>;
}

export interface GuestFacultyTerms {
  honorariumPerSession: number;
  tenureDurationMonths: number;
  affiliatedInstitution: string;
  specialLectureTopic: string;
  mouReferenceCode?: string;
}

export interface FacultyMember {
  id: string;
  empId: string;
  name: string;
  email: string;
  phone: string;
  facultyCluster: FacultyCluster;
  department: string;
  designation: FacultyDesignation;
  employmentType: FacultyEmploymentType;
  status: FacultyStatus;
  joinDate: string;
  qualification: string;
  specialization: string;
  kyc: FacultyKYCDocuments;
  guestTerms?: GuestFacultyTerms;
  notes?: string;
}

export type ActivityCategory =
  | 'Sports & Athletics'
  | 'National Seminar'
  | 'International Symposium'
  | 'Technical Workshop'
  | 'Cultural Fest'
  | 'Community Outreach';

export type ActivityStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Postponed';

export interface CampusActivity {
  id: string;
  activityCode: string;
  title: string;
  category: ActivityCategory;
  organizingDepartment: string;
  facultyCoordinator: string;
  startDate: string;
  endDate: string;
  venue: string;
  participantCount: number;
  budgetAllocated: number;
  budgetUtilized: number;
  status: ActivityStatus;
  naacCriterionLink: number; // e.g. 5 for sports/cultural, 3 for seminar/symposium, 7 for outreach
  isoClauseLink: string; // e.g. '8.1', '8.5'
  keyOutcomes: string;
  certificatesIssued: number;
  externalGuests?: string[];
  reportSummary?: string;
}

export type TriggerMetricType = 
  | 'NAAC_SCORE_DROP' 
  | 'BUDGET_OVERRUN' 
  | 'AUDIT_NON_COMPLIANCE' 
  | 'FACULTY_WORKLOAD_EXCESS';

export type TriggerOperator = 'LESS_THAN' | 'GREATER_THAN';
export type TriggerSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface NotificationTriggerRule {
  id: string;
  name: string;
  metricType: TriggerMetricType;
  thresholdValue: number;
  operator: TriggerOperator;
  department: string;
  severity: TriggerSeverity;
  targetRoles: string[];
  enabled: boolean;
  createdBy: string;
  description?: string;
  lastEvaluated?: string;
  lastTriggered?: string;
}

export interface TriggerAlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  metricType: TriggerMetricType;
  department: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  severity: TriggerSeverity;
  message: string;
  triggeredAt: string;
  status: 'UNREAD' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledgedBy?: string;
  actionUrl?: string;
}

export type CalendarEventCategory = 
  | 'EXAM' 
  | 'AUDIT' 
  | 'SEMINAR_SYMPOSIUM' 
  | 'SPORTS_CULTURAL' 
  | 'SEMESTER_MILESTONE' 
  | 'HOLIDAY';

export type CalendarEventStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED';
export type CalendarSyncSource = 'EXAM_MODULE' | 'AAA_MODULE' | 'CAMPUS_ACTIVITY' | 'MANUAL';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  category: CalendarEventCategory;
  startDate: string;
  endDate?: string;
  department: string;
  venue?: string;
  targetAudience: string;
  status: CalendarEventStatus;
  syncSource: CalendarSyncSource;
  description?: string;
  responsibleLead?: string;
  naacCriterion?: number;
}

// ----------------------------------------------------
// Student, Fee Management & Results Models
// ----------------------------------------------------
export interface StudentRecord {
  id: string;
  enrollmentNo: string;
  rollNo: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  contactEmail: string;
  contactPhone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  facultyCluster: FacultyCluster;
  department: string;
  programName: string;
  currentYearOrSemester: string;
  admissionBatch: string; // e.g. "2023-2027"
  academicStatus: 'Active' | 'On Leave' | 'Detained' | 'Graduated';
  attendancePercentage: number;
  overallCGPA: number;
  categoryQuota: 'General' | 'OBC' | 'SC/ST' | 'EWS' | 'Management / Institutional';
  avatarUrl?: string;
  feeStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
}

export type FeeHeadType = 'Tuition' | 'Laboratory & Consumables' | 'Examination' | 'Hostel & Mess' | 'Library & Digital' | 'Sports & Campus' | 'Development Fund';

export interface FeeHeadItem {
  id: string;
  headName: FeeHeadType;
  amount: number; // in INR
}

export interface StudentFeeAccount {
  id: string;
  studentId: string;
  enrollmentNo: string;
  studentName: string;
  programName: string;
  academicYear: string; // e.g. "2025-2026"
  termLabel: string; // e.g. "Semester IV"
  feeHeads: FeeHeadItem[];
  totalAssessed: number;
  concessionOrScholarship: number;
  netPayable: number;
  amountPaid: number;
  outstandingBalance: number;
  dueDate: string;
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  applicableLateFeePerDay: number;
  calculatedLateFee: number;
  gracePeriodDays: number;
  lastPaymentDate?: string;
}

export type PaymentMethod = 'UPI' | 'Net Banking' | 'Credit/Debit Card' | 'Demand Draft / Cheque' | 'Cash / POS';

export interface FeeTransactionReceipt {
  id: string;
  receiptNumber: string; // e.g. "REC-2026-8942"
  feeAccountId: string;
  studentId: string;
  enrollmentNo: string;
  studentName: string;
  programName: string;
  termLabel: string;
  amountPaid: number;
  lateFeePaid: number;
  totalTransactionAmount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string; // e.g. UTR / Transaction ID
  paymentDate: string;
  receivedByStaff: string;
  remarks?: string;
  status: 'Successful' | 'Pending Clearance' | 'Reversed';
}

export interface SubjectMarksRecord {
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarks: number;
  maxInternal: number;
  externalMarks: number;
  maxExternal: number;
  totalMarks: number;
  maxTotal: number;
  gradePoint: number;
  letterGrade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F' | 'Ab';
  isBacklog: boolean;
}

export interface StudentSemesterResult {
  id: string;
  studentId: string;
  enrollmentNo: string;
  studentName: string;
  programName: string;
  termLabel: string;
  examSession: string; // e.g. "Winter 2025 Regular"
  evaluationDate: string;
  subjects: SubjectMarksRecord[];
  totalCreditsEarned: number;
  totalCreditsOffered: number;
  sgpa: number;
  cgpa: number;
  resultStatus: 'Passed' | 'Passed with Backlog' | 'Withheld' | 'Failed';
  publishedDate: string;
  controllerSignatory: string;
}


