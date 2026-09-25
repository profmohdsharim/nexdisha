import React, { useState, useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { RadarQualityDimension, StakeholderFeedbackEntry } from '../types';
import { DEPARTMENTS_LIST } from '../data/feedbackMockData';
import {
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  dimensions: RadarQualityDimension[];
  feedbackEntries: StakeholderFeedbackEntry[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  onTriggerAudit: (dimension: RadarQualityDimension) => void;
  onSwitchToFeedbackForm: () => void;
}

type RadarViewMode = 'composite' | 'dual_stakeholder' | 'benchmark_comparison' | 'audit_delta';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export const InstitutionalQualityRadar: React.FC<Props> = ({
  dimensions,
  feedbackEntries,
  selectedDepartment,
  onDepartmentChange,
  onTriggerAudit,
  onSwitchToFeedbackForm,
}) => {
  const [viewMode, setViewMode] = useState<RadarViewMode>('composite');
  const [selectedDimensionKey, setSelectedDimensionKey] = useState<string>(dimensions[0]?.dimensionKey || 'curriculum_obe');

  // Currently focused dimension
  const activeDimension = useMemo(() => {
    return dimensions.find(d => d.dimensionKey === selectedDimensionKey) || dimensions[0];
  }, [dimensions, selectedDimensionKey]);

  // Relevant feedback entries for active dimension
  const relevantComments = useMemo(() => {
    return feedbackEntries.filter(entry => {
      const rating = entry.ratings[activeDimension.dimensionKey];
      return rating !== undefined && (selectedDepartment === 'All Departments' || entry.department === selectedDepartment);
    });
  }, [feedbackEntries, activeDimension, selectedDepartment]);

  // Critical non-conformances needing audit / CAPA (below 75% or with negative gap)
  const criticalDimensions = useMemo(() => {
    return dimensions.filter(d => d.compositeAttainment < d.benchmarkTarget - 5 || d.compositeAttainment < 70);
  }, [dimensions]);

  // Overall institutional satisfaction index
  const averageInstitutionalIndex = useMemo(() => {
    if (dimensions.length === 0) return 0;
    const sum = dimensions.reduce((acc, curr) => acc + curr.compositeAttainment, 0);
    return Math.round((sum / dimensions.length) * 10) / 10;
  }, [dimensions]);

  // Format Recharts data
  const radarChartData = useMemo(() => {
    return dimensions.map(d => ({
      subject: d.shortLabel,
      key: d.dimensionKey,
      fullLabel: d.fullLabel,
      'Composite Score': d.compositeAttainment,
      'Student Rating': d.studentAttainment,
      'Faculty Rating': d.facultyAttainment,
      'ISO Target': d.benchmarkTarget,
      'Audit Score': d.auditScore,
    }));
  }, [dimensions]);

  const CustomRadarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dim = dimensions.find(d => d.shortLabel === label);
      return (
        <div className="bg-slate-950/95 text-white p-3 rounded-lg shadow-xl border border-slate-800 text-xs backdrop-blur-sm z-50 min-w-[220px]">
          <div className="font-semibold text-slate-100 mb-1 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{dim?.shortLabel || label}</span>
            <span className="text-slate-400 font-mono text-[10px]">ISO {dim?.isoClause}</span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2 line-clamp-1">{dim?.fullLabel}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-mono font-medium text-slate-200 tabular-nums">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
          {dim && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-400">
              <span>Benchmark Target:</span>
              <span className="font-mono text-emerald-400">{dim.benchmarkTarget}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Composite Quality Index</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">{averageInstitutionalIndex}%</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              Level 4 Exemplary
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span>ISO 21001 Clause 9.1.2</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>All 8 Quality Dimensions</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Evaluated Stakeholders</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-400 tabular-nums">{feedbackEntries.length}</span>
            <span className="text-xs text-slate-400">Submissions Logged</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span>{feedbackEntries.filter(e => e.role === 'student').length} Students</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{feedbackEntries.filter(e => e.role === 'faculty').length} Faculty Members</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Audit Surveillance Triggers</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${criticalDimensions.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {criticalDimensions.length}
            </span>
            <span className="text-xs text-slate-400">Action Thresholds</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            {criticalDimensions.length > 0 ? (
              <span className="text-amber-400 font-medium">Under ISO 10.2 Review</span>
            ) : (
              <span className="text-emerald-400 font-medium">All Dimensions Compliant</span>
            )}
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>&lt;80% Benchmark</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Department Slicing</div>
            <div className="relative mt-1">
              <select
                aria-label="Filter department for quality radar"
                value={selectedDepartment}
                onChange={e => onDepartmentChange(e.target.value)}
                className="w-full text-xs font-medium bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-indigo-500"
              >
                {DEPARTMENTS_LIST.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Filter Active:</span>
            <span className="font-medium text-indigo-400 truncate max-w-[140px]">{selectedDepartment}</span>
          </div>
        </div>
      </div>

      {/* Main Radar & Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Display (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Institutional Quality Radar (ISO 21001 &amp; NAAC)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-axial polar assessment comparing real-time stakeholder perceptions against benchmarks.
                </p>
              </div>

              {/* View Mode Segmented Controls */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('composite')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'composite'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Composite
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('dual_stakeholder')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'dual_stakeholder'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student vs Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('benchmark_comparison')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'benchmark_comparison'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  vs Target
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('audit_delta')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'audit_delta'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  vs Audit
                </button>
              </div>
            </div>

            {/* Radar Canvas with Recharts */}
            <div className="w-full h-[380px] min-h-[380px] min-w-[320px] pt-2 relative">
              <ResponsiveContainer width="100%" height={380} minWidth={320} minHeight={380}>
                <RadarChart
                  data={radarChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                >
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomRadarTooltip />} />

                  {/* Render based on viewMode */}
                  {viewMode === 'composite' && (
                    <>
                      <Radar
                        name="Composite Attainment"
                        dataKey="Composite Score"
                        stroke="#4338ca"
                        fill="#6366f1"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Target Benchmark"
                        dataKey="ISO Target"
                        stroke="#10b981"
                        fill="transparent"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                    </>
                  )}

                  {viewMode === 'dual_stakeholder' && (
                    <>
                      <Radar
                        name="Student Rating"
                        dataKey="Student Rating"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.35}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Faculty Rating"
                        dataKey="Faculty Rating"
                        stroke="#8b5cf6"
                        fill="#a855f7"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </>
                  )}

                  {viewMode === 'benchmark_comparison' && (
                    <>
                      <Radar
                        name="Composite Score"
                        dataKey="Composite Score"
                        stroke="#4338ca"
                        fill="#6366f1"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Radar
                        name="ISO Benchmark Target"
                        dataKey="ISO Target"
                        stroke="#059669"
                        fill="#10b981"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </>
                  )}

                  {viewMode === 'audit_delta' && (
                    <>
                      <Radar
                        name="Stakeholder Perception"
                        dataKey="Composite Score"
                        stroke="#0284c7"
                        fill="#38bdf8"
                        fillOpacity={0.35}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Official Audit Baseline"
                        dataKey="Audit Score"
                        stroke="#d97706"
                        fill="#f59e0b"
                        fillOpacity={0.25}
                        strokeWidth={1.5}
                      />
                    </>
                  )}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Legend & Dimension Selector Carousel */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Composite Score
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-500 border-t border-dashed border-emerald-500" />
                Benchmark Target (80-85%)
              </span>
            </div>

            <div className="text-xs text-slate-500">
              <span>Select dimension below to inspect voice &amp; audit evidence</span>
            </div>
          </div>
        </div>

        {/* Dimension Drill-down Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-400">
                  Dimension Analysis
                </span>
                <h4 className="text-sm font-semibold text-white mt-0.5">
                  {activeDimension.fullLabel}
                </h4>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                activeDimension.compositeAttainment >= activeDimension.benchmarkTarget
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : activeDimension.compositeAttainment >= 70
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {activeDimension.gapStatus}
              </span>
            </div>

            {/* Standard Mapping & Scores */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">ISO 21001:2025 Mapping</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                  Clause {activeDimension.isoClause}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {activeDimension.isoClauseTitle}
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">NAAC Criterion</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                  Criterion {activeDimension.naacCriterionId}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {activeDimension.naacCriterionTitle}
                </div>
              </div>
            </div>

            {/* Quantitative Score Breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Student Satisfaction:</span>
                <span className="font-mono font-medium text-slate-200 tabular-nums">
                  {activeDimension.studentAttainment}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${activeDimension.studentAttainment}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Faculty Appraisal:</span>
                <span className="font-mono font-medium text-slate-200 tabular-nums">
                  {activeDimension.facultyAttainment}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${activeDimension.facultyAttainment}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Target Benchmark:</span>
                <span className="font-mono font-medium text-emerald-400 tabular-nums">
                  {activeDimension.benchmarkTarget}%
                </span>
              </div>
            </div>

            {/* Stakeholder Voice Comments */}
            <div>
              <div className="text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
                <span>Qualitative Stakeholder Feedback ({relevantComments.length})</span>
                <span className="text-[11px] text-slate-400">Department: {selectedDepartment}</span>
              </div>

              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                {relevantComments.length === 0 ? (
                  <div className="text-xs text-slate-400 italic p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-center">
                    No individual remarks submitted for this specific dimension yet.
                  </div>
                ) : (
                  relevantComments.slice(0, 3).map(comment => (
                    <div
                      key={comment.id}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="capitalize font-medium text-slate-200">{comment.role} ({comment.semesterCohort})</span>
                        <span className="font-mono text-amber-400">{comment.ratings[activeDimension.dimensionKey]}/5 ⭐</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        "{comment.qualitativeComments}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Trigger in AAA Manager */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                {activeDimension.compositeAttainment < activeDimension.benchmarkTarget ? (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Gap: -{(activeDimension.benchmarkTarget - activeDimension.compositeAttainment).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Benchmark Met (+{(activeDimension.compositeAttainment - activeDimension.benchmarkTarget).toFixed(1)}%)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onTriggerAudit(activeDimension)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-indigo-600/30"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Audit in AAA Manager
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Quick-Selector Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-200">
            Dimensions Matrix ({dimensions.length} ISO / NAAC Axes)
          </h4>
          <span className="text-xs text-slate-400">Click any dimension card to inspect detailed stakeholder voices</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {dimensions.map(dim => {
            const isSelected = dim.dimensionKey === selectedDimensionKey;
            const isUnderperforming = dim.compositeAttainment < dim.benchmarkTarget - 4;
            return (
              <button
                key={dim.dimensionKey}
                type="button"
                onClick={() => setSelectedDimensionKey(dim.dimensionKey)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/60 ring-1 ring-indigo-500/40 text-white'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>C{dim.naacCriterionId}</span>
                  <span className="font-mono text-[9px] text-slate-500">ISO {dim.isoClause}</span>
                </div>
                <div className="text-xs font-medium text-slate-200 truncate">
                  {dim.shortLabel}
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className={`text-sm font-bold font-mono tabular-nums ${
                    isUnderperforming ? 'text-amber-400' : 'text-slate-100'
                  }`}>
                    {dim.compositeAttainment}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    /{dim.benchmarkTarget}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
