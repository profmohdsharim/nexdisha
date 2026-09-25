import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  Award,
  Clock,
  Plus,
  Eye,
  FileText,
  BadgeAlert,
  ArrowUpDown,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { StudentRecord, FacultyCluster } from '../types';

interface StudentsDirectoryViewProps {
  students: StudentRecord[];
  facultyFilter: FacultyCluster | 'All';
  onSelectStudentForFee?: (studentId: string) => void;
  onSelectStudentForResult?: (studentId: string) => void;
  onAddNewStudent?: (student: StudentRecord) => void;
}

export const StudentsDirectoryView: React.FC<StudentsDirectoryViewProps> = ({
  students,
  facultyFilter,
  onSelectStudentForFee,
  onSelectStudentForResult,
  onAddNewStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState<string>('All');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for new student
  const [newStudentForm, setNewStudentForm] = useState<Partial<StudentRecord>>({
    fullName: '',
    enrollmentNo: '',
    rollNo: '',
    programName: 'Bachelor of Pharmacy (B.Pharm)',
    department: 'Pharmaceutics & Regulatory Affairs',
    facultyCluster: 'Pharmacy',
    currentYearOrSemester: 'Semester I',
    admissionBatch: '2025-2029',
    contactEmail: '',
    contactPhone: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    gender: 'Male',
    academicStatus: 'Active',
    categoryQuota: 'General',
    attendancePercentage: 85,
    overallCGPA: 8.0,
    feeStatus: 'Pending',
  });

  const filteredStudents = students.filter((std) => {
    const matchesFaculty =
      facultyFilter === 'All' || std.facultyCluster === facultyFilter;
    const matchesSearch =
      std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.programName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'All' || std.academicStatus === selectedStatus;
    const matchesFee =
      selectedFeeStatus === 'All' || std.feeStatus === selectedFeeStatus;

    return matchesFaculty && matchesSearch && matchesStatus && matchesFee;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.fullName || !newStudentForm.enrollmentNo) return;

    const record: StudentRecord = {
      id: `std-${Date.now()}`,
      enrollmentNo: newStudentForm.enrollmentNo || `ENR-${Date.now()}`,
      rollNo: newStudentForm.rollNo || `R-${Date.now()}`,
      fullName: newStudentForm.fullName || '',
      gender: (newStudentForm.gender as any) || 'Male',
      dateOfBirth: newStudentForm.dateOfBirth || '2004-01-01',
      contactEmail: newStudentForm.contactEmail || '',
      contactPhone: newStudentForm.contactPhone || '',
      guardianName: newStudentForm.guardianName || '',
      guardianPhone: newStudentForm.guardianPhone || '',
      address: newStudentForm.address || '',
      facultyCluster: (newStudentForm.facultyCluster as any) || 'Pharmacy',
      department: newStudentForm.department || '',
      programName: newStudentForm.programName || '',
      currentYearOrSemester: newStudentForm.currentYearOrSemester || 'Semester I',
      admissionBatch: newStudentForm.admissionBatch || '2025-2029',
      academicStatus: (newStudentForm.academicStatus as any) || 'Active',
      attendancePercentage: Number(newStudentForm.attendancePercentage) || 85,
      overallCGPA: Number(newStudentForm.overallCGPA) || 8.0,
      categoryQuota: (newStudentForm.categoryQuota as any) || 'General',
      feeStatus: (newStudentForm.feeStatus as any) || 'Pending',
    };

    if (onAddNewStudent) {
      onAddNewStudent(record);
    }
    setIsAddModalOpen(false);
  };

  const getFeeBadge = (status: StudentRecord['feeStatus']) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Partial
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Student Enrollment & Dossier Management
                </h2>
                <p className="text-sm text-slate-400">
                  Comprehensive student biodata, attendance records, academic standing, and fee clearance status
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Total Enrolled</p>
            <p className="text-2xl font-bold text-white mt-1">{students.length}</p>
            <span className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
              <UserCheck className="w-3 h-3" /> 100% Verified Dossiers
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Fee Defaulters / Overdue</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">
              {students.filter((s) => s.feeStatus === 'Overdue').length}
            </p>
            <span className="text-xs text-rose-400/80 flex items-center gap-1 mt-0.5">
              <BadgeAlert className="w-3 h-3" /> Late Fee Accruing
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Average Institutional CGPA</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {(
                students.reduce((acc, s) => acc + s.overallCGPA, 0) / (students.length || 1)
              ).toFixed(2)}
            </p>
            <span className="text-xs text-emerald-400/80 flex items-center gap-1 mt-0.5">
              <Award className="w-3 h-3" /> Grade 10 Scale
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400">Average Attendance</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">
              {(
                students.reduce((acc, s) => acc + s.attendancePercentage, 0) / (students.length || 1)
              ).toFixed(1)}
              %
            </p>
            <span className="text-xs text-cyan-400/80 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> &gt;75% NAAC Threshold
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, enrollment no, roll no..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Academic Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Detained">Detained</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>

          <select
            value={selectedFeeStatus}
            onChange={(e) => setSelectedFeeStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Fee Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Student & Enrollment</th>
                <th className="py-3.5 px-4 font-semibold">Program / Term</th>
                <th className="py-3.5 px-4 font-semibold">Attendance</th>
                <th className="py-3.5 px-4 font-semibold">CGPA</th>
                <th className="py-3.5 px-4 font-semibold">Fee Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No student records found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr
                    key={std.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => setSelectedStudentDetail(std)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                          {std.fullName
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-blue-400 transition">
                            {std.fullName}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>{std.enrollmentNo}</span>
                            <span>•</span>
                            <span className="text-slate-500">{std.rollNo}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{std.programName}</div>
                      <div className="text-xs text-slate-400">
                        {std.currentYearOrSemester} ({std.admissionBatch})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              std.attendancePercentage >= 85
                                ? 'bg-emerald-500'
                                : std.attendancePercentage >= 75
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${std.attendancePercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-300">
                          {std.attendancePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-100 bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-700/60 text-xs">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        {std.overallCGPA.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getFeeBadge(std.feeStatus)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedStudentDetail(std)}
                          title="View Dossier"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onSelectStudentForFee && (
                          <button
                            onClick={() => onSelectStudentForFee(std.id)}
                            title="Manage Fees & Collect"
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                        {onSelectStudentForResult && (
                          <button
                            onClick={() => onSelectStudentForResult(std.id)}
                            title="View Grade Sheet"
                            className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Dossier Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl">
                  {selectedStudentDetail.fullName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedStudentDetail.fullName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {selectedStudentDetail.enrollmentNo}
                    </span>
                    <span>•</span>
                    <span>Roll: {selectedStudentDetail.rollNo}</span>
                    <span>•</span>
                    <span className="text-blue-400">{selectedStudentDetail.facultyCluster}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Academic Placement
                </p>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {selectedStudentDetail.programName}
                  </p>
                  <p className="text-xs text-slate-400">{selectedStudentDetail.department}</p>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400">Term:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedStudentDetail.currentYearOrSemester}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Admission Batch:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedStudentDetail.admissionBatch}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Reservation / Quota:</span>
                  <span className="font-semibold text-cyan-400">
                    {selectedStudentDetail.categoryQuota}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Performance & Clearance
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cumulative GPA:</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {selectedStudentDetail.overallCGPA.toFixed(2)} / 10.0
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Classroom & Lab Attendance:</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedStudentDetail.attendancePercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Fee Status:</span>
                  <span>{getFeeBadge(selectedStudentDetail.feeStatus)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Enrollment Standing:</span>
                  <span className="font-semibold text-blue-400">
                    {selectedStudentDetail.academicStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contact & Guardian Information
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Student Email:</span>
                  <p className="text-slate-300 font-mono mt-0.5">{selectedStudentDetail.contactEmail}</p>
                </div>
                <div>
                  <span className="text-slate-500">Student Mobile:</span>
                  <p className="text-slate-300 font-mono mt-0.5">{selectedStudentDetail.contactPhone}</p>
                </div>
                <div>
                  <span className="text-slate-500">Parent / Guardian:</span>
                  <p className="text-slate-300 mt-0.5">{selectedStudentDetail.guardianName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Guardian Contact:</span>
                  <p className="text-slate-300 font-mono mt-0.5">{selectedStudentDetail.guardianPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500">Residential Address:</span>
                  <p className="text-slate-300 mt-0.5">{selectedStudentDetail.address}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              {onSelectStudentForFee && (
                <button
                  onClick={() => {
                    onSelectStudentForFee(selectedStudentDetail.id);
                    setSelectedStudentDetail(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Manage Fee Account
                </button>
              )}
              {onSelectStudentForResult && (
                <button
                  onClick={() => {
                    onSelectStudentForResult(selectedStudentDetail.id);
                    setSelectedStudentDetail(null);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  View Grade Card
                </button>
              )}
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Enroll New Student</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.fullName}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, fullName: e.target.value })
                    }
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Enrollment Number *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.enrollmentNo}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, enrollmentNo: e.target.value })
                    }
                    placeholder="e.g. ENR-2025-PH055"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={newStudentForm.rollNo}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, rollNo: e.target.value })
                    }
                    placeholder="e.g. BPH-25055"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Faculty Cluster</label>
                  <select
                    value={newStudentForm.facultyCluster}
                    onChange={(e) =>
                      setNewStudentForm({
                        ...newStudentForm,
                        facultyCluster: e.target.value as FacultyCluster,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Medical">Medical</option>
                    <option value="Paramedical">Paramedical</option>
                    <option value="Engineering">Engineering & Technology</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Arts">Arts & Humanities</option>
                    <option value="Commerce">Commerce & Management</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-300 font-medium block mb-1">Program Name</label>
                  <input
                    type="text"
                    value={newStudentForm.programName}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, programName: e.target.value })
                    }
                    placeholder="e.g. Bachelor of Pharmacy (B.Pharm)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Current Term</label>
                  <input
                    type="text"
                    value={newStudentForm.currentYearOrSemester}
                    onChange={(e) =>
                      setNewStudentForm({
                        ...newStudentForm,
                        currentYearOrSemester: e.target.value,
                      })
                    }
                    placeholder="e.g. Semester I"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Admission Batch</label>
                  <input
                    type="text"
                    value={newStudentForm.admissionBatch}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, admissionBatch: e.target.value })
                    }
                    placeholder="e.g. 2025-2029"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newStudentForm.contactEmail}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, contactEmail: e.target.value })
                    }
                    placeholder="student@pharmmed.edu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={newStudentForm.contactPhone}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, contactPhone: e.target.value })
                    }
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                  Enroll Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
