import React, { useState } from 'react';
import {
  Code,
  Shield,
  Key,
  Terminal,
  Copy,
  Check,
  Send,
  BellRing,
  AlertTriangle,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Play,
  CheckCircle2,
  Building,
  Users,
  Sliders,
  Sparkles,
  HardDrive,
  Database,
  RefreshCw,
  HelpCircle,
  Download,
  BookOpen,
} from 'lucide-react';
import {
  SystemAuditLog,
  UserProfile,
  NotificationTriggerRule,
  TriggerMetricType,
  TriggerSeverity,
  TriggerOperator,
} from '../types';

interface SystemSecurityConsoleProps {
  currentUser: UserProfile;
  auditLogs: SystemAuditLog[];
  onRoleSwitch: (role: any) => void;
  triggerRules: NotificationTriggerRule[];
  onSaveRule: (rule: NotificationTriggerRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onRunEvaluation: () => void;
  departments?: string[];
  onClearCache?: () => void;
  onOpenPwaGuide?: () => void;
}

export const SystemSecurityConsole: React.FC<SystemSecurityConsoleProps> = ({
  currentUser,
  auditLogs,
  onRoleSwitch,
  triggerRules,
  onSaveRule,
  onDeleteRule,
  onToggleRule,
  onRunEvaluation,
  departments = [
    'Department of Pharmaceutical Chemistry',
    'Department of Pharmaceutics',
    'Department of Pharmacology',
    'Department of Computer Science & Engineering',
    'Department of Electronics & Communication',
    'Department of Management Studies',
  ],
  onClearCache,
  onOpenPwaGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'Security' | 'Triggers' | 'API' | 'Logs' | 'Troubleshooting'>('Triggers');
  const [confirmClearConsoleCache, setConfirmClearConsoleCache] = useState(false);
  const [totpInput, setTotpInput] = useState('');
  const [totpVerified, setTotpVerified] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  // Trigger modal state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationTriggerRule | null>(null);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);

  // Rule form state
  const [formData, setFormData] = useState<{
    name: string;
    metricType: TriggerMetricType;
    thresholdValue: number;
    operator: TriggerOperator;
    department: string;
    severity: TriggerSeverity;
    targetRoles: string[];
    description: string;
  }>({
    name: '',
    metricType: 'NAAC_SCORE_DROP',
    thresholdValue: 3.5,
    operator: 'LESS_THAN',
    department: 'ALL',
    severity: 'CRITICAL',
    targetRoles: ['Principal', 'HOD', 'Dean Academics'],
    description: '',
  });

  // Live API Playground State
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/accreditation/metrics');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      metricType: 'NAAC_SCORE_DROP',
      thresholdValue: 3.5,
      operator: 'LESS_THAN',
      department: 'ALL',
      severity: 'CRITICAL',
      targetRoles: ['Principal', 'HOD', 'Dean Academics'],
      description: '',
    });
    setIsRuleModalOpen(true);
  };

  const handleOpenEditModal = (rule: NotificationTriggerRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      metricType: rule.metricType,
      thresholdValue: rule.thresholdValue,
      operator: rule.operator,
      department: rule.department,
      severity: rule.severity,
      targetRoles: rule.targetRoles,
      description: rule.description || '',
    });
    setIsRuleModalOpen(true);
  };

  const handleSaveRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newRule: NotificationTriggerRule = {
      id: editingRule ? editingRule.id : `trig-${Date.now()}`,
      name: formData.name.trim(),
      metricType: formData.metricType,
      thresholdValue: Number(formData.thresholdValue),
      operator: formData.operator,
      department: formData.department,
      severity: formData.severity,
      targetRoles: formData.targetRoles,
      enabled: editingRule ? editingRule.enabled : true,
      createdBy: `${currentUser.name} (${currentUser.role})`,
      description: formData.description.trim(),
      lastEvaluated: 'Just now',
    };

    onSaveRule(newRule);
    setIsRuleModalOpen(false);
  };

  const handleRunEvaluationClick = () => {
    onRunEvaluation();
    setEvaluationFeedback('Automated trigger rule check executed. State assessed against real metrics.');
    setTimeout(() => setEvaluationFeedback(null), 4000);
  };

  const handleTestApi = () => {
    setIsLoadingApi(true);
    setTimeout(() => {
      setIsLoadingApi(false);
      if (selectedEndpoint === '/api/v1/accreditation/metrics') {
        setApiResponse(
          JSON.stringify(
            {
              status: 200,
              timestamp: new Date().toISOString(),
              standard: 'NAAC 1-10 Maturity-Based Graded Accreditation',
              overallCGPA: 3.65,
              maturityLevel: 'Level 4: National Excellence',
              iso21001EOMS: 'Compliant & Certified',
              criteriaCount: 10,
            },
            null,
            2
          )
        );
      } else if (selectedEndpoint === '/api/v1/sops/export') {
        setApiResponse(
          JSON.stringify(
            {
              status: 200,
              institution: 'PharmMed Health & Technical Campus',
              totalPublishedSOPs: 48,
              faculties: [
                'Pharmacy',
                'Medical',
                'Paramedical',
                'Engineering',
                'Sciences',
                'Arts',
                'Commerce',
              ],
              signatureAlgorithm: 'SHA-256 with RSA-4096 EOMS Seal',
            },
            null,
            2
          )
        );
      } else {
        setApiResponse(
          JSON.stringify(
            {
              status: 200,
              syncQueueLength: 0,
              lastDatabaseWALTimestamp: new Date().toISOString(),
              replicationHealth: 'Optimal',
            },
            null,
            2
          )
        );
      }
    }, 600);
  };

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <BellRing className="w-3.5 h-3.5" />
                HOD &amp; Principal Notification Rules
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                RBAC &amp; TOTP 2FA Guard
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                OpenAPI v3.1 Gateway
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              System Security, Trigger Automation &amp; Sandbox Console
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure real-time automated threshold triggers for NAAC score drops, department budget overruns, and compliance violations with direct alert banner and audit delivery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('Triggers')}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'Triggers'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              Notification Triggers
            </button>
            <button
              onClick={() => setActiveTab('Security')}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'Security'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Role &amp; 2FA Security
            </button>
            <button
              onClick={() => setActiveTab('API')}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'API'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              OpenAPI Sandbox
            </button>
            <button
              onClick={() => setActiveTab('Logs')}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'Logs'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Immutable Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('Troubleshooting')}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'Troubleshooting'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Help &amp; Troubleshooting
            </button>
          </div>
        </div>
      </div>

      {/* Trigger Configuration Tab */}
      {activeTab === 'Triggers' && (
        <div className="space-y-6">
          {/* Top stats & actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-400 text-xs">Active Automated Rules</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">
                {triggerRules.filter((r) => r.enabled).length} / {triggerRules.length}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Evaluating in real-time
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-400 text-xs">NAAC Score Drop Monitor</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                &lt; 3.50 CGPA
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Auto-escalates to Principal &amp; IQAC
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-400 text-xs">Budget Overrun Threshold</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                &gt; 90% Sanction
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                HOD and Finance Officer notification
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-400 text-xs">Delivery Mechanism</div>
              <div className="text-lg font-bold text-sky-400 mt-1">
                Real-Time Banner
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Persistent strip + Alert Center drawer
              </div>
            </div>
          </div>

          {/* Action bar for triggers */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Custom Trigger Configuration Rules (HOD &amp; Principal Authority)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Define criteria rules that automatically alert administrators when departmental metrics breach safe limits.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunEvaluationClick}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Evaluate Triggers Now
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Trigger Rule
              </button>
            </div>
          </div>

          {evaluationFeedback && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {evaluationFeedback}
            </div>
          )}

          {/* Rules list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {triggerRules.map((rule) => {
              const isCritical = rule.severity === 'CRITICAL';
              const isWarning = rule.severity === 'WARNING';

              return (
                <div
                  key={rule.id}
                  className={`bg-slate-900 border rounded-xl p-5 space-y-3 transition-all ${
                    !rule.enabled
                      ? 'opacity-60 border-slate-800'
                      : isCritical
                      ? 'border-rose-500/40 hover:border-rose-500/60'
                      : isWarning
                      ? 'border-amber-500/40 hover:border-amber-500/60'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {rule.severity}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {rule.metricType.replace(/_/g, ' ')}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            rule.enabled
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {rule.enabled ? 'ACTIVE' : 'MUTED'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 mt-2">
                        {rule.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onToggleRule(rule.id)}
                        title={rule.enabled ? 'Mute trigger' : 'Activate trigger'}
                        className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                          rule.enabled
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {rule.enabled ? 'Mute' : 'Enable'}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Edit rule"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rule.description || 'Custom trigger rule defined by administration.'}
                  </p>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Trigger Threshold:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {rule.operator === 'LESS_THAN' ? '<' : '>'} {rule.thresholdValue}
                        {rule.metricType === 'BUDGET_OVERRUN'
                          ? '%'
                          : rule.metricType === 'NAAC_SCORE_DROP'
                          ? ' CGPA'
                          : rule.metricType === 'AUDIT_NON_COMPLIANCE'
                          ? ' NCs'
                          : ' Hrs/Wk'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3" /> Scope Department:
                      </span>
                      <span className="text-slate-200 font-medium truncate max-w-[200px]">
                        {rule.department === 'ALL' ? 'All Departments (Institutional)' : rule.department}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Target Alert Recipients:
                      </span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {rule.targetRoles.map((role) => (
                          <span
                            key={role}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Configured by: {rule.createdBy}</span>
                    <span>Last checked: {rule.lastEvaluated || 'Active'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security & Role Tab */}
      {activeTab === 'Security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              Role-Based Access Control (RBAC) Switcher
            </h3>
            <p className="text-xs text-slate-400">
              Switch persona to simulate access authorization policies across the enterprise hierarchy:
            </p>

            <div className="space-y-2">
              {[
                { role: 'Dean_Principal', label: 'Executive Board / Dean & Principal', desc: 'Full administrative & accreditation sign-off authority' },
                { role: 'IQAC_Director', label: 'IQAC Director & Accreditation Lead', desc: 'Full edit rights over NAAC 1-10 criteria & AAA CAPAs' },
                { role: 'HOD_Faculty', label: 'Department Head & Senior Faculty', desc: 'Curricular delivery, SOP authoring, and student grading' },
                { role: 'Lab_Incharge', label: 'Lab Incharge & Technical Demonstrator', desc: 'Equipment logs, chemical safety registers & autoclave SOPs' },
                { role: 'Student_Resident', label: 'Student / Clinical PG Resident', desc: 'LMS course pack view, OSCE logbook & attendance record' },
                { role: 'Finance_Officer', label: 'Finance & Accounts Comptroller', desc: 'Departmental budget allocations, fee ledgers & grants' },
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => onRoleSwitch(item.role)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    currentUser.role === item.role
                      ? 'bg-sky-500/15 border-sky-500 text-sky-200'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{item.label}</span>
                    {currentUser.role === item.role && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500 text-white font-bold">
                        ACTIVE ROLE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Time-based One-Time Password (TOTP 2FA) Simulator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Required for electronic approvals on SOPs, financial grant drawdowns, and accreditation dossier seals.
              </p>

              <div className="mt-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Simulated Authenticator Token</div>
                <div className="text-3xl font-mono font-bold text-emerald-400 tracking-widest my-2">
                  749 203
                </div>
                <div className="text-[11px] text-slate-500">Refreshes every 30 seconds • SHA-1 RFC 6238</div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-xs font-medium text-slate-300">Enter 6-digit Code to Verify Session:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="749203"
                    value={totpInput}
                    onChange={(e) => setTotpInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-mono text-center text-sm"
                  />
                  <button
                    onClick={() => setTotpVerified(totpInput === '749203')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                {totpVerified && (
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-2">
                    <Check className="w-4 h-4" /> 2FA Multi-Factor Verification Confirmed. High-privilege actions unlocked.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              Current Session Security Profile: <strong>256-bit TLS v1.3 • AES-GCM Encrypted Storage</strong>
            </div>
          </div>
        </div>
      )}

      {/* OpenAPI Sandbox Tab */}
      {activeTab === 'API' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-400" />
                Live Institutional RESTful API Explorer
              </h3>
              <p className="text-xs text-slate-400">
                Connect external systems (Biometric Punch, Hospital EMR, DigiLocker, Pharmacy Inventory).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
              >
                <option value="/api/v1/accreditation/metrics">GET /api/v1/accreditation/metrics</option>
                <option value="/api/v1/sops/export">GET /api/v1/sops/export</option>
                <option value="/api/v1/sync/status">GET /api/v1/sync/status</option>
              </select>

              <button
                onClick={handleTestApi}
                disabled={isLoadingApi}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isLoadingApi ? 'Calling...' : 'Send Request'}
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-3">
              <span className="text-sky-400">HTTP/1.1 200 OK • Content-Type: application/json</span>
              <button
                onClick={() => copyToClipboard(apiResponse || '{}', selectedEndpoint)}
                className="hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedEndpoint === selectedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Response
              </button>
            </div>
            <pre className="text-emerald-300 overflow-x-auto max-h-72">
              {apiResponse ||
                '// Click "Send Request" to execute live simulation of third-party API output.'}
            </pre>
          </div>
        </div>
      )}

      {/* Immutable Audit Logs Tab */}
      {activeTab === 'Logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              ISO 21001:2025 Immutable Campus Audit Trail
            </h2>
            <span className="text-xs text-slate-400">Cryptographic Non-Repudiation Register</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator &amp; Role</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Action Summary</th>
                  <th className="py-3 px-4">IP / Terminal Signature</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{log.user}</div>
                      <span className="text-[10px] text-sky-400 font-mono">{log.role}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[10px]">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-100">{log.action}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Help & Troubleshooting SOP Tab */}
      {activeTab === 'Troubleshooting' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  System Help &amp; Troubleshooting SOP
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    Ref: SOP-SYS-TS-2026
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard operating procedures for resolving synchronization stalls, local storage partitioning, offline caching, and PWA setup.
                </p>
              </div>
            </div>

            {onOpenPwaGuide && (
              <button
                onClick={onOpenPwaGuide}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all cursor-pointer shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                Open PWA Installation Guide Modal
              </button>
            )}
          </div>

          {/* Step-by-Step Troubleshooting SOPs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Sync Failures */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">1. Sync &amp; Dispatch Stalls</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Occurs when offline mutation operations fail to drain into the cloud duplex channel.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-sky-300 block mb-1">Step 1: Check Header Badge</span>
                  <span className="text-slate-300">If &quot;Pending Sync&quot; is shown, click the button directly to force queue dispatch.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-sky-300 block mb-1">Step 2: Verify Network Route</span>
                  <span className="text-slate-300">Ensure the device is not behind an institutional captive portal blocking WebSockets.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-sky-300 block mb-1">Step 3: Trigger Re-evaluation</span>
                  <span className="text-slate-300">Switch to Notification Triggers and run &quot;Evaluate Triggers Now&quot;.</span>
                </div>
              </div>
            </div>

            {/* 2. Local Storage & Vault Access */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">2. Local Storage &amp; Vault</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                IndexedDB vault quota restrictions or private browsing storage sandbox blocking.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-amber-300 block mb-1">Step 1: Exit Incognito Mode</span>
                  <span className="text-slate-300">Private tabs discard IndexedDB cryptographic keys upon tab termination.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-amber-300 block mb-1">Step 2: Allow Site Storage</span>
                  <span className="text-slate-300">In browser settings, ensure local site data cookies and storage permissions are granted.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-amber-300 block mb-1">Step 3: Verify Storage Quota</span>
                  <span className="text-slate-300">Ensure host machine has &gt;100MB of free disk storage for local snapshot retention.</span>
                </div>
              </div>
            </div>

            {/* 3. Offline Mode Connectivity */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">3. Offline Mode &amp; Cache</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Offline PWA service worker caching and stale asset eviction protocol.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-emerald-300 block mb-1">Step 1: Keyboard Hard Refresh</span>
                  <span className="text-slate-300">Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac) to bypass stale service worker scripts.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-emerald-300 block mb-1">Step 2: Offline Vault Functionality</span>
                  <span className="text-slate-300">All audit, calendar, and faculty changes remain functional offline and sync automatically.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-750">
                  <span className="font-semibold text-emerald-300 block mb-1">Step 3: Clear Stale Cache</span>
                  <span className="text-slate-300">If anomalous behavior persists, use the Clear Local Cache button below.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remediation & Clear Local Cache Box */}
          <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-300">
                    Emergency Cache Remediation: Clear Local Cache
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Safely purges the client-side browser cache, resets any corrupt IndexedDB transaction locks, unregisters stale service worker caches, and re-initializes clean verified institutional records.
                  </p>
                </div>
              </div>

              {!confirmClearConsoleCache ? (
                <button
                  onClick={() => setConfirmClearConsoleCache(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Local Cache
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-600/80 flex items-center gap-3">
                  <span className="text-xs text-rose-200 font-medium">Confirm local cache purge &amp; reload?</span>
                  <button
                    onClick={() => {
                      setConfirmClearConsoleCache(false);
                      if (onClearCache) {
                        onClearCache();
                      } else {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setConfirmClearConsoleCache(false)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trigger Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {editingRule ? 'Edit Trigger Rule' : 'Configure New Custom Trigger Rule'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sets automated boundary checks with instant notification delivery
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRuleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Rule Title / Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NAAC Criterion 3 Research Drop Alert"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Monitored Metric Dimension *
                  </label>
                  <select
                    value={formData.metricType}
                    onChange={(e) => {
                      const mType = e.target.value as TriggerMetricType;
                      let defaultVal = 3.5;
                      let op: TriggerOperator = 'LESS_THAN';
                      if (mType === 'BUDGET_OVERRUN') {
                        defaultVal = 90.0;
                        op = 'GREATER_THAN';
                      } else if (mType === 'AUDIT_NON_COMPLIANCE') {
                        defaultVal = 2;
                        op = 'GREATER_THAN';
                      } else if (mType === 'FACULTY_WORKLOAD_EXCESS') {
                        defaultVal = 22;
                        op = 'GREATER_THAN';
                      }
                      setFormData({
                        ...formData,
                        metricType: mType,
                        thresholdValue: defaultVal,
                        operator: op,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="NAAC_SCORE_DROP">NAAC Maturity Score Drop (CGPA)</option>
                    <option value="BUDGET_OVERRUN">Department Budget Overrun (%)</option>
                    <option value="AUDIT_NON_COMPLIANCE">AAA Major Non-Conformances (Count)</option>
                    <option value="FACULTY_WORKLOAD_EXCESS">Faculty Workload Cap (Hours/Wk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Department Scope *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="ALL">All Departments (Institutional Wide)</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Operator *
                  </label>
                  <select
                    value={formData.operator}
                    onChange={(e) =>
                      setFormData({ ...formData, operator: e.target.value as TriggerOperator })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="LESS_THAN">Drops Below (&lt;)</option>
                    <option value="GREATER_THAN">Exceeds (&gt;)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Threshold Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.thresholdValue}
                      onChange={(e) =>
                        setFormData({ ...formData, thresholdValue: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <span className="absolute right-2.5 top-2 text-slate-400 font-mono text-[11px]">
                      {formData.metricType === 'BUDGET_OVERRUN'
                        ? '%'
                        : formData.metricType === 'NAAC_SCORE_DROP'
                        ? 'CGPA'
                        : formData.metricType === 'AUDIT_NON_COMPLIANCE'
                        ? 'NCs'
                        : 'Hrs'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value as TriggerSeverity })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="CRITICAL">CRITICAL (Red Banner)</option>
                    <option value="WARNING">WARNING (Amber Alert)</option>
                    <option value="INFO">INFO (Notice)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Escalation Roles *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  {['Principal', 'Dean Academics', 'HOD', 'IQAC Coordinator', 'Finance Officer'].map(
                    (role) => {
                      const checked = formData.targetRoles.includes(role);
                      return (
                        <label
                          key={role}
                          className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  targetRoles: [...formData.targetRoles, role],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  targetRoles: formData.targetRoles.filter((r) => r !== role),
                                });
                              }
                            }}
                            className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                          />
                          <span>{role}</span>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Rule Description &amp; Directives
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this threshold is set and recommended remedial action upon trigger breach..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  {editingRule ? 'Save Changes' : 'Activate Trigger Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
