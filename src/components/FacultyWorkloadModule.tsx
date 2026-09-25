import React, { useState } from 'react';
import {
  Users,
  Award,
  BookOpen,
  Calendar,
  Search,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Briefcase,
  HelpCircle,
  BarChart3,
  Edit2,
  Trash2,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { FacultyWorkloadRecord, FacultyCluster } from '../types';
import { DataActionsBar } from './DataActionsBar';
import { ExportColumn } from '../utils/exportEngine';

interface FacultyWorkloadModuleProps {
  workloads: FacultyWorkloadRecord[];
  onAddWorkload: (record: FacultyWorkloadRecord) => void;
  onUpdateWorkload: (record: FacultyWorkloadRecord) => void;
  onDeleteWorkload: (id: string) => void;
  onImportWorkloads: (records: FacultyWorkloadRecord[]) => void;
  isAdminOrAuthorized?: boolean;
}

export const FacultyWorkloadModule: React.FC<FacultyWorkloadModuleProps> = ({
  workloads,
  onAddWorkload,
  onUpdateWorkload,
  onDeleteWorkload,
  onImportWorkloads,
  isAdminOrAuthorized = true,
}) => {
  const [facultyFilter, setFacultyFilter] = useState<string>('All');
  const [designationFilter, setDesignationFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRecord, setEditingRecord] = useState<FacultyWorkloadRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<FacultyWorkloadRecord>>({
    facultyName: '',
    designation: 'Assistant Professor',
    facultyCluster: 'Pharmacy',
    department: '',
    teachingHoursPerWeek: 16,
    prescribedHoursNorm: 16,
    labPracticalHours: 6,
    clinicalWardHours: 0,
    mentoringHours: 4,
    administrativeHours: 2,
    scopusWosPapers: 3,
    patentsGrantedOrFiled: 0,
    fundedGrantAmountLakhs: 5.0,
    phdScholarsGuided: 0,
    naacComplianceStatus: 'Optimal (Compliant)',
    complianceScore: 90,
  });

  const filteredWorkloads = workloads.filter((w) => {
    const matchesFac = facultyFilter === 'All' || w.facultyCluster === facultyFilter;
    const matchesDes = designationFilter === 'All' || w.designation === designationFilter;
    const matchesSearch =
      w.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFac && matchesDes && matchesSearch;
  });

  // Calculate NAAC/NBA benchmark metrics
  const totalFacultyCount = workloads.length;
  const avgTeachingHours = (
    workloads.reduce((acc, curr) => acc + curr.teachingHoursPerWeek, 0) / (totalFacultyCount || 1)
  ).toFixed(1);
  const totalPublications = workloads.reduce((acc, curr) => acc + curr.scopusWosPapers, 0);
  const avgPubPerFaculty = (totalPublications / (totalFacultyCount || 1)).toFixed(2);
  const totalGrants = workloads.reduce((acc, curr) => acc + curr.fundedGrantAmountLakhs, 0).toFixed(1);
  const compliantFacultyCount = workloads.filter((w) => w.naacComplianceStatus === 'Optimal (Compliant)').length;
  const complianceRate = Math.round((compliantFacultyCount / (totalFacultyCount || 1)) * 100);

  const exportColumns: ExportColumn<FacultyWorkloadRecord>[] = [
    { header: 'Faculty Name', accessor: 'facultyName' },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Faculty Cluster', accessor: 'facultyCluster' },
    { header: 'Department', accessor: 'department' },
    { header: 'Teaching Hours / Wk', accessor: 'teachingHoursPerWeek' },
    { header: 'Norm Hours (NAAC/AICTE)', accessor: 'prescribedHoursNorm' },
    { header: 'Lab / Practical Hrs', accessor: 'labPracticalHours' },
    { header: 'Clinical Ward Hrs', accessor: 'clinicalWardHours' },
    { header: 'Scopus / WoS Papers', accessor: 'scopusWosPapers' },
    { header: 'Patents', accessor: 'patentsGrantedOrFiled' },
    { header: 'Grants (₹ Lakhs)', accessor: 'fundedGrantAmountLakhs' },
    { header: 'Compliance Status', accessor: 'naacComplianceStatus' },
    { header: 'Compliance Score', accessor: (w: any) => `${w.complianceScore}%` },
  ];

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      facultyName: '',
      designation: 'Assistant Professor',
      facultyCluster: 'Pharmacy',
      department: 'Pharmaceutics',
      teachingHoursPerWeek: 16,
      prescribedHoursNorm: 16,
      labPracticalHours: 6,
      clinicalWardHours: 0,
      mentoringHours: 4,
      administrativeHours: 2,
      scopusWosPapers: 4,
      patentsGrantedOrFiled: 0,
      fundedGrantAmountLakhs: 5.0,
      phdScholarsGuided: 0,
      naacComplianceStatus: 'Optimal (Compliant)',
      complianceScore: 90,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: FacultyWorkloadRecord) => {
    setEditingRecord(rec);
    setFormData({ ...rec });
    setIsModalOpen(true);
  };

  const calculateCompliance = (
    teaching: number,
    norm: number,
    papers: number
  ): { status: FacultyWorkloadRecord['naacComplianceStatus']; score: number } => {
    let score = 90;
    let status: FacultyWorkloadRecord['naacComplianceStatus'] = 'Optimal (Compliant)';

    if (teaching > norm + 2) {
      status = 'Overloaded';
      score = Math.max(60, 90 - (teaching - norm) * 5);
    } else if (teaching < norm - 4) {
      status = 'Underutilized';
      score = Math.max(55, 90 - (norm - teaching) * 5);
    } else if (papers < 1) {
      status = 'Research Deficit';
      score = 75;
    } else {
      score = Math.min(99, 88 + papers * 2);
    }

    return { status, score };
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.facultyName || !formData.department) {
      alert('Please fill out faculty name and department.');
      return;
    }

    const { status, score } = calculateCompliance(
      Number(formData.teachingHoursPerWeek) || 14,
      Number(formData.prescribedHoursNorm) || 14,
      Number(formData.scopusWosPapers) || 0
    );

    if (editingRecord) {
      const updated: FacultyWorkloadRecord = {
        ...(editingRecord as FacultyWorkloadRecord),
        ...formData,
        teachingHoursPerWeek: Number(formData.teachingHoursPerWeek) || 14,
        prescribedHoursNorm: Number(formData.prescribedHoursNorm) || 14,
        labPracticalHours: Number(formData.labPracticalHours) || 0,
        clinicalWardHours: Number(formData.clinicalWardHours) || 0,
        mentoringHours: Number(formData.mentoringHours) || 0,
        administrativeHours: Number(formData.administrativeHours) || 0,
        scopusWosPapers: Number(formData.scopusWosPapers) || 0,
        patentsGrantedOrFiled: Number(formData.patentsGrantedOrFiled) || 0,
        fundedGrantAmountLakhs: Number(formData.fundedGrantAmountLakhs) || 0,
        phdScholarsGuided: Number(formData.phdScholarsGuided) || 0,
        naacComplianceStatus: status,
        complianceScore: score,
      } as FacultyWorkloadRecord;
      onUpdateWorkload(updated);
    } else {
      const newRec: FacultyWorkloadRecord = {
        id: `fw-${Date.now()}`,
        facultyName: formData.facultyName || 'New Faculty',
        designation: (formData.designation as any) || 'Assistant Professor',
        facultyCluster: (formData.facultyCluster as FacultyCluster) || 'Pharmacy',
        department: formData.department || 'General',
        teachingHoursPerWeek: Number(formData.teachingHoursPerWeek) || 14,
        prescribedHoursNorm: Number(formData.prescribedHoursNorm) || 14,
        labPracticalHours: Number(formData.labPracticalHours) || 0,
        clinicalWardHours: Number(formData.clinicalWardHours) || 0,
        mentoringHours: Number(formData.mentoringHours) || 0,
        administrativeHours: Number(formData.administrativeHours) || 0,
        scopusWosPapers: Number(formData.scopusWosPapers) || 0,
        patentsGrantedOrFiled: Number(formData.patentsGrantedOrFiled) || 0,
        fundedGrantAmountLakhs: Number(formData.fundedGrantAmountLakhs) || 0,
        phdScholarsGuided: Number(formData.phdScholarsGuided) || 0,
        naacComplianceStatus: status,
        complianceScore: score,
      };
      onAddWorkload(newRec);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top NAAC & NBA Workload Norms KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Avg Teaching Load
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {avgTeachingHours} <span className="text-xs font-normal text-slate-400">Hrs/Wk</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> NAAC / UGC Norm (12-16h)
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Research Pubs (WoS/Scopus)
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {totalPublications} <span className="text-xs font-normal text-slate-400">({avgPubPerFaculty}/Fac)</span>
            </div>
            <div className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> NBA Criterion 5 Met
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              External Grants Mobilized
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              ₹{totalGrants} <span className="text-xs font-normal text-slate-400">Lakhs</span>
            </div>
            <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
              <span>DST, ICMR, AICTE, DBT</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workload Compliance
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {complianceRate}%
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {compliantFacultyCount}/{totalFacultyCount} Within Norms
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Toolbar with Universal Export & Import */}
      <DataActionsBar<FacultyWorkloadRecord>
        title="Faculty Workload & Research Output (NAAC & NBA Matrix)"
        filename="Faculty_Workload_NAAC_NBA"
        data={filteredWorkloads}
        columns={exportColumns}
        onImportData={onImportWorkloads}
        onAddNew={handleOpenAdd}
        addLabel="Add Faculty Workload"
        isAdminOrAuthorized={isAdminOrAuthorized}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty name, department, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Faculties</option>
            <option value="Medical">Medical</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Paramedical">Paramedical</option>
            <option value="Engineering">Engineering</option>
            <option value="Sciences">Sciences</option>
            <option value="Arts">Arts</option>
            <option value="Commerce">Commerce</option>
          </select>

          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Designations</option>
            <option value="Professor">Professor (12-14h norm)</option>
            <option value="Associate Professor">Associate Professor (14h norm)</option>
            <option value="Assistant Professor">Assistant Professor (16h norm)</option>
            <option value="Clinical Instructor">Clinical Instructor</option>
            <option value="Lab Demonstrator">Lab Demonstrator</option>
          </select>
        </div>
      </div>

      {/* Visual Workload Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Faculty &amp; Dept</th>
                <th className="py-3 px-4">Weekly Teaching Load</th>
                <th className="py-3 px-4">Lab / Clinical Postings</th>
                <th className="py-3 px-4">Research &amp; Patents</th>
                <th className="py-3 px-4">Grants (₹ L)</th>
                <th className="py-3 px-4">NAAC / NBA Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredWorkloads.map((rec) => {
                const totalCommitment =
                  rec.teachingHoursPerWeek +
                  rec.labPracticalHours +
                  rec.clinicalWardHours +
                  rec.administrativeHours +
                  rec.mentoringHours;
                const percentOfNorm = Math.round((rec.teachingHoursPerWeek / (rec.prescribedHoursNorm || 14)) * 100);

                return (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        {rec.facultyName}
                      </div>
                      <span className="text-[11px] text-slate-400">{rec.designation}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{rec.department}</div>
                      <span className="text-[10px] text-sky-400 font-mono">{rec.facultyCluster}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{rec.teachingHoursPerWeek} hrs</span>
                        <span className="text-[10px] text-slate-400">/ norm {rec.prescribedHoursNorm}h</span>
                      </div>
                      {/* Visual Load Bar */}
                      <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full ${
                            percentOfNorm > 115
                              ? 'bg-rose-500'
                              : percentOfNorm < 85
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percentOfNorm)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Total workload: <span className="font-mono text-slate-300">{totalCommitment}h/wk</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200">
                        Practical: <span className="font-semibold">{rec.labPracticalHours}h</span>
                      </div>
                      {rec.clinicalWardHours > 0 && (
                        <div className="text-emerald-400 text-[11px]">
                          Clinical Wards: <span className="font-semibold">{rec.clinicalWardHours}h</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{rec.scopusWosPapers} Indexed Papers</div>
                      <div className="text-[10px] text-slate-400">
                        {rec.patentsGrantedOrFiled} Patents • {rec.phdScholarsGuided} PhDs
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-amber-400">
                        ₹{rec.fundedGrantAmountLakhs.toFixed(1)}L
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          rec.naacComplianceStatus === 'Optimal (Compliant)'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : rec.naacComplianceStatus === 'Overloaded'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : rec.naacComplianceStatus === 'Underutilized'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {rec.naacComplianceStatus}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">Score: {rec.complianceScore}%</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isAdminOrAuthorized ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition cursor-pointer"
                            title="Edit Workload & Research Records"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove workload record for ${rec.facultyName}?`)) {
                                onDeleteWorkload(rec.id);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">Read-Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Workload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100">
                  {editingRecord ? 'Edit Faculty Workload & Research' : 'Add Faculty Workload Record'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Faculty Member Name</label>
                  <input
                    type="text"
                    required
                    value={formData.facultyName || ''}
                    onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Dr. Sharim Siddiqui"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designation: e.target.value as any,
                        prescribedHoursNorm:
                          e.target.value === 'Professor' ? 14 : e.target.value === 'Associate Professor' ? 14 : 16,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Professor">Professor (12-14h Norm)</option>
                    <option value="Associate Professor">Associate Professor (14h Norm)</option>
                    <option value="Assistant Professor">Assistant Professor (16h Norm)</option>
                    <option value="Clinical Instructor">Clinical Instructor</option>
                    <option value="Lab Demonstrator">Lab Demonstrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Faculty Cluster</label>
                  <select
                    value={formData.facultyCluster}
                    onChange={(e) => setFormData({ ...formData, facultyCluster: e.target.value as any })}
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
                  <label className="block text-slate-400 mb-1 font-medium">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Pharmaceutics &amp; Formulation Lab"
                  />
                </div>
              </div>

              {/* Workload Hours Grid */}
              <div className="border-t border-slate-800 pt-3">
                <div className="font-semibold text-sky-400 mb-2">Teaching &amp; Practical Hour Distribution (Weekly)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Lecture Theory (Hrs)</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={formData.teachingHoursPerWeek || 0}
                      onChange={(e) => setFormData({ ...formData, teachingHoursPerWeek: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Prescribed Norm (Hrs)</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={formData.prescribedHoursNorm || 14}
                      onChange={(e) => setFormData({ ...formData, prescribedHoursNorm: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Lab / Practical (Hrs)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formData.labPracticalHours || 0}
                      onChange={(e) => setFormData({ ...formData, labPracticalHours: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Clinical Ward (Hrs)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formData.clinicalWardHours || 0}
                      onChange={(e) => setFormData({ ...formData, clinicalWardHours: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Research & Grants Grid */}
              <div className="border-t border-slate-800 pt-3">
                <div className="font-semibold text-emerald-400 mb-2">Research Output &amp; Grants (NBA / NAAC)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Scopus/WoS Papers</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.scopusWosPapers || 0}
                      onChange={(e) => setFormData({ ...formData, scopusWosPapers: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Patents Filed/Granted</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.patentsGrantedOrFiled || 0}
                      onChange={(e) => setFormData({ ...formData, patentsGrantedOrFiled: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Funded Grants (₹ Lakhs)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.fundedGrantAmountLakhs || 0}
                      onChange={(e) => setFormData({ ...formData, fundedGrantAmountLakhs: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">PhD Scholars Guided</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.phdScholarsGuided || 0}
                      onChange={(e) => setFormData({ ...formData, phdScholarsGuided: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold cursor-pointer shadow-md shadow-sky-600/30"
                >
                  {editingRecord ? 'Save Changes' : 'Add Faculty Workload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
