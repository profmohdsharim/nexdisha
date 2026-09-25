import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Search,
  Plus,
  Edit2,
  Trash2,
  Layers,
  FileText,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  AcademicProgramOffering,
  SessionalAssessmentRecord,
  SubjectModule,
  FacultyCluster,
  AcademicCycleMode,
} from '../types';
import { DataActionsBar } from './DataActionsBar';
import { ExportColumn } from '../utils/exportEngine';

interface ExamManagementModuleProps {
  programs: AcademicProgramOffering[];
  sessionals: SessionalAssessmentRecord[];
  onAddProgram: (program: AcademicProgramOffering) => void;
  onUpdateProgram: (program: AcademicProgramOffering) => void;
  onDeleteProgram: (id: string) => void;
  onAddSessional: (record: SessionalAssessmentRecord) => void;
  onUpdateSessional: (record: SessionalAssessmentRecord) => void;
  onDeleteSessional: (id: string) => void;
  onImportSessionals: (imported: SessionalAssessmentRecord[]) => void;
  isAdminOrAuthorized?: boolean;
}

export const ExamManagementModule: React.FC<ExamManagementModuleProps> = ({
  programs,
  sessionals,
  onAddProgram,
  onUpdateProgram,
  onDeleteProgram,
  onAddSessional,
  onUpdateSessional,
  onDeleteSessional,
  onImportSessionals,
  isAdminOrAuthorized = true,
}) => {
  const [activeTab, setActiveTab] = useState<'Sessionals' | 'Programs' | 'Subjects'>('Sessionals');
  const [cycleFilter, setCycleFilter] = useState<'All' | AcademicCycleMode>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sessional Assessment Modal
  const [isSessionalModalOpen, setIsSessionalModalOpen] = useState(false);
  const [editingSessional, setEditingSessional] = useState<SessionalAssessmentRecord | null>(null);
  const [sessionalForm, setSessionalForm] = useState<Partial<SessionalAssessmentRecord>>({
    programId: '',
    programName: '',
    termLabel: 'Semester IV',
    subjectCode: '',
    subjectName: '',
    sessionalNumber: 'Sessional 1',
    examDate: new Date().toISOString().slice(0, 10),
    totalCandidates: 60,
    passPercentage: 90.0,
    averageMarksObtained: 22.0,
    maxMarks: 25,
    evaluator: '',
    status: 'Marks Uploaded',
  });

  // Program & Subject Modal
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AcademicProgramOffering | null>(null);
  const [programForm, setProgramForm] = useState<Partial<AcademicProgramOffering>>({
    programCode: '',
    programName: '',
    facultyCluster: 'Pharmacy',
    cycleMode: '6-Month Semester',
    totalTerms: 8,
    currentTermIndex: 1,
    termLabel: 'Semester I',
    academicSession: '2025-2026',
    subjects: [],
  });

  // New Subject Inserter inside Program
  const [newSubject, setNewSubject] = useState<Partial<SubjectModule>>({
    subjectCode: '',
    subjectName: '',
    credits: 4,
    type: 'Theory',
    maxTheoryMarks: 75,
    maxPracticalMarks: 0,
    maxSessionalMarks: 25,
  });

  // Filter sessionals
  const filteredSessionals = sessionals.filter((s) => {
    const matchesSearch =
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.programName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter programs
  const filteredPrograms = programs.filter((p) => {
    const matchesCycle = cycleFilter === 'All' || p.cycleMode === cycleFilter;
    const matchesSearch =
      p.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.programCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCycle && matchesSearch;
  });

  // Export Columns for Sessional Exams
  const sessionalColumns: ExportColumn<SessionalAssessmentRecord>[] = [
    { header: 'Program Name', accessor: 'programName' },
    { header: 'Term / Year', accessor: 'termLabel' },
    { header: 'Subject Code', accessor: 'subjectCode' },
    { header: 'Subject Title', accessor: 'subjectName' },
    { header: 'Assessment Type', accessor: 'sessionalNumber' },
    { header: 'Exam Date', accessor: 'examDate' },
    { header: 'Candidates', accessor: 'totalCandidates' },
    { header: 'Pass %', accessor: (s: any) => `${s.passPercentage}%` },
    { header: 'Avg Marks', accessor: (s: any) => `${s.averageMarksObtained} / ${s.maxMarks}` },
    { header: 'Evaluator', accessor: 'evaluator' },
    { header: 'Verification Status', accessor: 'status' },
  ];

  // Sessional Handlers
  const handleOpenAddSessional = () => {
    const defaultProg = programs[0];
    const defaultSub = defaultProg?.subjects[0];
    setEditingSessional(null);
    setSessionalForm({
      programId: defaultProg?.id || 'prog-01',
      programName: defaultProg?.programName || 'B.Pharm',
      termLabel: defaultProg?.termLabel || 'Semester IV',
      subjectCode: defaultSub?.subjectCode || 'BP401T',
      subjectName: defaultSub?.subjectName || 'Pharmaceutics',
      sessionalNumber: 'Sessional 1',
      examDate: new Date().toISOString().slice(0, 10),
      totalCandidates: 60,
      passPercentage: 92.5,
      averageMarksObtained: 21.0,
      maxMarks: 25,
      evaluator: 'Dr. Faculty In-Charge',
      status: 'Marks Uploaded',
    });
    setIsSessionalModalOpen(true);
  };

  const handleOpenEditSessional = (rec: SessionalAssessmentRecord) => {
    setEditingSessional(rec);
    setSessionalForm({ ...rec });
    setIsSessionalModalOpen(true);
  };

  const handleSaveSessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionalForm.subjectName || !sessionalForm.evaluator) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editingSessional) {
      const updated: SessionalAssessmentRecord = {
        ...(editingSessional as SessionalAssessmentRecord),
        ...sessionalForm,
        totalCandidates: Number(sessionalForm.totalCandidates) || 0,
        passPercentage: Number(sessionalForm.passPercentage) || 0,
        averageMarksObtained: Number(sessionalForm.averageMarksObtained) || 0,
        maxMarks: Number(sessionalForm.maxMarks) || 25,
      } as SessionalAssessmentRecord;
      onUpdateSessional(updated);
    } else {
      const newRec: SessionalAssessmentRecord = {
        id: `sess-${Date.now()}`,
        programId: sessionalForm.programId || 'prog-01',
        programName: sessionalForm.programName || 'Degree Program',
        termLabel: sessionalForm.termLabel || 'Term',
        subjectCode: sessionalForm.subjectCode || 'SUB101',
        subjectName: sessionalForm.subjectName || 'Course Title',
        sessionalNumber: (sessionalForm.sessionalNumber as any) || 'Sessional 1',
        examDate: sessionalForm.examDate || new Date().toISOString().slice(0, 10),
        totalCandidates: Number(sessionalForm.totalCandidates) || 0,
        passPercentage: Number(sessionalForm.passPercentage) || 0,
        averageMarksObtained: Number(sessionalForm.averageMarksObtained) || 0,
        maxMarks: Number(sessionalForm.maxMarks) || 25,
        evaluator: sessionalForm.evaluator || 'Evaluator',
        status: (sessionalForm.status as any) || 'Marks Uploaded',
      };
      onAddSessional(newRec);
    }
    setIsSessionalModalOpen(false);
  };

  // Program & Subject Handlers
  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      programCode: '',
      programName: '',
      facultyCluster: 'Pharmacy',
      cycleMode: '6-Month Semester',
      totalTerms: 8,
      currentTermIndex: 1,
      termLabel: 'Semester I',
      academicSession: '2025-2026',
      subjects: [],
    });
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog: AcademicProgramOffering) => {
    setEditingProgram(prog);
    setProgramForm({ ...prog, subjects: [...prog.subjects] });
    setIsProgramModalOpen(true);
  };

  const handleAddSubjectToProgram = () => {
    if (!newSubject.subjectCode || !newSubject.subjectName) {
      alert('Provide subject code and subject name.');
      return;
    }
    const createdSubject: SubjectModule = {
      id: `sub-${Date.now()}`,
      subjectCode: newSubject.subjectCode.toUpperCase(),
      subjectName: newSubject.subjectName,
      credits: Number(newSubject.credits) || 4,
      type: (newSubject.type as any) || 'Theory',
      maxTheoryMarks: Number(newSubject.maxTheoryMarks) || 75,
      maxPracticalMarks: Number(newSubject.maxPracticalMarks) || 0,
      maxSessionalMarks: Number(newSubject.maxSessionalMarks) || 25,
    };
    setProgramForm((prev) => ({
      ...prev,
      subjects: [...(prev.subjects || []), createdSubject],
    }));
    setNewSubject({
      subjectCode: '',
      subjectName: '',
      credits: 4,
      type: 'Theory',
      maxTheoryMarks: 75,
      maxPracticalMarks: 0,
      maxSessionalMarks: 25,
    });
  };

  const handleRemoveSubject = (subId: string) => {
    setProgramForm((prev) => ({
      ...prev,
      subjects: (prev.subjects || []).filter((s) => s.id !== subId),
    }));
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.programName || !programForm.programCode) {
      alert('Please enter program name and code.');
      return;
    }

    if (editingProgram) {
      const updated: AcademicProgramOffering = {
        ...(editingProgram as AcademicProgramOffering),
        ...programForm,
        totalTerms: Number(programForm.totalTerms) || 8,
        currentTermIndex: Number(programForm.currentTermIndex) || 1,
        subjects: programForm.subjects || [],
      } as AcademicProgramOffering;
      onUpdateProgram(updated);
    } else {
      const created: AcademicProgramOffering = {
        id: `prog-${Date.now()}`,
        programCode: programForm.programCode || 'PROG-01',
        programName: programForm.programName || 'Degree Program',
        facultyCluster: (programForm.facultyCluster as FacultyCluster) || 'Pharmacy',
        cycleMode: (programForm.cycleMode as AcademicCycleMode) || '6-Month Semester',
        totalTerms: Number(programForm.totalTerms) || 8,
        currentTermIndex: Number(programForm.currentTermIndex) || 1,
        termLabel: programForm.termLabel || 'Semester I',
        academicSession: programForm.academicSession || '2025-2026',
        subjects: programForm.subjects || [],
      };
      onAddProgram(created);
    }
    setIsProgramModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Examination &amp; Continuous Evaluation
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Semester &amp; Yearly Systems
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-2">
              Exam Administration, Program Curricula &amp; Sessional Management
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Supports both 6-month semester systems (B.Pharm, BMLT, B.Tech) and annual yearly frameworks (MBBS Phase I-IV, Pharm.D) with continuous internal assessment grading and Controller verification.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('Sessionals')}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                activeTab === 'Sessionals'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Sessional Exams &amp; Marks
            </button>
            <button
              onClick={() => setActiveTab('Programs')}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                activeTab === 'Programs'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Academic Programs &amp; Terms
            </button>
            <button
              onClick={() => setActiveTab('Subjects')}
              className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                activeTab === 'Subjects'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Subject &amp; Mark Distribution
            </button>
          </div>
        </div>
      </div>

      {/* Sessional Exams View */}
      {activeTab === 'Sessionals' && (
        <div className="space-y-4">
          <DataActionsBar<SessionalAssessmentRecord>
            title="Sessional Internal Examination Records"
            filename="Sessional_Exam_Records"
            data={filteredSessionals}
            columns={sessionalColumns}
            onImportData={onImportSessionals}
            onAddNew={handleOpenAddSessional}
            addLabel="Schedule / Enter Sessional"
            isAdminOrAuthorized={isAdminOrAuthorized}
          />

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject code, subject title, or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Subject &amp; Code</th>
                    <th className="py-3 px-4">Program &amp; Term</th>
                    <th className="py-3 px-4">Assessment Cycle</th>
                    <th className="py-3 px-4">Exam Date</th>
                    <th className="py-3 px-4">Candidates &amp; Pass %</th>
                    <th className="py-3 px-4">Average Score</th>
                    <th className="py-3 px-4">Evaluator</th>
                    <th className="py-3 px-4">Controller Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {filteredSessionals.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          {sess.subjectName}
                        </div>
                        <span className="font-mono text-[11px] text-sky-400">{sess.subjectCode}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{sess.programName}</div>
                        <span className="text-[10px] text-slate-400">{sess.termLabel}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {sess.sessionalNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{sess.examDate}</td>

                      <td className="py-3 px-4">
                        <div className="text-slate-100 font-semibold">{sess.totalCandidates} Enrolled</div>
                        <div className="text-[11px] text-emerald-400 font-medium">
                          {sess.passPercentage}% Passed
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">
                          {sess.averageMarksObtained}{' '}
                          <span className="text-[10px] font-normal text-slate-400">/ {sess.maxMarks} max</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">{sess.evaluator}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            sess.status === 'Controller Verified'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : sess.status === 'HOD Approved'
                              ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                              : sess.status === 'Marks Uploaded'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-slate-700 text-slate-300 border-slate-600'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {sess.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isAdminOrAuthorized ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditSessional(sess)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                              title="Edit Sessional Marks"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete sessional record for ${sess.subjectCode}?`)) {
                                  onDeleteSessional(sess.id);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                              title="Delete Sessional"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">Read-Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Programs and Terms View */}
      {activeTab === 'Programs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Academic Framework:</span>
              <button
                onClick={() => setCycleFilter('All')}
                className={`px-2.5 py-1 rounded text-xs cursor-pointer font-medium ${
                  cycleFilter === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                All Modes
              </button>
              <button
                onClick={() => setCycleFilter('6-Month Semester')}
                className={`px-2.5 py-1 rounded text-xs cursor-pointer font-medium ${
                  cycleFilter === '6-Month Semester' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                6-Month Semester System
              </button>
              <button
                onClick={() => setCycleFilter('Yearly Annual')}
                className={`px-2.5 py-1 rounded text-xs cursor-pointer font-medium ${
                  cycleFilter === 'Yearly Annual' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Yearly Annual Framework
              </button>
            </div>

            {isAdminOrAuthorized && (
              <button
                onClick={handleOpenAddProgram}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-md shadow-indigo-600/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add Academic Program Offering
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrograms.map((prog) => (
              <div
                key={prog.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      {prog.programCode}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        prog.cycleMode === '6-Month Semester'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {prog.cycleMode}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mt-2.5">{prog.programName}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Faculty: <span className="text-slate-300">{prog.facultyCluster}</span> • Session:{' '}
                    <span className="text-slate-300">{prog.academicSession}</span>
                  </div>

                  <div className="mt-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Current Active Term</span>
                      <span className="font-semibold text-slate-100">{prog.termLabel}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase">Total Curricular Terms</span>
                      <span className="font-semibold text-slate-100">
                        {prog.totalTerms} {prog.cycleMode === '6-Month Semester' ? 'Semesters' : 'Years'}
                      </span>
                    </div>
                  </div>

                  {/* Registered Subjects Preview */}
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between mb-1.5">
                      <span>Mapped Subjects</span>
                      <span className="text-indigo-400 font-mono">{prog.subjects.length} Course Modules</span>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {prog.subjects.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-slate-800/60 px-2 py-1 rounded text-[11px] flex items-center justify-between"
                        >
                          <span className="text-slate-200 truncate mr-2">
                            <span className="font-mono text-sky-400 mr-1">{sub.subjectCode}</span>
                            {sub.subjectName}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {sub.credits} Crd | Sess: {sub.maxSessionalMarks}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">ID: {prog.id}</span>
                  {isAdminOrAuthorized && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditProgram(prog)}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-sky-400" /> Edit Program / Subjects
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete program ${prog.programName}?`)) {
                            onDeleteProgram(prog.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjects View */}
      {activeTab === 'Subjects' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Comprehensive Curricular Subjects &amp; Mark Allocations
              </h3>
              <span className="text-xs text-slate-400">All Accredited Programs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Title</th>
                    <th className="py-3 px-4">Program Affiliation</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Theory Marks</th>
                    <th className="py-3 px-4">Practical Marks</th>
                    <th className="py-3 px-4">Sessional / Internal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {programs.flatMap((prog) =>
                    prog.subjects.map((sub) => (
                      <tr key={`${prog.id}-${sub.id}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-sky-400">{sub.subjectCode}</td>
                        <td className="py-3 px-4 font-medium text-slate-100">{sub.subjectName}</td>
                        <td className="py-3 px-4">
                          <span className="text-slate-200">{prog.programName}</span>
                          <span className="text-[10px] text-slate-400 block">{prog.termLabel}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {sub.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{sub.credits}</td>
                        <td className="py-3 px-4 font-mono">{sub.maxTheoryMarks}</td>
                        <td className="py-3 px-4 font-mono">{sub.maxPracticalMarks}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">{sub.maxSessionalMarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sessional Schedule / Edit Modal */}
      {isSessionalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingSessional ? 'Edit Sessional Exam' : 'Schedule / Record Sessional Exam'}
                </h3>
              </div>
              <button
                onClick={() => setIsSessionalModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSessional} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Academic Program</label>
                  <select
                    value={sessionalForm.programId}
                    onChange={(e) => {
                      const sel = programs.find((p) => p.id === e.target.value);
                      if (sel) {
                        setSessionalForm({
                          ...sessionalForm,
                          programId: sel.id,
                          programName: sel.programName,
                          termLabel: sel.termLabel,
                          subjectCode: sel.subjects[0]?.subjectCode || '',
                          subjectName: sel.subjects[0]?.subjectName || '',
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.programName} ({p.termLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Sessional Cycle</label>
                  <select
                    value={sessionalForm.sessionalNumber}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, sessionalNumber: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Sessional 1">Sessional 1</option>
                    <option value="Sessional 2">Sessional 2</option>
                    <option value="Sessional 3 / Improvement">Sessional 3 / Improvement</option>
                    <option value="Internal Practical Exam">Internal Practical Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={sessionalForm.subjectCode || ''}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, subjectCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. BP401T"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Subject Title</label>
                  <input
                    type="text"
                    required
                    value={sessionalForm.subjectName || ''}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, subjectName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Medicinal Chemistry I"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={sessionalForm.examDate || ''}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, examDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Faculty Evaluator</label>
                  <input
                    type="text"
                    required
                    value={sessionalForm.evaluator || ''}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, evaluator: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Dr. Preeti Nambiar"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Total Candidates</label>
                  <input
                    type="number"
                    min="1"
                    value={sessionalForm.totalCandidates || 60}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, totalCandidates: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Pass Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={sessionalForm.passPercentage || 90}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, passPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Average Marks Obtained</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={sessionalForm.averageMarksObtained || 20}
                    onChange={(e) =>
                      setSessionalForm({ ...sessionalForm, averageMarksObtained: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Maximum Marks</label>
                  <input
                    type="number"
                    min="10"
                    value={sessionalForm.maxMarks || 25}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Verification Status</label>
                  <select
                    value={sessionalForm.status}
                    onChange={(e) => setSessionalForm({ ...sessionalForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Draft Scheduled">Draft Scheduled</option>
                    <option value="Marks Uploaded">Marks Uploaded</option>
                    <option value="HOD Approved">HOD Approved</option>
                    <option value="Controller Verified">Controller Verified</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSessionalModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  {editingSessional ? 'Update Sessional' : 'Save Sessional Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program & Subject Inserter Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingProgram ? 'Edit Academic Program & Subjects' : 'Create Academic Program Offering'}
                </h3>
              </div>
              <button
                onClick={() => setIsProgramModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Program Code</label>
                  <input
                    type="text"
                    required
                    value={programForm.programCode || ''}
                    onChange={(e) => setProgramForm({ ...programForm, programCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. BPHARM-SEM4"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Program Name</label>
                  <input
                    type="text"
                    required
                    value={programForm.programName || ''}
                    onChange={(e) => setProgramForm({ ...programForm, programName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Bachelor of Pharmacy (B.Pharm)"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Faculty Cluster</label>
                  <select
                    value={programForm.facultyCluster}
                    onChange={(e) => setProgramForm({ ...programForm, facultyCluster: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Medical">Medical</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Paramedical">Paramedical</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Academic Cycle Framework</label>
                  <select
                    value={programForm.cycleMode}
                    onChange={(e) =>
                      setProgramForm({
                        ...programForm,
                        cycleMode: e.target.value as any,
                        termLabel: e.target.value === '6-Month Semester' ? 'Semester I' : 'Year I (Annual)',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="6-Month Semester">6-Month Semester System</option>
                    <option value="Yearly Annual">Yearly Annual Framework</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Total Terms in Degree</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={programForm.totalTerms || 8}
                    onChange={(e) => setProgramForm({ ...programForm, totalTerms: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Current Term Label</label>
                  <input
                    type="text"
                    required
                    value={programForm.termLabel || ''}
                    onChange={(e) => setProgramForm({ ...programForm, termLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Semester IV or Year II (Annual)"
                  />
                </div>
              </div>

              {/* Sub-form: Add Subject into Program */}
              <div className="border-t border-slate-800 pt-3">
                <div className="font-semibold text-sky-400 mb-2">Configure Subjects in this Term</div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-0.5 text-[10px]">Subject Code</label>
                      <input
                        type="text"
                        value={newSubject.subjectCode || ''}
                        onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                        placeholder="e.g. BP401T"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5 text-[10px]">Subject Name</label>
                      <input
                        type="text"
                        value={newSubject.subjectName || ''}
                        onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                        placeholder="e.g. Pharmaceutics II"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5 text-[10px]">Credits</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newSubject.credits || 4}
                        onChange={(e) => setNewSubject({ ...newSubject, credits: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-0.5 text-[10px]">Type</label>
                      <select
                        value={newSubject.type}
                        onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value as any })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                      >
                        <option value="Theory">Theory</option>
                        <option value="Practical / Lab">Practical / Lab</option>
                        <option value="Clinical Posting">Clinical Posting</option>
                        <option value="Project / Viva">Project / Viva</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5 text-[10px]">Max Theory Marks</label>
                      <input
                        type="number"
                        value={newSubject.maxTheoryMarks || 75}
                        onChange={(e) => setNewSubject({ ...newSubject, maxTheoryMarks: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5 text-[10px]">Max Practical Marks</label>
                      <input
                        type="number"
                        value={newSubject.maxPracticalMarks || 0}
                        onChange={(e) => setNewSubject({ ...newSubject, maxPracticalMarks: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-0.5 text-[10px]">Max Sessional</label>
                      <input
                        type="number"
                        value={newSubject.maxSessionalMarks || 25}
                        onChange={(e) => setNewSubject({ ...newSubject, maxSessionalMarks: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSubjectToProgram}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    + Add Subject To Term
                  </button>
                </div>

                {/* List of current subjects in program */}
                <div className="mt-3 space-y-1">
                  {(programForm.subjects || []).map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-sky-400 font-bold mr-2">{sub.subjectCode}</span>
                        <span className="text-slate-100">{sub.subjectName}</span>
                        <span className="text-slate-400 text-[10px] ml-2">
                          ({sub.type} • {sub.credits} Credits • Sessional: {sub.maxSessionalMarks}m)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold cursor-pointer shadow-md shadow-sky-600/30"
                >
                  {editingProgram ? 'Save Program' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
