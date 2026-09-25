import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Layers,
  Search,
  Filter,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { LMSCourse, FacultyCluster } from '../types';
import { DataActionsBar } from './DataActionsBar';

interface LMSPortalProps {
  courses: LMSCourse[];
  onSelectCourse: (course: LMSCourse) => void;
}

export const LMSPortal: React.FC<LMSPortalProps> = ({ courses, onSelectCourse }) => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourseModal, setActiveCourseModal] = useState<LMSCourse | null>(null);

  const filteredCourses = courses.filter((c) => {
    const matchesFaculty = selectedFaculty === 'All' || c.faculty === selectedFaculty;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFaculty && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Outcome-Based Education (OBE)
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PCI / NMC / NBA Compliant
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              Multi-Disciplinary LMS &amp; Clinical/Lab Competency Portal
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Curricular delivery across Pharmacy, Medicine, Paramedical, Engineering, Sciences, Arts &amp; Commerce. Real-time CO-PO attainment tracking, clinical OSCE rubrics, formulation labs, and digital lecture vaults.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <div className="text-[11px] uppercase text-slate-400">Total Enrolled</div>
              <div className="text-lg font-bold text-cyan-400">
                {courses.reduce((acc, c) => acc + c.enrolledStudents, 0)} Students
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <div className="text-[11px] uppercase text-slate-400">Avg OBE Attainment</div>
              <div className="text-lg font-bold text-emerald-400">85.8%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Actions Bar: Multi-format Export for LMS Course Offerings */}
      <DataActionsBar<LMSCourse>
        title="LMS Curricular Modules & OBE Course Outcome Attainment Ledger"
        filename="LMS_Curriculum_OBE_Ledger"
        data={filteredCourses}
        columns={[
          { header: 'Course Code', accessor: 'code' },
          { header: 'Title', accessor: 'title' },
          { header: 'Program Affiliation', accessor: 'program' },
          { header: 'Faculty', accessor: 'faculty' },
          { header: 'Instructor', accessor: 'instructor' },
          { header: 'Credits', accessor: 'credits' },
          { header: 'Enrolled Students', accessor: 'enrolledStudents' },
          { header: 'Modules', accessor: 'modulesCount' },
          { header: 'Progress', accessor: (c: any) => `${c.completedLectures}/${c.totalLectures} Lectures` },
          { header: 'OBE Attainment %', accessor: (c: any) => `${c.averageAttainment}%` },
          { header: 'Lab / Clinical Location', accessor: (c: any) => c.labLocation || 'Theory Hall' },
        ]}
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, subject code, clinical ward, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {['All', 'Pharmacy', 'Medical', 'Paramedical', 'Engineering', 'Sciences', 'Commerce'].map(
            (fac) => (
              <button
                key={fac}
                onClick={() => setSelectedFaculty(fac)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFaculty === fac
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {fac}
              </button>
            )
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((c) => {
          const progressPercent = Math.round((c.completedLectures / c.totalLectures) * 100);
          return (
            <div
              key={c.id}
              onClick={() => setActiveCourseModal(c)}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4.5 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {c.code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    {c.faculty} • {c.credits} Credits
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 mt-2.5 transition-colors line-clamp-1">
                  {c.title}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">{c.program}</div>

                <div className="mt-3 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                  <div className="text-slate-400 text-[11px] mb-0.5">Active Topic / Practical:</div>
                  <div className="text-slate-200 line-clamp-1 font-medium">{c.recentTopic}</div>
                </div>

                {c.hasLabOrClinical && c.labLocation && (
                  <div className="mt-2 text-[11px] text-cyan-400/90 flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Lab / Clinical: {c.labLocation}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Syllabus Covered</span>
                  <span className="text-slate-200 font-semibold">
                    {c.completedLectures} / {c.totalLectures} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>OBE Attainment: <strong className="text-emerald-400">{c.averageAttainment}%</strong></span>
                  <span className="text-cyan-400 flex items-center gap-0.5 group-hover:underline">
                    View Course Pack <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Detail Modal */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <span className="font-mono text-xs font-semibold text-cyan-400">
                  {activeCourseModal.code} • {activeCourseModal.program}
                </span>
                <h2 className="text-base font-bold text-slate-100 mt-0.5">{activeCourseModal.title}</h2>
              </div>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Instructor</span>
                  <strong className="text-slate-200 text-xs">{activeCourseModal.instructor}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Credits</span>
                  <strong className="text-slate-200">{activeCourseModal.credits} L-T-P</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Students</span>
                  <strong className="text-slate-200">{activeCourseModal.enrolledStudents}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">CO Attainment</span>
                  <strong className="text-emerald-400">{activeCourseModal.averageAttainment}%</strong>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Course Outcomes (CO-PO Mapping)
                </h4>
                <div className="space-y-1.5">
                  {[
                    'CO1: Explain chemical structures, biochemical pathways, and drug mechanisms.',
                    'CO2: Formulate, dispense, and evaluate solid & liquid dosages per pharmacopeia.',
                    'CO3: Implement clinical monitoring for adverse drug reactions in hospital wards.',
                    'CO4: Comply with statutory ethics (CPCSEA, CDSCO, ISO 21001:2025 protocols).',
                  ].map((co, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs"
                    >
                      <span className="text-slate-300">{co}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        Level 3 Attained
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Digital Course Material &amp; Laboratory Modules
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-cyan-500/40 cursor-pointer">
                    <FileText className="w-4 h-4 text-cyan-400 mb-1" />
                    <div className="font-semibold text-slate-200">Lecture Notes &amp; Slides</div>
                    <div className="text-[11px] text-slate-400">PDFs cached in offline PWA vault</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-cyan-500/40 cursor-pointer">
                    <BookOpen className="w-4 h-4 text-emerald-400 mb-1" />
                    <div className="font-semibold text-slate-200">OSCE/OSPE Rubric Sheet</div>
                    <div className="text-[11px] text-slate-400">Objective clinical evaluation criteria</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
