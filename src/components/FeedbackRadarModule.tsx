import React, { useState, useMemo } from 'react';
import {
  StakeholderFeedbackEntry,
  RadarQualityDimension,
  AAAAuditRecord,
  UserProfile,
  FacultyCluster,
} from '../types';
import {
  calculateRadarDimensions,
  INITIAL_FEEDBACK_ENTRIES,
  DEPARTMENTS_LIST,
} from '../data/feedbackMockData';
import { InstitutionalQualityRadar } from './InstitutionalQualityRadar';
import { StudentFacultyFeedbackLoop } from './StudentFacultyFeedbackLoop';
import {
  Radar,
  MessageSquarePlus,
  Compass,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

interface Props {
  audits: AAAAuditRecord[];
  onAddAudit: (audit: AAAAuditRecord) => void;
  onNavigateToAAAManager: () => void;
  feedbackList?: StakeholderFeedbackEntry[];
  onSaveFeedbackList?: (entries: StakeholderFeedbackEntry[]) => void;
  currentUser: UserProfile;
}

export const FeedbackRadarModule: React.FC<Props> = ({
  audits,
  onAddAudit,
  onNavigateToAAAManager,
  feedbackList,
  onSaveFeedbackList,
  currentUser,
}) => {
  // Local state for feedback entries if not externally passed or initialized
  const [internalFeedbackEntries, setInternalFeedbackEntries] = useState<StakeholderFeedbackEntry[]>(
    feedbackList && feedbackList.length > 0 ? feedbackList : INITIAL_FEEDBACK_ENTRIES
  );

  const activeEntries = feedbackList && feedbackList.length > 0 ? feedbackList : internalFeedbackEntries;

  const [activeTab, setActiveTab] = useState<'radar' | 'form' | 'insights'>('radar');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [scheduledAuditNotice, setScheduledAuditNotice] = useState<string | null>(null);

  // Recompute radar dimensions dynamically based on active feedback entries and department selection
  const calculatedDimensions = useMemo(() => {
    return calculateRadarDimensions(activeEntries, selectedDepartment);
  }, [activeEntries, selectedDepartment]);

  // Handle new feedback submission
  const handleSubmitFeedback = (newEntry: StakeholderFeedbackEntry) => {
    const updated = [newEntry, ...activeEntries];
    setInternalFeedbackEntries(updated);
    if (onSaveFeedbackList) {
      onSaveFeedbackList(updated);
    }
  };

  // Helper to map department to FacultyCluster
  const mapDeptToFaculty = (dept: string): FacultyCluster => {
    if (dept.includes('Pharm')) return 'Pharmacy';
    if (dept.includes('Biomedical') || dept.includes('Computer')) return 'Engineering';
    if (dept.includes('Nursing') || dept.includes('Health')) return 'Medical';
    if (dept.includes('Management') || dept.includes('Business')) return 'Commerce';
    return 'Pharmacy';
  };

  // Trigger internal audit from low dimension
  const handleTriggerAuditFromDimension = (dim: RadarQualityDimension) => {
    const auditId = `aud-fdb-${Date.now().toString(36)}`;
    const newAudit: AAAAuditRecord = {
      id: auditId,
      auditCycle: `Feedback Surveillance - ${dim.shortLabel}`,
      type: 'Internal',
      faculty: mapDeptToFaculty(selectedDepartment),
      department: selectedDepartment === 'All Departments' ? 'Institutional IQAC' : selectedDepartment,
      auditDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      leadAuditor: `${currentUser.name} (Lead IQAC / EOMS Auditor)`,
      status: 'Scheduled',
      isAutoScheduled: true,
      triggerType: 'ISO 21001 Timeline',
      triggerReason: `Stakeholder Satisfaction Deficit: ${dim.shortLabel} attained ${dim.compositeAttainment}% against institutional benchmark of ${dim.benchmarkTarget}%.`,
      isoClause: `Clause ${dim.isoClause}: ${dim.isoClauseTitle}`,
      targetCriterionId: dim.naacCriterionId,
      scoreDropPercentage: Math.max(0, Math.round((dim.benchmarkTarget - dim.compositeAttainment) * 10) / 10),
      complianceDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nonConformances: [
        {
          id: `nc-${Date.now().toString(36)}-1`,
          type: 'Minor NC',
          description: `Attainment in '${dim.fullLabel}' is ${dim.compositeAttainment}% (Benchmark: ${dim.benchmarkTarget}%). ISO 21001 Clause ${dim.isoClause} compliance review required.`,
          rootCause: `Perception sensing identified gaps between curricular/infrastructure delivery and stakeholder expectations.`,
          capaPlan: `Convene Departmental Academic Committee to analyze student and faculty remarks regarding ${dim.shortLabel}; submit root cause analysis and corrective action within 14 calendar days.`,
          assignee: `${currentUser.name}`,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Open',
        },
      ],
    };

    onAddAudit(newAudit);
    setScheduledAuditNotice(`Audit scheduled in AAA Manager for "${dim.shortLabel}" (ISO Clause ${dim.isoClause}).`);
    setTimeout(() => setScheduledAuditNotice(null), 6000);
  };

  // Trigger internal audit from single critical feedback entry
  const handleTriggerAuditFromFeedback = (entry: StakeholderFeedbackEntry) => {
    const auditId = `aud-fdb-${Date.now().toString(36)}`;
    const newAudit: AAAAuditRecord = {
      id: auditId,
      auditCycle: `Grievance Review - ${entry.department}`,
      type: 'Internal',
      faculty: mapDeptToFaculty(entry.department),
      department: entry.department,
      auditDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      leadAuditor: `${currentUser.name} (Lead IQAC Auditor)`,
      status: 'Scheduled',
      isAutoScheduled: true,
      triggerType: 'Maturity Score Drop',
      triggerReason: `Direct stakeholder evaluation trigger (${entry.role.toUpperCase()} in ${entry.department})`,
      isoClause: `ISO 21001 Clause ${entry.isoClauseTags[0] || '10.2'}`,
      targetCriterionId: entry.naacCriterionTags[0] || 1,
      complianceDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nonConformances: [
        {
          id: `nc-${Date.now().toString(36)}-2`,
          type: 'Major NC',
          description: `Stakeholder grievance/feedback from ${entry.role} (${entry.respondentIdentifier}): "${entry.qualitativeComments}"`,
          rootCause: `Operational delivery breakdown identified via real-time feedback loop.`,
          capaPlan: `Conduct on-site inspection for ${entry.department} facilities and curriculum delivery; verify compliance against ISO 21001 Clauses ${entry.isoClauseTags.join(', ')}.`,
          assignee: `${currentUser.name}`,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Open',
        },
      ],
    };

    onAddAudit(newAudit);
    setScheduledAuditNotice(`Internal audit initiated for ${entry.department} based on stakeholder report ${entry.respondentIdentifier}.`);
    setTimeout(() => setScheduledAuditNotice(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Continuous Improvement Ecosystem
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">ISO 21001:2025 &amp; NAAC Binary Alignment</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Student Feedback Loop &amp; Institutional Quality Radar
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Real-time multi-stakeholder satisfaction telemetry mapped directly to Educational Organization Management System (EOMS) requirements. Tracks voice-of-learner, closes CAPA loops, and triggers targeted internal audits.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Quality Radar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            Submit Feedback
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'insights'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            ISO 10.2 CAPA Link
          </button>
        </div>
      </div>

      {/* Audit Notification Toast */}
      {scheduledAuditNotice && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-medium">{scheduledAuditNotice}</span>
          </div>
          <button
            type="button"
            onClick={onNavigateToAAAManager}
            className="px-2.5 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1 shrink-0 ml-4"
          >
            View in AAA Manager <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'radar' && (
        <InstitutionalQualityRadar
          dimensions={calculatedDimensions}
          feedbackEntries={activeEntries}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          onTriggerAudit={handleTriggerAuditFromDimension}
          onSwitchToFeedbackForm={() => setActiveTab('form')}
        />
      )}

      {activeTab === 'form' && (
        <StudentFacultyFeedbackLoop
          feedbackEntries={activeEntries}
          onSubmitFeedback={handleSubmitFeedback}
          onTriggerAuditFromFeedback={handleTriggerAuditFromFeedback}
          onViewRadar={() => setActiveTab('radar')}
        />
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Continuous Improvement Architecture Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-white">
                  ISO 21001:2025 Continuous Improvement Integration (Clause 10.2)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How real-time stakeholder perceptions translate into formal corrective and preventive actions.
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToAAAManager}
                className="px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-colors flex items-center gap-1.5"
              >
                Go to AAA Manager <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Improvement Architecture Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-xs font-semibold text-white mb-1">
                  1. Perception Sensing (Clause 9.1.2)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time Likert and qualitative inputs are scored across 8 educational axes. Submissions calculate weighted student and faculty attainment indexes.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-xs font-semibold text-white mb-1">
                  2. Deficit Detection &amp; Trigger
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Attainment rates falling below the institutional target (80–85%) or experiencing negative stakeholder sentiment trigger internal audit notifications.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-xs font-semibold text-white mb-1">
                  3. CAPA Escalation (Clause 10.2)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct escalation into the AAA Manager assigns a Lead Auditor, establishes on-site inspection schedules, and tracks institutional non-conformance closure.
                </p>
              </div>
            </div>

            {/* Currently Flagged Dimensions for Action */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Active Improvement Triggers from Stakeholder Data
              </h4>

              <div className="space-y-3">
                {calculatedDimensions
                  .filter(d => d.compositeAttainment < d.benchmarkTarget)
                  .map(dim => (
                    <div
                      key={dim.dimensionKey}
                      className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{dim.fullLabel}</span>
                          <span className="text-amber-400 font-mono text-[11px]">ISO {dim.isoClause}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 font-mono">NAAC C{dim.naacCriterionId}</span>
                        </div>
                        <p className="text-slate-400 mt-1">
                          Current stakeholder attainment is <span className="font-mono font-bold text-amber-400">{dim.compositeAttainment}%</span>, below the benchmark target of <span className="font-mono font-bold text-slate-200">{dim.benchmarkTarget}%</span>.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerAuditFromDimension(dim)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors whitespace-nowrap shadow-md self-start sm:self-center"
                      >
                        Create CAPA Audit
                      </button>
                    </div>
                  ))}

                {calculatedDimensions.filter(d => d.compositeAttainment < d.benchmarkTarget).length === 0 && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All evaluated dimensions currently meet or exceed their target institutional benchmarks.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
