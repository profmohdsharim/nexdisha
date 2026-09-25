import React, { useState } from 'react';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  Filter,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Zap,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Settings2,
  Play,
  Check,
  Info,
} from 'lucide-react';
import { AAAAuditRecord, FacultyCluster, NaacMetric } from '../types';
import { DataActionsBar } from './DataActionsBar';
import {
  AuditScheduleRule,
  DEFAULT_AUDIT_RULES,
  evaluateAutoAuditTriggers,
} from '../utils/auditScheduler';

interface AAAManagerProps {
  auditRecords: AAAAuditRecord[];
  metrics: NaacMetric[];
  onUpdateNCStatus: (auditId: string, ncId: string, newStatus: any) => void;
  onAddAuditRecord: (record: AAAAuditRecord) => void;
  onBatchAddAuditRecords?: (records: AAAAuditRecord[]) => void;
  isAdminOrAuthorized?: boolean;
}

export const AAAManager: React.FC<AAAManagerProps> = ({
  auditRecords,
  metrics,
  onUpdateNCStatus,
  onAddAuditRecord,
  onBatchAddAuditRecords,
  isAdminOrAuthorized = true,
}) => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'All' | 'Open' | 'Closed' | 'AuditCycles'>('AuditCycles');
  const [rules, setRules] = useState<AuditScheduleRule[]>(DEFAULT_AUDIT_RULES);
  const [showRuleConfig, setShowRuleConfig] = useState(false);
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Run evaluation to detect score drops and timeline triggers
  const evaluation = evaluateAutoAuditTriggers(metrics, auditRecords, rules);

  // Flattened Non-Conformances
  const allNCs = auditRecords.flatMap((audit) =>
    audit.nonConformances.map((nc) => ({
      ...nc,
      auditId: audit.id,
      auditCycle: audit.auditCycle,
      department: audit.department,
      faculty: audit.faculty,
      leadAuditor: audit.leadAuditor,
    }))
  );

  const filteredNCs = allNCs.filter((nc) => {
    const matchesFaculty = selectedFaculty === 'All' || nc.faculty === selectedFaculty;
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Open'
        ? nc.status !== 'Verified & Closed'
        : nc.status === 'Verified & Closed';
    return matchesFaculty && matchesTab;
  });

  const filteredAudits = auditRecords.filter((audit) => {
    return selectedFaculty === 'All' || audit.faculty === selectedFaculty;
  });

  const majorNCCount = allNCs.filter((nc) => nc.type === 'Major NC' && nc.status !== 'Verified & Closed').length;
  const minorNCCount = allNCs.filter((nc) => nc.type === 'Minor NC' && nc.status !== 'Verified & Closed').length;
  const ofiCount = allNCs.filter((nc) => nc.type === 'OFI').length;
  const closedCount = allNCs.filter((nc) => nc.status === 'Verified & Closed').length;
  const autoScheduledCount = auditRecords.filter((a) => a.isAutoScheduled).length;

  // Handler to generate and schedule pending audits
  const handleExecuteAutomatedScheduler = () => {
    if (evaluation.proposedAudits.length === 0) {
      setNotificationMsg('All departments are fully compliant with ISO 21001 timelines and no new maturity drops detected.');
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }

    if (onBatchAddAuditRecords) {
      onBatchAddAuditRecords(evaluation.proposedAudits);
    } else {
      evaluation.proposedAudits.forEach((aud) => onAddAuditRecord(aud));
    }

    setNotificationMsg(
      `Successfully scheduled ${evaluation.proposedAudits.length} internal audits triggered by NAAC maturity metrics and ISO 21001 timelines!`
    );
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Toggle rule enabled state
  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* AAA Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Academic &amp; Administrative Audit
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ISO 21001:2025 Clause 9.2 Auto-Scheduler
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Maturity Deficit Watchdog
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              AAA Peer Review &amp; Non-Conformance (CAPA) Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Automated internal audit scheduler tracking NAAC maturity score drops and ISO 21001:2025 statutory timelines, linked with root-cause 5-Whys diagnosis and closed-loop CAPA verification.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowRuleConfig(!showRuleConfig)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-sky-400" />
              Scheduler Rules ({rules.filter((r) => r.enabled).length}/{rules.length})
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Inspection Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Temporary Alert Banner */}
      {notificationMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-emerald-400/80 hover:text-emerald-200 text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Automated Scheduling System Bar: Score Drop & Timeline Detection */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Zap className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-100">
                Automated Internal Audit Engine (ISO 21001:2025 Surveillance &amp; Score Drop Triggers)
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Continuously monitors NAAC 1–10 criterion scores against historical baselines and ISO 21001 statutory review intervals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {evaluation.proposedAudits.length > 0 ? (
              <button
                onClick={handleExecuteAutomatedScheduler}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                Schedule {evaluation.proposedAudits.length} Pending Triggered Audits
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                All Audits In-Sync (No Pending Triggers)
              </div>
            )}
          </div>
        </div>

        {/* Score Drop Indicators & Alerts */}
        {evaluation.scoreDropAlerts.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
              Active Maturity Score Drop Triggers ({evaluation.scoreDropAlerts.length} Criteria Identified):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {evaluation.scoreDropAlerts.map((alert) => (
                <div
                  key={alert.criterionId}
                  className="bg-slate-950/70 border border-amber-500/30 rounded-lg p-2.5 flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-200">
                      Criterion {alert.criterionId}
                    </span>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {alert.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Cycle 3: {alert.previousScore}% → Current: {alert.currentScore.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      -{alert.drop.toFixed(1)}% Drop
                    </span>
                    <div className="text-[9px] text-amber-400/90 mt-1">Audit Mandated</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scheduler Configuration Rules Panel (Expandable) */}
      {showRuleConfig && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-sky-400" />
                Automated Scheduling Governance Rules (ISO 21001:2025 &amp; NAAC Policy)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enable, disable, or adjust thresholds for automated generation of internal quality audits and surprise inspections.
              </p>
            </div>
            <button
              onClick={() => setShowRuleConfig(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  rule.enabled
                    ? 'bg-slate-950/60 border-slate-700/80'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{rule.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          rule.priority === 'Critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {rule.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {rule.isoClause}
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => handleToggleRule(rule.id)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-800 border-slate-700 cursor-pointer mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Scheduled Cycles</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{auditRecords.length}</div>
          <div className="text-[11px] text-sky-400 mt-1">{autoScheduledCount} auto-scheduled</div>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-rose-300 font-medium">
            <span>Active Major NCs</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{majorNCCount}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Requires immediate sign-off</div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
            <span>Minor NCs</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{minorNCCount}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">Departmental CAPA under review</div>
        </div>

        <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-sky-300 font-medium">
            <span>Quality OFIs</span>
            <ClipboardCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{ofiCount}</div>
          <div className="text-[11px] text-sky-300/80 mt-1">Recommended upgrades</div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-medium">
            <span>Closed &amp; Sealed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{closedCount}</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Audit trail verified</div>
        </div>
      </div>

      {/* Data Actions Bar: Multi-format Export for Peer Review Audit */}
      <DataActionsBar<any>
        title="Academic & Administrative Audit (AAA) & ISO 21001 Internal Quality Registers"
        filename="AAA_Audit_Findings_CAPA_Log"
        data={activeTab === 'AuditCycles' ? filteredAudits : filteredNCs}
        columns={
          activeTab === 'AuditCycles'
            ? [
                { header: 'Audit ID', accessor: 'id' },
                { header: 'Cycle Name', accessor: 'auditCycle' },
                { header: 'Type', accessor: 'type' },
                { header: 'Department', accessor: 'department' },
                { header: 'Faculty', accessor: 'faculty' },
                { header: 'Lead Auditor', accessor: 'leadAuditor' },
                { header: 'Audit Date', accessor: 'auditDate' },
                { header: 'Status', accessor: 'status' },
                { header: 'Trigger Origin', accessor: (a: any) => a.triggerType || 'Manual' },
                { header: 'ISO Clause', accessor: (a: any) => a.isoClause || 'ISO 21001:2025 Cl 9.2' },
                { header: 'Findings Count', accessor: (a: any) => a.nonConformances?.length || 0 },
              ]
            : [
                { header: 'Cycle', accessor: 'auditCycle' },
                { header: 'Faculty', accessor: 'faculty' },
                { header: 'Department', accessor: 'department' },
                { header: 'Auditor', accessor: 'leadAuditor' },
                { header: 'Classification', accessor: 'type' },
                { header: 'Description', accessor: 'description' },
                { header: 'Root Cause', accessor: 'rootCause' },
                { header: 'CAPA Plan', accessor: 'capaPlan' },
                { header: 'Assignee', accessor: 'assignee' },
                { header: 'Due Date', accessor: 'dueDate' },
                { header: 'Status', accessor: 'status' },
              ]
        }
      />

      {/* Filter and Tab Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          {(['AuditCycles', 'All', 'Open', 'Closed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'AuditCycles'
                ? `Internal Audit Cycles (${filteredAudits.length})`
                : tab === 'All'
                ? `All Findings (${filteredNCs.length})`
                : tab === 'Open'
                ? 'Pending CAPA Resolution'
                : 'Closed & Verified'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          {['All', 'Pharmacy', 'Medical', 'Paramedical', 'Engineering', 'Sciences', 'Commerce'].map((fac) => (
            <button
              key={fac}
              onClick={() => setSelectedFaculty(fac)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                selectedFaculty === fac
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {fac}
            </button>
          ))}
        </div>
      </div>

      {/* View 1: Scheduled Internal Audit Cycles (with Auto-Scheduled Indicators) */}
      {activeTab === 'AuditCycles' && (
        <div className="space-y-3">
          {filteredAudits.map((audit) => {
            const hasScoreDrop = audit.triggerType === 'Maturity Score Drop';
            const hasIsoTimeline = audit.triggerType === 'ISO 21001 Timeline';
            const hasLabCheck = audit.triggerType === 'High-Risk Lab Check';

            return (
              <div
                key={audit.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-sky-400">{audit.id}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-bold text-slate-200">{audit.department}</span>
                      <span className="text-xs text-slate-400 font-medium">({audit.faculty})</span>

                      {audit.isAutoScheduled && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <Zap className="w-3 h-3 text-indigo-400" />
                          Auto-Scheduled
                        </span>
                      )}

                      {hasScoreDrop && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <TrendingDown className="w-3 h-3 text-rose-400" />
                          Score Drop Trigger
                        </span>
                      )}

                      {hasIsoTimeline && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          ISO 21001 Surveillance
                        </span>
                      )}

                      {hasLabCheck && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <ShieldAlert className="w-3 h-3 text-amber-400" />
                          Quarterly Safety Check
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">{audit.auditCycle}</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <div className="text-slate-400">Scheduled Date: <strong className="text-slate-200">{audit.auditDate}</strong></div>
                      {audit.complianceDeadline && (
                        <div className="text-[11px] text-amber-400">Target Closure: {audit.complianceDeadline}</div>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                        audit.status === 'Closed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : audit.status === 'In Progress'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : audit.status === 'Action Required'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {audit.status}
                    </span>
                  </div>
                </div>

                {/* Audit Trigger Cause and Statutory Standards */}
                {(audit.triggerReason || audit.isoClause) && (
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="text-slate-300">
                        <strong>Trigger Rationale:</strong> {audit.triggerReason}
                      </span>
                    </div>
                    {audit.isoClause && (
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {audit.isoClause}
                      </span>
                    )}
                  </div>
                )}

                {/* Lead Auditor and Associated NC Findings */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Lead Auditor: <strong className="text-slate-200">{audit.leadAuditor}</strong></span>
                  <span>
                    Linked Non-Conformances &amp; OFIs: <strong className="text-sky-400">{audit.nonConformances.length} finding(s)</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Non-Conformance & CAPA Cards List */}
      {activeTab !== 'AuditCycles' && (
        <div className="space-y-3">
          {filteredNCs.map((nc) => (
            <div
              key={nc.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      nc.type === 'Major NC'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : nc.type === 'Minor NC'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : nc.type === 'Good Practice'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {nc.type}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-semibold">{nc.id}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs font-medium text-slate-300">{nc.department}</span>
                  <span className="text-xs text-slate-500">({nc.faculty})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Target Date: {nc.dueDate}</span>
                  <select
                    value={nc.status}
                    onChange={(e) => onUpdateNCStatus(nc.auditId, nc.id, e.target.value)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium border cursor-pointer ${
                      nc.status === 'Verified & Closed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : nc.status === 'Under Review'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <option value="Open">Status: Open</option>
                    <option value="Under Review">Status: Under Review</option>
                    <option value="Verified & Closed">Status: Verified &amp; Closed</option>
                  </select>
                </div>
              </div>

              {/* Description & CAPA Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block font-semibold mb-1 text-[11px] uppercase tracking-wide">
                    Observation / Non-Conformance Finding
                  </span>
                  <p className="text-slate-200">{nc.description}</p>
                  <div className="mt-2 text-slate-400 text-[11px]">
                    <strong>Root Cause Analysis:</strong> {nc.rootCause}
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block font-semibold mb-1 text-[11px] uppercase tracking-wide">
                    Corrective &amp; Preventive Action (CAPA) Plan
                  </span>
                  <p className="text-emerald-300">{nc.capaPlan}</p>
                  <div className="mt-2 flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Assignee: <strong className="text-slate-200">{nc.assignee}</strong></span>
                    <span>Lead Auditor: <strong className="text-slate-200">{nc.leadAuditor}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
