import React from 'react';
import {
  ShieldCheck,
  Award,
  Layers,
  Activity,
  FileCheck2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { NaacMetric, MaturityLevel } from '../types';
import { DataActionsBar } from './DataActionsBar';
import { NaacTrendChart } from './NaacTrendChart';
import { ErrorBoundary } from './ErrorBoundary';

interface AccreditationDashboardProps {
  metrics: NaacMetric[];
  onSelectMetric: (metric: NaacMetric) => void;
}

export const AccreditationDashboard: React.FC<AccreditationDashboardProps> = ({
  metrics,
  onSelectMetric,
}) => {
  // Compute Overall Weighted Percentage
  const totalWeight = metrics.reduce((acc, m) => acc + m.weightage, 0);
  const weightedEarned = metrics.reduce(
    (acc, m) => acc + (m.currentScore / m.maxScore) * m.weightage,
    0
  );
  const overallPercentage = totalWeight > 0 ? (weightedEarned / totalWeight) * 100 : 0;

  // New NAAC Binary Status
  const isBinaryAccredited = overallPercentage >= 55; // NAAC binary threshold benchmark

  // New Maturity-Based Graded Accreditation (Level 1 to Level 5)
  let maturityLevel: MaturityLevel = 1;
  let maturityTitle = 'Level 1: Foundation Quality';
  let maturityColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  if (overallPercentage >= 90) {
    maturityLevel = 5;
    maturityTitle = 'Level 5: Global Repute & Institution of Eminence';
    maturityColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (overallPercentage >= 80) {
    maturityLevel = 4;
    maturityTitle = 'Level 4: National Excellence & Innovation';
    maturityColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  } else if (overallPercentage >= 70) {
    maturityLevel = 3;
    maturityTitle = 'Level 3: High Quality / Outcome-Driven';
    maturityColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  } else if (overallPercentage >= 55) {
    maturityLevel = 2;
    maturityTitle = 'Level 2: Standard Quality Compliant';
    maturityColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
  }

  // Projected CGPA on 4.0 scale
  const projectedCGPA = (overallPercentage / 100) * 4.0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Regulatory & Accreditation Paradigm */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ISO 21001:2025 EOMS Validated
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                NAAC New Maturity Paradigm
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                NBA SAR Tier-I Compliant
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              Executive Accreditation &amp; IQAC Quality Governance Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Multi-framework compliance engine integrating NAAC Criteria 1–10, NBA Tier-1 Outcome-Based Attainment, NIRF Dimension Metrics, and ISO 21001:2025 EOMS standards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-3 rounded-lg border text-center ${maturityColor}`}>
              <div className="text-xs uppercase font-medium text-slate-400">NAAC Maturity Level</div>
              <div className="text-xl font-bold tracking-tight mt-0.5">Level {maturityLevel} / 5</div>
              <div className="text-[11px] font-medium opacity-90">{maturityTitle.split(':')[1]}</div>
            </div>

            <div className="px-4 py-3 rounded-lg border border-slate-800 bg-slate-950/60 text-center">
              <div className="text-xs uppercase font-medium text-slate-400">Binary Status</div>
              <div className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {isBinaryAccredited ? 'Accredited' : 'Awaiting'}
              </div>
              <div className="text-[11px] text-slate-400">Valid for 5-Year Cycle</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Score Index</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100">{overallPercentage.toFixed(1)}%</span>
            <span className="text-xs text-emerald-400 font-medium">CGPA {projectedCGPA.toFixed(2)} / 4.00</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Target Benchmark: 85.0% for Grade A++</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>NBA Tier-I SAR Attainment</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100">88.4%</span>
            <span className="text-xs text-cyan-400 font-medium">9 of 10 Programs</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '88.4%' }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">B.Pharm, Pharm.D &amp; Tech accredited</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>NIRF Projected Rank Band</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-300">Rank 18 - 25</span>
            <span className="text-xs text-purple-400 font-medium">Pharmacy / Health</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '82%' }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">RPC &amp; TLR points up by 6.4% YoY</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ISO 21001:2025 EOMS Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">96.2%</span>
            <span className="text-xs text-emerald-400 font-medium">0 Major NCs</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.2%' }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Full PDCA Quality Cycle verified</div>
        </div>
      </div>

      {/* Interactive Trend Chart: Historical Progression of NAAC 1-10 Maturity Scores */}
      <ErrorBoundary fallbackTitle="Historical Trend Analytics Temporarily Unavailable">
        <NaacTrendChart
          metrics={metrics}
          onSelectCriterion={(cId) => {
            const matched = metrics.find((m) => m.criterionId === cId);
            if (matched) {
              onSelectMetric(matched);
            }
          }}
        />
      </ErrorBoundary>

      {/* Data Actions Bar: Multi-format Export for Accreditation Audit */}
      <DataActionsBar<NaacMetric>
        title="NAAC 1-10 Criteria & Maturity-Based Graded Accreditation Matrix"
        filename="NAAC_1_to_10_Criteria_Matrix"
        data={metrics}
        columns={[
          { header: 'Criterion', accessor: (m: any) => `Criterion ${m.criterionId}` },
          { header: 'Criterion Title', accessor: 'criterionTitle' },
          { header: 'Metric Code', accessor: 'metricCode' },
          { header: 'Metric Description', accessor: 'metricDescription' },
          { header: 'Type', accessor: 'metricType' },
          { header: 'Weightage', accessor: 'weightage' },
          { header: 'Current Score', accessor: 'currentScore' },
          { header: 'Max Score', accessor: 'maxScore' },
          { header: 'Attainment %', accessor: (m: any) => `${((m.currentScore / m.maxScore) * 100).toFixed(1)}%` },
          { header: 'Status', accessor: 'status' },
          { header: 'Evidences Count', accessor: 'evidenceCount' },
          { header: 'Remarks', accessor: 'remarks' },
        ]}
      />

      {/* 10 NAAC Criteria Interactive Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-sky-400" />
              NAAC Criteria 1–10 Comprehensive Assessment Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any criterion to view evidence repositories, metric descriptors, and live audit proofs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Verified (5)
            </span>
            <span className="inline-flex items-center gap-1 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-500" /> Compliant (4)
            </span>
            <span className="inline-flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Action (1)
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {metrics.map((metric) => {
            const scorePercent = (metric.currentScore / metric.maxScore) * 100;
            return (
              <div
                key={metric.criterionId}
                onClick={() => onSelectMetric(metric)}
                className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors group flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                    C{metric.criterionId}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-sky-400 font-mono">
                        {metric.metricCode}
                      </span>
                      <h3 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {metric.criterionTitle}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          metric.status === 'Verified'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : metric.status === 'Compliant'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {metric.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {metric.metricDescription}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                      <span>Weightage: <strong className="text-slate-300">{metric.weightage}</strong></span>
                      <span>Benchmark: <strong className="text-slate-300">{metric.benchmark}</strong></span>
                      <span>Verified Evidences: <strong className="text-sky-300">{metric.evidenceCount} files</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 lg:w-64">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Attainment</span>
                      <span className="font-semibold text-slate-200">{scorePercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          scorePercent >= 90
                            ? 'bg-emerald-500'
                            : scorePercent >= 75
                            ? 'bg-sky-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 group-hover:border-sky-500/50 transition-all">
                    Inspect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
