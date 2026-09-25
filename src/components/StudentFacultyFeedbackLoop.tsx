import React, { useState } from 'react';
import {
  StakeholderFeedbackEntry,
  StakeholderRole,
  RadarQualityDimension,
} from '../types';
import {
  FEEDBACK_DIMENSIONS,
  DEPARTMENTS_LIST,
  FeedbackDimensionDefinition,
} from '../data/feedbackMockData';
import {
  Send,
  Star,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Users,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface Props {
  feedbackEntries: StakeholderFeedbackEntry[];
  onSubmitFeedback: (newEntry: StakeholderFeedbackEntry) => void;
  onTriggerAuditFromFeedback: (entry: StakeholderFeedbackEntry) => void;
  onViewRadar: () => void;
}

export const StudentFacultyFeedbackLoop: React.FC<Props> = ({
  feedbackEntries,
  onSubmitFeedback,
  onTriggerAuditFromFeedback,
  onViewRadar,
}) => {
  const [activeRole, setActiveRole] = useState<StakeholderRole>('student');
  const [department, setDepartment] = useState<string>('Pharmacy');
  const [semesterCohort, setSemesterCohort] = useState<string>('Pharm.D Year 3');
  const [ratings, setRatings] = useState<Record<string, number>>({
    curriculum_obe: 4,
    teaching_pedagogy: 4,
    research_ecosystem: 3,
    infrastructure_digital: 4,
    student_progression: 4,
    governance_leadership: 4,
    ethics_sustainability: 4,
    clinical_internship: 4,
  });
  const [qualitativeComments, setQualitativeComments] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Filter & Search in repository
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All Departments');

  const handleRatingChange = (key: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine sentiment based on average rating
    const ratingValues = Object.values(ratings);
    const avg = ratingValues.reduce((a, b) => a + b, 0) / (ratingValues.length || 1);
    const sentiment: 'positive' | 'neutral' | 'critical' =
      avg >= 4 ? 'positive' : avg >= 3 ? 'neutral' : 'critical';

    // Unique ID
    const newEntry: StakeholderFeedbackEntry = {
      id: `fdb-${Date.now().toString(36)}`,
      role: activeRole,
      department,
      academicYear: '2025-2026',
      semesterCohort: semesterCohort.trim() || (activeRole === 'student' ? 'Semester Batch 2026' : 'Faculty Cadre'),
      respondentIdentifier: `${activeRole === 'student' ? 'Student' : 'Faculty'}-${department.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      submittedAt: new Date().toISOString(),
      ratings: { ...ratings },
      qualitativeComments: qualitativeComments.trim() || 'Attended standard semester feedback session without additional written notes.',
      sentiment,
      isoClauseTags: ['8.2', '9.1.2', '10.2'],
      naacCriterionTags: [1, 2, 4],
      status: avg < 3 ? 'Action Triggered' : 'Reviewed',
    };

    onSubmitFeedback(newEntry);
    setSubmittedSuccess(true);
    setQualitativeComments('');
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  const filteredEntries = feedbackEntries.filter(entry => {
    if (roleFilter !== 'all' && entry.role !== roleFilter) return false;
    if (departmentFilter !== 'All Departments' && entry.department !== departmentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComment = entry.qualitativeComments.toLowerCase().includes(q);
      const matchDept = entry.department.toLowerCase().includes(q);
      const matchCohort = entry.semesterCohort.toLowerCase().includes(q);
      const matchId = entry.respondentIdentifier.toLowerCase().includes(q);
      if (!matchComment && !matchDept && !matchCohort && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Feedback Submission Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Continuous Improvement Loop
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">ISO 21001:2025 Clause 9.1.2</span>
            </div>
            <h3 className="text-lg font-semibold text-white mt-1">
              Campus Stakeholder Experience Evaluation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct voice-of-stakeholder capture mapped automatically to accreditation criteria and institutional quality radar.
            </p>
          </div>

          {/* Role Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveRole('student');
                setSemesterCohort('Pharm.D Year 3');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeRole === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Experience
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('faculty');
                setSemesterCohort('Assistant Professor Cadre');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeRole === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Faculty Appraisal
            </button>
          </div>
        </div>

        {submittedSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Feedback successfully logged and mapped to ISO 21001 &amp; NAAC criteria. Institutional Quality Radar recalculated.</span>
            </div>
            <button
              type="button"
              onClick={onViewRadar}
              className="font-medium text-emerald-400 underline hover:text-emerald-300 flex items-center gap-1 ml-4"
            >
              View Radar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="mt-5 space-y-5">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Faculty / Department
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {DEPARTMENTS_LIST.filter(d => d !== 'All Departments').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {activeRole === 'student' ? 'Class / Semester Cohort' : 'Designation / Faculty Cadre'}
              </label>
              <input
                type="text"
                value={semesterCohort}
                onChange={e => setSemesterCohort(e.target.value)}
                placeholder={activeRole === 'student' ? 'e.g. B.Tech Semester 6' : 'e.g. Associate Professor'}
                className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Academic Year Cycle
              </label>
              <input
                type="text"
                value="2025-2026 (Even Semester)"
                disabled
                className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Rating Questions Matrix */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Quality Dimension &amp; Role-Specific Prompt</span>
              <span className="hidden sm:inline text-slate-400">Likert Rating (1: Deficient to 5: Exemplary)</span>
            </div>

            <div className="divide-y divide-slate-800">
              {FEEDBACK_DIMENSIONS.map((dim: FeedbackDimensionDefinition) => {
                const currentRating = ratings[dim.key] || 3;
                const promptText = activeRole === 'student' ? dim.studentQuestion : dim.facultyQuestion;

                return (
                  <div key={dim.key} className="p-3 sm:p-4 hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1 pr-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-white">{dim.fullLabel}</span>
                          <span className="text-[11px] text-indigo-400 font-medium">ISO {dim.isoClause}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-[11px] text-slate-400">NAAC C{dim.naacCriterionId}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {promptText}
                        </p>
                      </div>

                      {/* 1-5 Rating Selector */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {[1, 2, 3, 4, 5].map(star => {
                          const isActive = star <= currentRating;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(dim.key, star)}
                              className={`p-1.5 rounded-md transition-all flex flex-col items-center ${
                                isActive
                                  ? 'text-amber-400 hover:text-amber-300'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                              title={`${star} / 5`}
                            >
                              <Star className={`w-5 h-5 ${isActive ? 'fill-amber-400' : ''}`} />
                              <span className="text-[10px] font-mono mt-0.5 text-slate-400">
                                {star}
                              </span>
                            </button>
                          );
                        })}
                        <span className="ml-2 font-mono text-xs font-bold text-amber-400 min-w-[24px]">
                          {currentRating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qualitative Comments */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Qualitative Observations, Recommendations &amp; Critical Feedback
            </label>
            <textarea
              rows={3}
              value={qualitativeComments}
              onChange={e => setQualitativeComments(e.target.value)}
              placeholder={
                activeRole === 'student'
                  ? 'Detail specific experiences regarding course delivery, lab equipment uptime, hospital ward rotations, or student support services...'
                  : 'Note observations regarding curriculum autonomy, seed grant access, instrumentation calibration, or administrative support...'
              }
              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Form Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Encrypted submission stored in local compliance vault</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Anonymized Identifier Applied</span>
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-indigo-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Experience Feedback
            </button>
          </div>
        </form>
      </div>

      {/* Stakeholder Feedback Repository & Audit Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-semibold text-white">
              Stakeholder Feedback Repository &amp; Continuous Improvement Records
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit stream of registered submissions with ISO 21001 Clause 10.2 non-conformance detection.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search remarks, IDs..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 w-36 sm:w-48 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="text-xs bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Only</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="text-xs bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden"
            >
              {DEPARTMENTS_LIST.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="mt-3 divide-y divide-slate-800">
          {filteredEntries.length === 0 ? (
            <div className="text-xs text-slate-500 italic p-6 text-center">
              No feedback records matching the active filter criteria.
            </div>
          ) : (
            filteredEntries.map(entry => {
              const avgScore = (
                Object.values(entry.ratings).reduce((a, b) => a + b, 0) /
                (Object.values(entry.ratings).length || 1)
              ).toFixed(1);

              const hasDeficit = Number(avgScore) < 3.2;

              return (
                <div key={entry.id} className="py-3 sm:py-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-white">{entry.respondentIdentifier}</span>
                      <span className="text-slate-600">·</span>
                      <span className="capitalize text-slate-300">{entry.role}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300">{entry.department}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {new Date(entry.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{entry.qualitativeComments}"
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {entry.isoClauseTags.map(c => (
                        <span key={c} className="text-[10px] text-slate-400 font-mono bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                          ISO {c}
                        </span>
                      ))}
                      <span className="text-slate-700">|</span>
                      {entry.naacCriterionTags.map(c => (
                        <span key={c} className="text-[10px] text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                          NAAC Criterion {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center md:flex-col md:items-end justify-between gap-2 shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold font-mono text-white">{avgScore}</span>
                      <span className="text-[10px] text-slate-500">/5.0</span>
                    </div>

                    <span className={`text-[11px] font-medium ${
                      entry.sentiment === 'positive'
                        ? 'text-emerald-400'
                        : entry.sentiment === 'critical'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}>
                      {entry.sentiment === 'critical' ? 'Requires Attention' : entry.sentiment === 'positive' ? 'High Satisfaction' : 'Satisfactory'}
                    </span>

                    {hasDeficit && (
                      <button
                        type="button"
                        onClick={() => onTriggerAuditFromFeedback(entry)}
                        className="mt-1 px-2.5 py-1 text-[11px] font-medium text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-md transition-colors flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        Trigger Audit &amp; CAPA
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
