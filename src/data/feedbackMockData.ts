import { StakeholderFeedbackEntry, RadarQualityDimension, StakeholderRole } from '../types';

export interface FeedbackDimensionDefinition {
  key: string;
  shortLabel: string;
  fullLabel: string;
  studentQuestion: string;
  facultyQuestion: string;
  isoClause: string;
  isoClauseTitle: string;
  naacCriterionId: number;
  naacCriterionTitle: string;
  benchmarkTarget: number; // Institutional benchmark (e.g. 85%)
  auditBaselineScore: number;
}

export const FEEDBACK_DIMENSIONS: FeedbackDimensionDefinition[] = [
  {
    key: 'curriculum_obe',
    shortLabel: 'Curriculum & OBE',
    fullLabel: 'Curriculum Design, CBCS & Outcome Attainment',
    studentQuestion: 'Relevance of syllabus, electives, clinical/industry internships, and clear learning outcomes (OBE)',
    facultyQuestion: 'Academic freedom in curriculum revision, alignment with industry/clinical standards, and pedagogical autonomy',
    isoClause: '8.2',
    isoClauseTitle: 'Clause 8.2: Requirements for Educational Products and Services',
    naacCriterionId: 1,
    naacCriterionTitle: 'Criterion 1: Curricular Aspects',
    benchmarkTarget: 85,
    auditBaselineScore: 88,
  },
  {
    key: 'teaching_pedagogy',
    shortLabel: 'Teaching & Mentorship',
    fullLabel: 'Teaching Quality, Lab Simulation & Faculty Mentorship',
    studentQuestion: 'Clarity of lectures, lab simulation hands-on experience, fairness of continuous assessments, and mentor accessibility',
    facultyQuestion: 'Availability of modern teaching aids, OSCE/OSPE simulation support, and student academic readiness',
    isoClause: '8.3',
    isoClauseTitle: 'Clause 8.3: Design & Delivery of Educational Services',
    naacCriterionId: 2,
    naacCriterionTitle: 'Criterion 2: Teaching-Learning & Evaluation',
    benchmarkTarget: 85,
    auditBaselineScore: 91,
  },
  {
    key: 'research_ecosystem',
    shortLabel: 'Research & Innovation',
    fullLabel: 'Research Facilities, Seed Grants & Innovation Support',
    studentQuestion: 'Opportunities for undergraduate/postgraduate research, hackathons, conference travel grants, and patent filing support',
    facultyQuestion: 'Institutional seed grant accessibility, central instrumentation facility uptime, workload balance for research, and ethics clearance speed',
    isoClause: '7.1.3',
    isoClauseTitle: 'Clause 7.1.3: Infrastructure & Resource Adequacy',
    naacCriterionId: 3,
    naacCriterionTitle: 'Criterion 3: Research, Innovations & Extension',
    benchmarkTarget: 80,
    auditBaselineScore: 82,
  },
  {
    key: 'infrastructure_digital',
    shortLabel: 'Campus & Digital Infra',
    fullLabel: 'Smart Classrooms, Lab Equipment, WiFi & Cleanrooms',
    studentQuestion: 'Condition of specialized laboratories, campus high-speed WiFi, digital library e-resources, and study spaces',
    facultyQuestion: 'Specialized lab instrument maintenance, software licensing (SPSS, CAD, ChemDraw), and digital classroom AV readiness',
    isoClause: '7.1.4',
    isoClauseTitle: 'Clause 7.1.4: Environment for Educational Operation',
    naacCriterionId: 4,
    naacCriterionTitle: 'Criterion 4: Infrastructure & Learning Resources',
    benchmarkTarget: 85,
    auditBaselineScore: 86,
  },
  {
    key: 'student_progression',
    shortLabel: 'Progression & Wellbeing',
    fullLabel: 'Career Guidance, Mental Wellbeing, Placement & Grievance',
    studentQuestion: 'Effectiveness of training and placement cell, campus mental health counseling, anti-ragging safeguards, and grievance redressal',
    facultyQuestion: 'Institutional student counseling networks, financial aid/scholarship disbursement speed, and extracurricular balance',
    isoClause: '8.1',
    isoClauseTitle: 'Clause 8.1: Operational Planning & Student Services',
    naacCriterionId: 5,
    naacCriterionTitle: 'Criterion 5: Student Support & Progression',
    benchmarkTarget: 85,
    auditBaselineScore: 89,
  },
  {
    key: 'governance_leadership',
    shortLabel: 'Governance & Culture',
    fullLabel: 'Institutional Leadership, Transparency & Work Culture',
    studentQuestion: 'Responsiveness of academic administration, transparent fee structure, and proactive student council involvement',
    facultyQuestion: 'Transparent promotion policies, participatory IQAC governance, timely research incentive release, and leadership support',
    isoClause: '5.1',
    isoClauseTitle: 'Clause 5.1: Leadership & Commitment to Quality',
    naacCriterionId: 6,
    naacCriterionTitle: 'Criterion 6: Governance, Leadership & Management',
    benchmarkTarget: 80,
    auditBaselineScore: 84,
  },
  {
    key: 'ethics_sustainability',
    shortLabel: 'Ethics & Inclusivity',
    fullLabel: 'Campus Green Audits, Diversity, Inclusivity & Gender Safety',
    studentQuestion: 'Universal barrier-free campus access, green campus initiatives, safety and gender-neutral equity, and community outreach',
    facultyQuestion: 'Adherence to institutional code of conduct, energy conservation enforcement, and inclusive institutional policies',
    isoClause: '4.2',
    isoClauseTitle: 'Clause 4.2: Understanding Stakeholder Needs & Inclusivity',
    naacCriterionId: 7,
    naacCriterionTitle: 'Criterion 7: Institutional Values & Best Practices',
    benchmarkTarget: 80,
    auditBaselineScore: 87,
  },
  {
    key: 'clinical_internship',
    shortLabel: 'Internship & Clinicals',
    fullLabel: 'Hospital Rotations, Industrial Exposure & Skill Labs',
    studentQuestion: 'Quality of hospital clinical rotations, pharma manufacturing plant visits, patient interaction exposure, and preceptor supervision',
    facultyQuestion: 'Clinical preceptor coordination, hospital administration alignment, and student safety during rotations',
    isoClause: '8.5',
    isoClauseTitle: 'Clause 8.5: Educational Service Delivery & Practical Training',
    naacCriterionId: 8,
    naacCriterionTitle: 'Criterion 8: Medical/Health Clinical Competency',
    benchmarkTarget: 85,
    auditBaselineScore: 88,
  }
];

export const INITIAL_FEEDBACK_ENTRIES: StakeholderFeedbackEntry[] = [
  {
    id: 'fdb-101',
    role: 'student',
    department: 'Pharmacy',
    academicYear: '2025-2026',
    semesterCohort: 'Pharm.D Year 4',
    respondentIdentifier: 'Student-PH-842',
    submittedAt: '2026-09-24T14:30:00Z',
    ratings: {
      curriculum_obe: 5,
      teaching_pedagogy: 5,
      research_ecosystem: 4,
      infrastructure_digital: 4,
      student_progression: 5,
      governance_leadership: 4,
      ethics_sustainability: 5,
      clinical_internship: 5,
    },
    qualitativeComments: 'Clinical postings at the University Hospital have been transformative. The OSCE evaluation rubrics provide immediate constructive feedback on clinical case presentations.',
    sentiment: 'positive',
    isoClauseTags: ['8.2', '8.5', '9.1.2'],
    naacCriterionTags: [1, 2, 8],
    status: 'Reviewed',
  },
  {
    id: 'fdb-102',
    role: 'student',
    department: 'Biomedical Engineering',
    academicYear: '2025-2026',
    semesterCohort: 'B.Tech Semester 7',
    respondentIdentifier: 'Student-BME-119',
    submittedAt: '2026-09-23T11:15:00Z',
    ratings: {
      curriculum_obe: 4,
      teaching_pedagogy: 4,
      research_ecosystem: 2,
      infrastructure_digital: 3,
      student_progression: 4,
      governance_leadership: 3,
      ethics_sustainability: 4,
      clinical_internship: 3,
    },
    qualitativeComments: 'The central microscopy and biocompatibility testing lab needs calibrated high-speed sensors. Wait times for test runs on the spectrophotometer exceed 3 weeks.',
    sentiment: 'critical',
    isoClauseTags: ['7.1.3', '10.2'],
    naacCriterionTags: [3, 4],
    status: 'Action Triggered',
  },
  {
    id: 'fdb-103',
    role: 'faculty',
    department: 'Pharmaceutics & Institutional IQAC',
    academicYear: '2025-2026',
    semesterCohort: 'Associate Professor Cadre',
    respondentIdentifier: 'Faculty-PH-09',
    submittedAt: '2026-09-22T09:45:00Z',
    ratings: {
      curriculum_obe: 5,
      teaching_pedagogy: 5,
      research_ecosystem: 4,
      infrastructure_digital: 5,
      student_progression: 4,
      governance_leadership: 4,
      ethics_sustainability: 5,
      clinical_internship: 4,
    },
    qualitativeComments: 'Digital LMS adoption for continuous assessment has streamlined rubric-based OBE calculations. Faculty development programs on AI in formulation design were very well organized.',
    sentiment: 'positive',
    isoClauseTags: ['8.3', '7.2', '9.1.2'],
    naacCriterionTags: [2, 6],
    status: 'Reviewed',
  },
  {
    id: 'fdb-104',
    role: 'faculty',
    department: 'Computer Science & Health Informatics',
    academicYear: '2025-2026',
    semesterCohort: 'Professor Cadre',
    respondentIdentifier: 'Faculty-CS-03',
    submittedAt: '2026-09-21T16:20:00Z',
    ratings: {
      curriculum_obe: 4,
      teaching_pedagogy: 4,
      research_ecosystem: 3,
      infrastructure_digital: 4,
      student_progression: 4,
      governance_leadership: 3,
      ethics_sustainability: 5,
      clinical_internship: 4,
    },
    qualitativeComments: 'High-performance GPU cluster queue requires expansion for deep learning clinical NLP models. Timely seed grant disbursement enabled 2 new Scopus indexed papers this term.',
    sentiment: 'neutral',
    isoClauseTags: ['7.1.3', '8.2'],
    naacCriterionTags: [3, 4],
    status: 'Reviewed',
  },
  {
    id: 'fdb-105',
    role: 'student',
    department: 'Allied Health Sciences & Nursing',
    academicYear: '2025-2026',
    semesterCohort: 'B.Sc Nursing Semester 5',
    respondentIdentifier: 'Student-NU-304',
    submittedAt: '2026-09-20T10:05:00Z',
    ratings: {
      curriculum_obe: 5,
      teaching_pedagogy: 4,
      research_ecosystem: 3,
      infrastructure_digital: 5,
      student_progression: 5,
      governance_leadership: 5,
      ethics_sustainability: 5,
      clinical_internship: 5,
    },
    qualitativeComments: 'Emergency room and pediatric ICU clinical rotation mentors are extremely supportive. Simulation manikins in the high-fidelity lab allowed practice before live patient interventions.',
    sentiment: 'positive',
    isoClauseTags: ['8.5', '7.1.4', '9.1.2'],
    naacCriterionTags: [2, 8],
    status: 'Reviewed',
  },
  {
    id: 'fdb-106',
    role: 'student',
    department: 'Management & Business Studies',
    academicYear: '2025-2026',
    semesterCohort: 'MBA Healthcare Sem 3',
    respondentIdentifier: 'Student-MB-55',
    submittedAt: '2026-09-19T13:40:00Z',
    ratings: {
      curriculum_obe: 4,
      teaching_pedagogy: 4,
      research_ecosystem: 3,
      infrastructure_digital: 4,
      student_progression: 4,
      governance_leadership: 4,
      ethics_sustainability: 4,
      clinical_internship: 4,
    },
    qualitativeComments: 'Hospital administration case study workshops with senior health directors provided valuable practical insight into NABH accreditation processes.',
    sentiment: 'positive',
    isoClauseTags: ['8.2', '9.1.2'],
    naacCriterionTags: [1, 5],
    status: 'Reviewed',
  },
  {
    id: 'fdb-107',
    role: 'faculty',
    department: 'Biomedical Engineering',
    academicYear: '2025-2026',
    semesterCohort: 'Assistant Professor Cadre',
    respondentIdentifier: 'Faculty-BME-12',
    submittedAt: '2026-09-18T15:10:00Z',
    ratings: {
      curriculum_obe: 4,
      teaching_pedagogy: 3,
      research_ecosystem: 2,
      infrastructure_digital: 3,
      student_progression: 4,
      governance_leadership: 3,
      ethics_sustainability: 4,
      clinical_internship: 3,
    },
    qualitativeComments: 'Laboratory consumable budget for sensor fabrication was exhausted mid-semester. Requesting ISO 21001 Clause 7.1.3 review to safeguard teaching and lab project continuum.',
    sentiment: 'critical',
    isoClauseTags: ['7.1.3', '10.2'],
    naacCriterionTags: [3, 4],
    status: 'Action Triggered',
  },
  {
    id: 'fdb-108',
    role: 'student',
    department: 'Pharmaceutics & Institutional IQAC',
    academicYear: '2025-2026',
    semesterCohort: 'M.Pharm Semester 2',
    respondentIdentifier: 'Student-PH-912',
    submittedAt: '2026-09-17T12:00:00Z',
    ratings: {
      curriculum_obe: 5,
      teaching_pedagogy: 5,
      research_ecosystem: 5,
      infrastructure_digital: 5,
      student_progression: 5,
      governance_leadership: 5,
      ethics_sustainability: 5,
      clinical_internship: 4,
    },
    qualitativeComments: 'Cleanroom access and continuous HPLC calibration logs meet high GMP standards. Very satisfied with the industry formulation mentorship program.',
    sentiment: 'positive',
    isoClauseTags: ['7.1.3', '8.5', '9.1.2'],
    naacCriterionTags: [1, 3, 4],
    status: 'Reviewed',
  }
];

export const DEPARTMENTS_LIST = [
  'All Departments',
  'Pharmacy',
  'Pharmaceutics & Institutional IQAC',
  'Biomedical Engineering',
  'Computer Science & Health Informatics',
  'Allied Health Sciences & Nursing',
  'Management & Business Studies',
];

/**
 * Computes Radar Quality Dimensions from an array of feedback entries
 */
export function calculateRadarDimensions(
  feedbackEntries: StakeholderFeedbackEntry[],
  selectedDepartment: string = 'All Departments'
): RadarQualityDimension[] {
  const filteredEntries = selectedDepartment === 'All Departments'
    ? feedbackEntries
    : feedbackEntries.filter(e => e.department === selectedDepartment);

  return FEEDBACK_DIMENSIONS.map(dim => {
    const studentEntries = filteredEntries.filter(e => e.role === 'student' && e.ratings[dim.key] !== undefined);
    const facultyEntries = filteredEntries.filter(e => e.role === 'faculty' && e.ratings[dim.key] !== undefined);

    const calcAveragePercentage = (entries: StakeholderFeedbackEntry[]): number => {
      if (entries.length === 0) return dim.auditBaselineScore; // Fallback to baseline if no entries
      const sum = entries.reduce((acc, curr) => acc + (curr.ratings[dim.key] || 0), 0);
      const avgRating = sum / entries.length; // 1 to 5
      return Math.round((avgRating / 5) * 100 * 10) / 10;
    };

    const studentAttainment = calcAveragePercentage(studentEntries);
    const facultyAttainment = calcAveragePercentage(facultyEntries);

    // Weighted composite attainment (50% student, 50% faculty if both exist, else the active one)
    let compositeAttainment: number;
    if (studentEntries.length > 0 && facultyEntries.length > 0) {
      compositeAttainment = Math.round(((studentAttainment * 0.55) + (facultyAttainment * 0.45)) * 10) / 10;
    } else if (studentEntries.length > 0) {
      compositeAttainment = studentAttainment;
    } else if (facultyEntries.length > 0) {
      compositeAttainment = facultyAttainment;
    } else {
      compositeAttainment = dim.auditBaselineScore;
    }

    let gapStatus: RadarQualityDimension['gapStatus'];
    if (compositeAttainment >= dim.benchmarkTarget + 3) {
      gapStatus = 'Exceeds Benchmark';
    } else if (compositeAttainment >= dim.benchmarkTarget - 5) {
      gapStatus = 'On Track';
    } else if (compositeAttainment >= 60) {
      gapStatus = 'Under Surveillance';
    } else {
      gapStatus = 'Critical Non-Conformance';
    }

    return {
      dimensionKey: dim.key,
      shortLabel: dim.shortLabel,
      fullLabel: dim.fullLabel,
      isoClause: dim.isoClause,
      isoClauseTitle: dim.isoClauseTitle,
      naacCriterionId: dim.naacCriterionId,
      naacCriterionTitle: dim.naacCriterionTitle,
      studentAttainment,
      facultyAttainment,
      compositeAttainment,
      benchmarkTarget: dim.benchmarkTarget,
      auditScore: dim.auditBaselineScore,
      responseCount: studentEntries.length + facultyEntries.length,
      gapStatus,
    };
  });
}
