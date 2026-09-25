import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  Printer,
  Download,
  Award,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  Eye,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { StudentSemesterResult, StudentRecord } from '../types';

interface ResultsManagementViewProps {
  results: StudentSemesterResult[];
  students: StudentRecord[];
  preselectedStudentId?: string | null;
}

export const ResultsManagementView: React.FC<ResultsManagementViewProps> = ({
  results,
  students,
  preselectedStudentId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedResultForGradeCard, setSelectedResultForGradeCard] = useState<StudentSemesterResult | null>(
    preselectedStudentId
      ? results.find((r) => r.studentId === preselectedStudentId) || results[0] || null
      : null
  );

  const filteredResults = results.filter((res) => {
    const matchesSearch =
      res.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.termLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || res.resultStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Analytics KPIs
  const totalResultsCount = results.length;
  const passedCount = results.filter((r) => r.resultStatus === 'Passed').length;
  const avgSgpa =
    totalResultsCount > 0
      ? (results.reduce((acc, r) => acc + r.sgpa, 0) / totalResultsCount).toFixed(2)
      : '0.00';
  const passPercentage =
    totalResultsCount > 0 ? ((passedCount / totalResultsCount) * 100).toFixed(1) : '100';

  const getStatusBadge = (status: StudentSemesterResult['resultStatus']) => {
    switch (status) {
      case 'Passed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Passed
          </span>
        );
      case 'Passed with Backlog':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Backlog
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20">
            Withheld
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Examination Results & Grade Card Center
              </h2>
              <p className="text-sm text-slate-400">
                Evaluation results, subject-wise internal/external breakups, SGPA/CGPA computation, and controller-verified grade cards
              </p>
            </div>
          </div>
        </div>

        {/* 4 Result Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Published Results</p>
            <p className="text-2xl font-bold text-white mt-1">{totalResultsCount}</p>
            <span className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
              Verified by COE
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Pass Rate</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{passPercentage}%</p>
            <span className="text-xs text-emerald-400/90 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Exceeds NBA Benchmark
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Average SGPA</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{avgSgpa}</p>
            <span className="text-xs text-purple-400/90 flex items-center gap-1 mt-0.5">
              <Award className="w-3 h-3" /> Scale 10.0
            </span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Distinction (SGPA &ge; 9.0)</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {results.filter((r) => r.sgpa >= 9.0).length}
            </p>
            <span className="text-xs text-amber-400/90 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3" /> High Honors
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, enrollment no, or program..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Result Status</option>
              <option value="Passed">Passed</option>
              <option value="Passed with Backlog">Passed with Backlog</option>
              <option value="Withheld">Withheld</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Student & Enrollment</th>
                <th className="py-3.5 px-4 font-semibold">Program / Session</th>
                <th className="py-3.5 px-4 font-semibold">Credits Earned</th>
                <th className="py-3.5 px-4 font-semibold">SGPA</th>
                <th className="py-3.5 px-4 font-semibold">CGPA</th>
                <th className="py-3.5 px-4 font-semibold">Result Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredResults.map((res) => (
                <tr
                  key={res.id}
                  className="hover:bg-slate-800/40 transition cursor-pointer"
                  onClick={() => setSelectedResultForGradeCard(res)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{res.studentName}</div>
                    <div className="text-xs text-slate-400 font-mono">{res.enrollmentNo}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{res.programName}</div>
                    <div className="text-xs text-slate-400">
                      {res.termLabel} • {res.examSession}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="font-semibold text-slate-200">
                      {res.totalCreditsEarned} / {res.totalCreditsOffered}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-purple-400 text-sm">{res.sgpa.toFixed(2)}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-amber-400 text-sm">{res.cgpa.toFixed(2)}</span>
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(res.resultStatus)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResultForGradeCard(res);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Grade Card</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRADE CARD MODAL */}
      {selectedResultForGradeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Statement of Marks & Grade Card
              </span>
              <button
                onClick={() => setSelectedResultForGradeCard(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Printable Grade Card */}
            <div
              id="printable-grade-card"
              className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-md space-y-4"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <div className="font-extrabold text-xl text-slate-900 tracking-wide uppercase">
                  PharmMed Institute of Higher Learning & Research
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  OFFICE OF THE CONTROLLER OF EXAMINATIONS
                </div>
                <div className="text-[11px] text-slate-500">
                  Accredited by NAAC with 'A++' Grade • PCI & NMC Approved Institution
                </div>
                <div className="mt-2 inline-block px-4 py-1 bg-slate-100 rounded border border-slate-300 text-xs font-bold tracking-wider text-slate-800 uppercase">
                  SEMESTER GRADE REPORT (GRADE CARD)
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-500">Student Name: </span>
                  <span className="font-bold text-slate-900">
                    {selectedResultForGradeCard.studentName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Enrollment No: </span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedResultForGradeCard.enrollmentNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Program: </span>
                  <span className="font-medium text-slate-800">
                    {selectedResultForGradeCard.programName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Examination Session: </span>
                  <span className="font-medium text-slate-800">
                    {selectedResultForGradeCard.examSession}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Semester / Term: </span>
                  <span className="font-medium text-slate-800">
                    {selectedResultForGradeCard.termLabel}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Date of Issue: </span>
                  <span className="font-medium text-slate-800">
                    {selectedResultForGradeCard.publishedDate}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-t border-b border-slate-300 font-semibold">
                      <th className="py-2 px-2">Code</th>
                      <th className="py-2 px-2">Course / Subject Name</th>
                      <th className="py-2 px-1 text-center">Credits</th>
                      <th className="py-2 px-1 text-center">Int (Max)</th>
                      <th className="py-2 px-1 text-center">Ext (Max)</th>
                      <th className="py-2 px-1 text-center">Total (Max)</th>
                      <th className="py-2 px-1 text-center">Grade</th>
                      <th className="py-2 px-1 text-center">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedResultForGradeCard.subjects.map((sub) => (
                      <tr key={sub.subjectCode} className="hover:bg-slate-50">
                        <td className="py-2 px-2 font-mono font-semibold text-slate-800">
                          {sub.subjectCode}
                        </td>
                        <td className="py-2 px-2 text-slate-900 font-medium">{sub.subjectName}</td>
                        <td className="py-2 px-1 text-center font-semibold text-slate-700">
                          {sub.credits}
                        </td>
                        <td className="py-2 px-1 text-center text-slate-600">
                          {sub.internalMarks} ({sub.maxInternal})
                        </td>
                        <td className="py-2 px-1 text-center text-slate-600">
                          {sub.externalMarks} ({sub.maxExternal})
                        </td>
                        <td className="py-2 px-1 text-center font-bold text-slate-900">
                          {sub.totalMarks} ({sub.maxTotal})
                        </td>
                        <td className="py-2 px-1 text-center">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                              sub.letterGrade === 'O' || sub.letterGrade === 'A+'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.letterGrade === 'F'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {sub.letterGrade}
                          </span>
                        </td>
                        <td className="py-2 px-1 text-center font-semibold text-slate-800">
                          {sub.gradePoint}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SGPA & CGPA Summary Block */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded-lg border border-slate-300 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase block">Total Credits</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedResultForGradeCard.totalCreditsEarned} /{' '}
                    {selectedResultForGradeCard.totalCreditsOffered}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase block">Semester GPA (SGPA)</span>
                  <span className="font-extrabold text-blue-700 text-base">
                    {selectedResultForGradeCard.sgpa.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase block">Cumulative GPA (CGPA)</span>
                  <span className="font-extrabold text-emerald-700 text-base">
                    {selectedResultForGradeCard.cgpa.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Digital Verification Code: PME-R-{selectedResultForGradeCard.id}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Result Status: {selectedResultForGradeCard.resultStatus}
                  </p>
                </div>

                <div className="text-center">
                  <div className="font-serif italic font-bold text-slate-800">C. P. Soni</div>
                  <div className="w-32 border-b border-slate-400 my-1"></div>
                  <div className="text-[10px] font-semibold text-slate-600 uppercase">
                    Controller of Examinations
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-purple-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Grade Card</span>
              </button>
              <button
                onClick={() => setSelectedResultForGradeCard(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
