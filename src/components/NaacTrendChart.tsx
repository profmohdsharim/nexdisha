import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Layers,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { NaacMetric } from '../types';

export interface AssessmentCycleData {
  cycleId: string;
  cycleName: string;
  shortName: string;
  academicYear: string;
  yearNumber: number;
  overallScore: number;
  maturityLevel: 1 | 2 | 3 | 4 | 5;
  cgpa: number;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  c6: number;
  c7: number;
  c8: number;
  c9: number;
  c10: number;
}

export const RECHARTS_HISTORICAL_CYCLES: AssessmentCycleData[] = [
  {
    cycleId: 'cycle-1',
    cycleName: 'Cycle 1 (Foundational)',
    shortName: 'Cycle 1 (15-16)',
    academicYear: '2015-16',
    yearNumber: 2016,
    overallScore: 68.4,
    maturityLevel: 2,
    cgpa: 2.74,
    c1: 65,
    c2: 70,
    c3: 54,
    c4: 72,
    c5: 68,
    c6: 66,
    c7: 64,
    c8: 62,
    c9: 50,
    c10: 58,
  },
  {
    cycleId: 'cycle-2',
    cycleName: 'Cycle 2 (Consolidation)',
    shortName: 'Cycle 2 (19-20)',
    academicYear: '2019-20',
    yearNumber: 2020,
    overallScore: 78.6,
    maturityLevel: 3,
    cgpa: 3.14,
    c1: 76,
    c2: 82,
    c3: 71,
    c4: 84,
    c5: 79,
    c6: 77,
    c7: 80,
    c8: 75,
    c9: 68,
    c10: 74,
  },
  {
    cycleId: 'cycle-3',
    cycleName: 'Cycle 3 (Excellence)',
    shortName: 'Cycle 3 (23-24)',
    academicYear: '2023-24',
    yearNumber: 2024,
    overallScore: 84.8,
    maturityLevel: 4,
    cgpa: 3.39,
    c1: 85,
    c2: 89,
    c3: 82,
    c4: 90,
    c5: 86,
    c6: 83,
    c7: 87,
    c8: 84,
    c9: 80,
    c10: 82,
  },
  {
    cycleId: 'cycle-current',
    cycleName: 'Current Assessment (New MBGA)',
    shortName: 'Current (25-26)',
    academicYear: '2025-26',
    yearNumber: 2026,
    overallScore: 89.2,
    maturityLevel: 4,
    cgpa: 3.57,
    c1: 92,
    c2: 94,
    c3: 86,
    c4: 95,
    c5: 88,
    c6: 84,
    c7: 91,
    c8: 93,
    c9: 82,
    c10: 87,
  },
  {
    cycleId: 'cycle-projected',
    cycleName: 'Target Cycle (Global Repute)',
    shortName: 'Projected (27-28)',
    academicYear: '2027-28',
    yearNumber: 2028,
    overallScore: 94.6,
    maturityLevel: 5,
    cgpa: 3.78,
    c1: 96,
    c2: 98,
    c3: 92,
    c4: 98,
    c5: 94,
    c6: 92,
    c7: 96,
    c8: 97,
    c9: 90,
    c10: 93,
  },
];

export const CRITERIA_CONFIG: {
  id: number;
  key: keyof AssessmentCycleData;
  name: string;
  shortName: string;
  color: string;
}[] = [
  { id: 1, key: 'c1', name: 'Criterion 1: Curricular (OBE)', shortName: 'C1: Curriculum', color: '#38bdf8' },
  { id: 2, key: 'c2', name: 'Criterion 2: Teaching & Assessment', shortName: 'C2: Teaching/OSCE', color: '#10b981' },
  { id: 3, key: 'c3', name: 'Criterion 3: Research & Patents', shortName: 'C3: Research', color: '#f59e0b' },
  { id: 4, key: 'c4', name: 'Criterion 4: Infrastructure & E-Lib', shortName: 'C4: Infrastructure', color: '#ec4899' },
  { id: 5, key: 'c5', name: 'Criterion 5: Student Support', shortName: 'C5: Student Care', color: '#8b5cf6' },
  { id: 6, key: 'c6', name: 'Criterion 6: Governance & Finance', shortName: 'C6: Governance', color: '#06b6d4' },
  { id: 7, key: 'c7', name: 'Criterion 7: Institutional Values', shortName: 'C7: Best Practices', color: '#84cc16' },
  { id: 8, key: 'c8', name: 'Criterion 8: Healthcare Competencies', shortName: 'C8: Healthcare/Clinics', color: '#ef4444' },
  { id: 9, key: 'c9', name: 'Criterion 9: Tech & Skills', shortName: 'C9: Tech/Incubation', color: '#eab308' },
  { id: 10, key: 'c10', name: 'Criterion 10: Stakeholder Quality', shortName: 'C10: Stakeholders', color: '#6366f1' },
];

interface NaacTrendChartProps {
  metrics: NaacMetric[];
  onSelectCriterion?: (criterionId: number) => void;
}

export const NaacTrendChart: React.FC<NaacTrendChartProps> = ({ metrics, onSelectCriterion }) => {
  const [chartType, setChartType] = useState<'multi-line' | 'single-focus' | 'area-stream' | 'cycle-bars'>('multi-line');
  const [selectedCriterionId, setSelectedCriterionId] = useState<number>(1);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('cycle-current');
  const [visibleCriteria, setVisibleCriteria] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: false,
    6: false,
    7: false,
    8: true,
    9: false,
    10: false,
  });

  const toggleCriterion = (id: number) => {
    setVisibleCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = () => {
    const allTrue: Record<number, boolean> = {};
    for (let i = 1; i <= 10; i++) allTrue[i] = true;
    setVisibleCriteria(allTrue);
  };

  const resetPrimary = () => {
    setVisibleCriteria({
      1: true,
      2: true,
      3: true,
      4: true,
      5: false,
      6: false,
      7: false,
      8: true,
      9: false,
      10: false,
    });
  };

  const currentCycle = RECHARTS_HISTORICAL_CYCLES.find((c) => c.cycleId === selectedCycleId) || RECHARTS_HISTORICAL_CYCLES[3];
  const activeCriterion = CRITERIA_CONFIG.find((c) => c.id === selectedCriterionId) || CRITERIA_CONFIG[0];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs max-w-xs backdrop-blur-md">
          <p className="font-bold text-slate-100 border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-sky-400 font-mono">NAAC Progression</span>
          </p>
          <div className="space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color || item.fill }}
                  />
                  {item.name}:
                </span>
                <span className="font-bold font-mono text-slate-100">
                  {typeof item.value === 'number' ? `${item.value.toFixed(1)}%` : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare Bar chart data for the currently selected cycle across 10 criteria
  const cycleCriteriaBarData = CRITERIA_CONFIG.map((conf) => {
    const score = Number(currentCycle[conf.key]);
    return {
      id: conf.id,
      name: `C${conf.id}`,
      fullName: conf.name,
      score,
      fill: conf.color,
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header bar with Mode Toggles */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                NAAC 1–10 Historical Maturity Progression (Recharts Analytics)
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Cycles 1–5 Trajectory
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive timeline tracking longitudinal maturity shifts across previous cycles and projections to Level 5 Eminence.
            </p>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 overflow-x-auto">
            <button
              onClick={() => setChartType('multi-line')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                chartType === 'multi-line'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Multi-Criteria Lines
            </button>
            <button
              onClick={() => setChartType('single-focus')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                chartType === 'single-focus'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Single Focus
            </button>
            <button
              onClick={() => setChartType('area-stream')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                chartType === 'area-stream'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Composite Area
            </button>
            <button
              onClick={() => setChartType('cycle-bars')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                chartType === 'cycle-bars'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Cycle Bar Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar Controls for Criteria Toggles */}
      {chartType === 'multi-line' && (
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Toggle Criteria:
            </span>
            {CRITERIA_CONFIG.map((conf) => {
              const isVisible = visibleCriteria[conf.id];
              return (
                <button
                  key={conf.id}
                  onClick={() => toggleCriterion(conf.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md border font-medium transition-all ${
                    isVisible
                      ? 'bg-slate-800 text-slate-100 border-slate-600 shadow-sm'
                      : 'bg-slate-950/60 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isVisible ? conf.color : '#64748b' }}
                  />
                  C{conf.id}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-medium px-2 py-0.5 rounded hover:bg-slate-800"
            >
              Select All
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={resetPrimary}
              className="text-[11px] text-slate-400 hover:text-slate-200 font-medium px-2 py-0.5 rounded hover:bg-slate-800"
            >
              Core 5
            </button>
          </div>
        </div>
      )}

      {chartType === 'single-focus' && (
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Select Focus Criterion:
          </span>
          {CRITERIA_CONFIG.map((conf) => (
            <button
              key={conf.id}
              onClick={() => {
                setSelectedCriterionId(conf.id);
                if (onSelectCriterion) onSelectCriterion(conf.id);
              }}
              className={`px-2.5 py-1 text-xs rounded-md font-medium shrink-0 transition-colors ${
                selectedCriterionId === conf.id
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              Criterion {conf.id}: {conf.shortName.split(':')[1]}
            </button>
          ))}
        </div>
      )}

      {chartType === 'cycle-bars' && (
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Select Assessment Cycle:
          </span>
          {RECHARTS_HISTORICAL_CYCLES.map((cycle) => (
            <button
              key={cycle.cycleId}
              onClick={() => setSelectedCycleId(cycle.cycleId)}
              className={`px-3 py-1 text-xs rounded-md font-medium shrink-0 transition-colors ${
                selectedCycleId === cycle.cycleId
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cycle.cycleName} ({cycle.academicYear})
            </button>
          ))}
        </div>
      )}

      {/* Main Chart Area */}
      <div className="p-5">
        <div className="h-80 w-full min-h-[320px] relative">
          {chartType === 'multi-line' && (
            <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
              <LineChart
                data={RECHARTS_HISTORICAL_CYCLES}
                margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="shortName"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  domain={[40, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                />
                <ReferenceLine
                  y={55}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: 'Accredited (55%)', fill: '#f59e0b', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#38bdf8"
                  strokeDasharray="4 4"
                  label={{ value: 'Level 4 (80%)', fill: '#38bdf8', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={90}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Level 5 (90%)', fill: '#10b981', fontSize: 10, position: 'right' }}
                />

                {/* Overall Score thick dashed reference */}
                <Line
                  type="monotone"
                  dataKey="overallScore"
                  name="Overall Maturity Index"
                  stroke="#ffffff"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 5, fill: '#ffffff' }}
                />

                {CRITERIA_CONFIG.map((conf) => {
                  if (!visibleCriteria[conf.id]) return null;
                  return (
                    <Line
                      key={conf.id}
                      type="monotone"
                      dataKey={conf.key}
                      name={conf.shortName}
                      stroke={conf.color}
                      strokeWidth={2.2}
                      dot={{ r: 4, strokeWidth: 1.5, fill: '#0f172a' }}
                      activeDot={{ r: 7 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartType === 'single-focus' && (
            <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
              <AreaChart
                data={RECHARTS_HISTORICAL_CYCLES}
                margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="singleFocusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeCriterion.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={activeCriterion.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="shortName"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  domain={[40, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={55}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: 'Accredited (55%)', fill: '#f59e0b', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={90}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Level 5 (90%)', fill: '#10b981', fontSize: 10, position: 'right' }}
                />
                <Area
                  type="monotone"
                  dataKey={activeCriterion.key}
                  name={activeCriterion.name}
                  stroke={activeCriterion.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#singleFocusGradient)"
                  dot={{ r: 6, fill: activeCriterion.color }}
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === 'area-stream' && (
            <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
              <AreaChart
                data={RECHARTS_HISTORICAL_CYCLES}
                margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="compositeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="shortName"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  domain={[40, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={80}
                  stroke="#38bdf8"
                  strokeDasharray="4 4"
                  label={{ value: 'Level 4 Benchmark (80%)', fill: '#38bdf8', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={90}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Level 5 Eminence (90%)', fill: '#10b981', fontSize: 10, position: 'right' }}
                />
                <Area
                  type="monotone"
                  dataKey="overallScore"
                  name="Composite Maturity Score"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  fill="url(#compositeAreaGradient)"
                  dot={{ r: 6, fill: '#38bdf8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === 'cycle-bars' && (
            <ResponsiveContainer width="100%" height={320} minWidth={300} minHeight={320}>
              <BarChart
                data={cycleCriteriaBarData}
                margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={55}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: 'Accredited (55%)', fill: '#f59e0b', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={90}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: 'Level 5 (90%)', fill: '#10b981', fontSize: 10, position: 'right' }}
                />
                <Bar
                  dataKey="score"
                  name="Attainment %"
                  radius={[4, 4, 0, 0]}
                  onClick={(entry: any) => {
                    if (onSelectCriterion && entry && entry.id) {
                      onSelectCriterion(Number(entry.id));
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Selected Cycle / Focus Footer Summary */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Active Focus:{' '}
              <strong className="text-slate-200">
                {chartType === 'single-focus'
                  ? activeCriterion.name
                  : chartType === 'cycle-bars'
                  ? `${currentCycle.cycleName} (${currentCycle.academicYear})`
                  : 'Multi-Criteria Longitudinal Trend (NAAC 1–10)'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Current Score Index: <strong className="text-emerald-400">89.2%</strong> (Level 4)
            </span>
            <span>•</span>
            <span>
              Target 2027: <strong className="text-sky-400">94.6%</strong> (Level 5)
            </span>
            <span>•</span>
            <span>
              Framework: <strong className="text-slate-300">NAAC MBGA &amp; ISO 21001:2025</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
