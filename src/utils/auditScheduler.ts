import { AAAAuditRecord, NaacMetric, FacultyCluster } from '../types';
import { RECHARTS_HISTORICAL_CYCLES } from '../components/NaacTrendChart';

export interface AuditScheduleRule {
  id: string;
  name: string;
  description: string;
  type: 'Maturity Score Drop' | 'ISO 21001 Timeline' | 'High-Risk Lab Check';
  thresholdPercentage?: number; // Score drop threshold (e.g. 5%)
  frequencyMonths?: number;     // e.g. 3 months, 6 months
  isoClause: string;
  priority: 'High' | 'Medium' | 'Critical';
  enabled: boolean;
}

export const DEFAULT_AUDIT_RULES: AuditScheduleRule[] = [
  {
    id: 'rule-drop-5',
    name: 'NAAC Maturity Score Drop Alert (>= 5% Drop)',
    description: 'Auto-triggers an immediate Internal Audit & CAPA review when any NAAC Criterion maturity drops by 5% or more compared to previous cycle/benchmark.',
    type: 'Maturity Score Drop',
    thresholdPercentage: 5,
    isoClause: 'ISO 21001:2025 Clause 9.2 (Internal Audit) & Clause 10.2 (Nonconformity and Corrective Action)',
    priority: 'Critical',
    enabled: true,
  },
  {
    id: 'rule-iso-semi-annual',
    name: 'ISO 21001:2025 Bi-Annual Quality Management Surveillance',
    description: 'Mandatory scheduled internal audit cycle conducted every 6 months across academic and administrative departments.',
    type: 'ISO 21001 Timeline',
    frequencyMonths: 6,
    isoClause: 'ISO 21001:2025 Clause 9.2.2 (Internal Audit Programme)',
    priority: 'High',
    enabled: true,
  },
  {
    id: 'rule-iso-annual-curriculum',
    name: 'ISO 21001:2025 Curricular & OBE Annual Review Cycle',
    description: 'Evaluates curriculum delivery, clinical postings, and CO-PO attainment before academic year semester transition.',
    type: 'ISO 21001 Timeline',
    frequencyMonths: 12,
    isoClause: 'ISO 21001:2025 Clause 8.2 (Requirements for Educational Products and Services)',
    priority: 'Medium',
    enabled: true,
  },
  {
    id: 'rule-high-risk-lab',
    name: 'Hazardous Chemical & Sterile Cleanroom Safety Check',
    description: 'Quarterly compliance check for pharmaceutical labs, cadaveric dissection suites, and radioactive/chemical stores.',
    type: 'High-Risk Lab Check',
    frequencyMonths: 3,
    isoClause: 'ISO 21001:2025 Clause 7.1.3 (Infrastructure & Safe Learning Environments)',
    priority: 'High',
    enabled: true,
  },
];

// Department and faculty mapping for NAAC criteria
export const CRITERION_DEPARTMENT_MAP: Record<number, { department: string; faculty: FacultyCluster; auditor: string }> = {
  1: { department: 'Curricular Planning & OBE Academic Council', faculty: 'Pharmacy', auditor: 'Prof. Ananya Roy (Lead OBE Auditor)' },
  2: { department: 'OSCE/OSPE & Teaching-Learning Center', faculty: 'Medical', auditor: 'Dr. Rajesh Rao (Clinical Audit Lead)' },
  3: { department: 'Research, Patents & Institutional Ethics Committee', faculty: 'Pharmacy', auditor: 'Dr. S. K. Mehta (Dean R&D)' },
  4: { department: 'Central Instrumentation & Cleanrooms (HPLC/FTIR)', faculty: 'Pharmacy', auditor: 'Er. Vivek Verma (Lead Technical Auditor)' },
  5: { department: 'Student Mentorship & Career Placement Cell', faculty: 'Sciences', auditor: 'Dr. Farida Khan (Student Welfare Dean)' },
  6: { department: 'Institutional IQAC Secretariat & EOMS Governance', faculty: 'Commerce', auditor: 'Dr. Sharim Siddiqui (Lead EOMS Auditor)' },
  7: { department: 'Institutional Best Practices & Community Health', faculty: 'Medical', auditor: 'Dr. Neelam Verma (Community Outreach Lead)' },
  8: { department: 'Super-Specialty Hospital & Inpatient Pharmacy', faculty: 'Medical', auditor: 'Dr. Farida Khan (Medical Superintendent)' },
  9: { department: 'Advanced Skill Simulation & Virtual EHR Lab', faculty: 'Engineering', auditor: 'Er. S. Sengupta (TUV Lead Auditor)' },
  10: { department: 'Alumni Engagement, Employer & Stakeholder Relations', faculty: 'Commerce', auditor: 'Shri A. K. Gupta (Comptroller)' },
};

/**
 * Evaluates current NAAC metrics against previous assessment cycles and rules,
 * identifying drop triggers and statutory timeline needs.
 */
export function evaluateAutoAuditTriggers(
  metrics: NaacMetric[],
  existingAudits: AAAAuditRecord[],
  rules: AuditScheduleRule[] = DEFAULT_AUDIT_RULES
): {
  proposedAudits: AAAAuditRecord[];
  triggeredCount: number;
  scoreDropAlerts: { criterionId: number; title: string; currentScore: number; previousScore: number; drop: number }[];
} {
  const previousCycle = RECHARTS_HISTORICAL_CYCLES[2]; // Cycle 3 (2023-24)
  const proposedAudits: AAAAuditRecord[] = [];
  const scoreDropAlerts: { criterionId: number; title: string; currentScore: number; previousScore: number; drop: number }[] = [];

  const dropRule = rules.find((r) => r.id === 'rule-drop-5' && r.enabled);
  const threshold = dropRule?.thresholdPercentage ?? 5;

  // 1. Analyze Criterion Score Drops against previous cycle or benchmark
  metrics.forEach((metric) => {
    const curScore = (metric.currentScore / metric.maxScore) * 100;
    // Map criterionId to property (c1, c2, ..., c10)
    const key = `c${metric.criterionId}` as keyof typeof previousCycle;
    const prevScore = typeof previousCycle[key] === 'number' ? (previousCycle[key] as number) : 85;
    const drop = prevScore - curScore;

    // Check if score dropped by threshold or if current attainment is critical (< 75%)
    if (drop >= threshold || curScore < 75) {
      scoreDropAlerts.push({
        criterionId: metric.criterionId,
        title: metric.criterionTitle,
        currentScore: curScore,
        previousScore: prevScore,
        drop: Math.max(0, drop),
      });

      // Check if audit already exists for this trigger in the last 6 months
      const existingAudit = existingAudits.find(
        (a) => a.targetCriterionId === metric.criterionId && a.status !== 'Closed'
      );

      if (!existingAudit && dropRule) {
        const deptInfo = CRITERION_DEPARTMENT_MAP[metric.criterionId] || {
          department: 'Academic & Administrative Quality Cell',
          faculty: 'Pharmacy',
          auditor: 'Dr. Sharim Siddiqui (Dean & IQAC Lead)',
        };

        const auditId = `aaa-auto-drop-c${metric.criterionId}-${Date.now().toString().slice(-4)}`;
        proposedAudits.push({
          id: auditId,
          auditCycle: `Emergency Performance Audit: Criterion ${metric.criterionId} Maturity Deficit`,
          type: 'Internal',
          department: deptInfo.department,
          faculty: deptInfo.faculty,
          leadAuditor: deptInfo.auditor,
          auditDate: '2026-10-05',
          status: 'Scheduled',
          isAutoScheduled: true,
          triggerType: 'Maturity Score Drop',
          triggerReason: `Maturity score dropped by ${drop.toFixed(1)}% (from ${prevScore}% in Cycle 3 to ${curScore.toFixed(1)}%). Requires root-cause review under ISO 21001 Clause 10.2.`,
          isoClause: 'ISO 21001:2025 Clause 9.2 (Internal Audit) & Clause 10.2 (CAPA)',
          targetCriterionId: metric.criterionId,
          scoreDropPercentage: drop,
          complianceDeadline: '2026-10-20',
          nonConformances: [
            {
              id: `nc-auto-c${metric.criterionId}-01`,
              type: 'Major NC',
              description: `Attainment score for ${metric.metricCode} (${metric.metricDescription}) dipped below institution quality threshold.`,
              rootCause: 'Underlying documentary evidence gap or delayed inter-departmental data submission.',
              capaPlan: 'Conduct department-wide CAPA session, update audit proofs, and submit revised data dossier.',
              assignee: deptInfo.auditor.split(' ')[0] + ' Team',
              dueDate: '2026-10-25',
              status: 'Open',
            },
          ],
        });
      }
    }
  });

  // 2. Predefined Timeline Triggers: ISO 21001:2025 Bi-Annual & Surveillance
  const biAnnualRule = rules.find((r) => r.id === 'rule-iso-semi-annual' && r.enabled);
  if (biAnnualRule) {
    const biAnnualExists = existingAudits.some(
      (a) => a.triggerType === 'ISO 21001 Timeline' && a.auditDate.startsWith('2026-11')
    );

    if (!biAnnualExists) {
      proposedAudits.push({
        id: `aaa-auto-iso21001-2026-h2`,
        auditCycle: 'ISO 21001:2025 EOMS Mandatory Bi-Annual Internal Audit (H2-2026)',
        type: 'Internal',
        department: 'Institutional Academic & Clinical Departments',
        faculty: 'Pharmacy',
        leadAuditor: 'Er. S. Sengupta (Lead Auditor, TUV ISO 21001)',
        auditDate: '2026-11-14',
        status: 'Scheduled',
        isAutoScheduled: true,
        triggerType: 'ISO 21001 Timeline',
        triggerReason: 'Automated 6-month statutory surveillance interval mandated by ISO 21001:2025 clause 9.2.2.',
        isoClause: 'ISO 21001:2025 Clause 9.2.2 (Internal Audit Programme)',
        complianceDeadline: '2026-11-30',
        nonConformances: [
          {
            id: 'nc-iso-surv-01',
            type: 'OFI',
            description: 'Verification of educational service delivery consistency across semester shifts.',
            rootCause: 'Periodic surveillance assessment.',
            capaPlan: 'Verify curriculum plans, LMS attendance, and lab calibration logs.',
            assignee: 'Head of Quality Assurance',
            dueDate: '2026-11-28',
            status: 'Open',
          },
        ],
      });
    }
  }

  // 3. High Risk Laboratory and Chemical Stores Check
  const labRule = rules.find((r) => r.id === 'rule-high-risk-lab' && r.enabled);
  if (labRule) {
    const labAuditExists = existingAudits.some(
      (a) => a.triggerType === 'High-Risk Lab Check' && a.status !== 'Closed'
    );

    if (!labAuditExists) {
      proposedAudits.push({
        id: `aaa-auto-labcheck-q4`,
        auditCycle: 'Hazardous Chemicals, Cleanrooms & Biohazard Safety Surveillance',
        type: 'Surprise Quality Check',
        department: 'Central Chemical Stores & Cleanroom Facilities',
        faculty: 'Pharmacy',
        leadAuditor: 'Dr. S. K. Mehta (Chemical Safety Officer)',
        auditDate: '2026-10-18',
        status: 'Scheduled',
        isAutoScheduled: true,
        triggerType: 'High-Risk Lab Check',
        triggerReason: 'Quarterly compliance check for schedule toxicity, fume hoods, and biological waste tracking.',
        isoClause: 'ISO 21001:2025 Clause 7.1.3 (Infrastructure & Safety)',
        complianceDeadline: '2026-10-25',
        nonConformances: [
          {
            id: 'nc-lab-safety-01',
            type: 'Minor NC',
            description: 'Eye wash stations and neutralization spill kit consumables require expiration tag updates.',
            rootCause: 'Consumables inventory audit due.',
            capaPlan: 'Replace expired spill kits and perform differential pressure sensor calibration test.',
            assignee: 'Lab Safety Incharge',
            dueDate: '2026-10-24',
            status: 'Open',
          },
        ],
      });
    }
  }

  return {
    proposedAudits,
    triggeredCount: proposedAudits.length,
    scoreDropAlerts,
  };
}
