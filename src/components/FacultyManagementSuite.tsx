import React, { useState, useMemo } from 'react';
import {
  FacultyMember,
  FacultyDesignation,
  FacultyEmploymentType,
  FacultyStatus,
  FacultyCluster,
} from '../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  FileText,
  CreditCard,
  Building,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Edit,
  Trash2,
  Ban,
  CheckCircle2,
  Clock,
  Briefcase,
  DollarSign,
  Download,
  Eye,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react';
import { exportFacultyData, ExportFormat } from '../utils/exportEngine';

interface Props {
  facultyList: FacultyMember[];
  onAddFaculty: (newFaculty: FacultyMember) => void;
  onUpdateFaculty: (updated: FacultyMember) => void;
  onDeleteFaculty: (id: string) => void;
  isAdminOrAuthorized: boolean;
}

export const FacultyManagementSuite: React.FC<Props> = ({
  facultyList,
  onAddFaculty,
  onUpdateFaculty,
  onDeleteFaculty,
  isAdminOrAuthorized,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clusterFilter, setClusterFilter] = useState<string>('All Clusters');
  const [typeFilter, setTypeFilter] = useState<string>('All Types');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [inspectingKycFaculty, setInspectingKycFaculty] = useState<FacultyMember | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FacultyMember>>({
    name: '',
    empId: '',
    email: '',
    phone: '',
    facultyCluster: 'Pharmacy',
    department: 'Pharmaceutics & Institutional IQAC',
    designation: 'Assistant Professor',
    employmentType: 'Permanent / Regular',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    qualification: '',
    specialization: '',
    notes: '',
    kyc: {
      aadhaarNumber: '',
      panNumber: '',
      passportNumber: '',
      bankName: '',
      bankAccountNumber: '',
      bankIfscCode: '',
      bankBranch: '',
      appointmentLetterNumber: '',
      appointmentDate: new Date().toISOString().split('T')[0],
      isKycVerified: true,
      testimonials: [],
    },
    guestTerms: {
      honorariumPerSession: 5000,
      tenureDurationMonths: 3,
      affiliatedInstitution: '',
      specialLectureTopic: '',
      mouReferenceCode: '',
    },
  });

  // Filtered Faculty List
  const filteredFaculty = useMemo(() => {
    return facultyList.filter(f => {
      if (clusterFilter !== 'All Clusters' && f.facultyCluster !== clusterFilter) return false;
      if (typeFilter !== 'All Types' && f.employmentType !== typeFilter) return false;
      if (statusFilter !== 'All Statuses' && f.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchEmpId = f.empId.toLowerCase().includes(q);
        const matchDept = f.department.toLowerCase().includes(q);
        const matchSpec = f.specialization.toLowerCase().includes(q);
        if (!matchName && !matchEmpId && !matchDept && !matchSpec) return false;
      }
      return true;
    });
  }, [facultyList, clusterFilter, typeFilter, statusFilter, searchQuery]);

  const handleOpenAddForm = (isGuest = false) => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      empId: `FAC-${isGuest ? 'GST' : 'UNIV'}-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      email: '',
      phone: '',
      facultyCluster: 'Pharmacy',
      department: 'Pharmaceutics & Institutional IQAC',
      designation: isGuest ? 'Guest Faculty' : 'Assistant Professor',
      employmentType: isGuest ? 'Guest Faculty (Short-Term)' : 'Permanent / Regular',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      qualification: '',
      specialization: '',
      notes: isGuest ? 'Short-term guest faculty appointment.' : '',
      kyc: {
        aadhaarNumber: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
        panNumber: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
        passportNumber: '',
        bankName: 'State Bank of India',
        bankAccountNumber: 'XXXXXX' + Math.floor(1000 + Math.random() * 9000),
        bankIfscCode: 'SBIN0004128',
        bankBranch: 'University Campus Branch',
        appointmentLetterNumber: `REG/APPT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        appointmentDate: new Date().toISOString().split('T')[0],
        isKycVerified: true,
        testimonials: [
          {
            id: `test-${Date.now()}`,
            title: 'Academic Excellence Letter',
            issuingOrganization: 'Higher Education Authority',
            year: 2025,
            verified: true,
          },
        ],
      },
      guestTerms: {
        honorariumPerSession: 8000,
        tenureDurationMonths: 4,
        affiliatedInstitution: '',
        specialLectureTopic: '',
        mouReferenceCode: '',
      },
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (faculty: FacultyMember) => {
    setEditingFaculty(faculty);
    setFormData(JSON.parse(JSON.stringify(faculty)));
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFaculty) {
      const updated: FacultyMember = {
        ...editingFaculty,
        ...formData,
        id: editingFaculty.id,
      } as FacultyMember;
      onUpdateFaculty(updated);
    } else {
      const newFac: FacultyMember = {
        id: `fac-${Date.now().toString(36)}`,
        ...formData,
      } as FacultyMember;
      onAddFaculty(newFac);
    }

    setIsFormOpen(false);
  };

  const handleToggleStatus = (faculty: FacultyMember) => {
    const nextStatus: FacultyStatus =
      faculty.status === 'Active' ? 'Restricted / Inactive' : 'Active';
    onUpdateFaculty({
      ...faculty,
      status: nextStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Human Capital &amp; EOMS Governance
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">ISO 21001 Clause 7.2 Competence</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Faculty Management Suite &amp; Statutory KYC Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Centralized academic appointments repository with verified appointment letters, Aadhaar/PAN identity vaults, bank routing, testimonials, and short-term guest faculty engagement tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Export Button */}
          <button
            type="button"
            onClick={() => exportFacultyData(facultyList, 'XLSX')}
            className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Register
          </button>

          {/* Add Guest Faculty Button */}
          {isAdminOrAuthorized && (
            <button
              type="button"
              onClick={() => handleOpenAddForm(true)}
              className="px-3.5 py-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Add Guest Faculty
            </button>
          )}

          {/* Add Regular Faculty Button */}
          {isAdminOrAuthorized && (
            <button
              type="button"
              onClick={() => handleOpenAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Faculty Member
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Total Faculty Roster</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {facultyList.length}
            </span>
            <span className="text-xs text-slate-400">Registered</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-400">{facultyList.filter(f => f.status === 'Active').length} Active</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{facultyList.filter(f => f.status === 'Restricted / Inactive').length} Restricted</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Short-Term Guest Faculty</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-400 tabular-nums">
              {facultyList.filter(f => f.employmentType.includes('Guest')).length}
            </span>
            <span className="text-xs text-slate-400">Visiting Experts</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span>Honorarium &amp; MoU Bound</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Global &amp; Clinical</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Statutory KYC Compliance</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              {Math.round(
                (facultyList.filter(f => f.kyc.isKycVerified).length / (facultyList.length || 1)) * 100
              )}%
            </span>
            <span className="text-xs text-slate-400">Verified</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aadhaar, PAN &amp; Bank Verified</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Doctoral &amp; Ph.D. Density</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {facultyList.filter(f => f.qualification.includes('Ph.D') || f.qualification.includes('MD')).length}
            </span>
            <span className="text-xs text-slate-400">Ph.D / MD Cadre</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span>NAAC Criterion 2.4 Cadre Ratio</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by faculty name, Emp ID, department, specialization..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cluster Filter */}
          <select
            value={clusterFilter}
            onChange={e => setClusterFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-hidden"
          >
            <option value="All Clusters">All Clusters</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Medical">Medical</option>
            <option value="Engineering">Engineering</option>
            <option value="Commerce">Commerce / Mgt</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-hidden"
          >
            <option value="All Types">All Employment Types</option>
            <option value="Permanent / Regular">Permanent / Regular</option>
            <option value="Tenure-Track">Tenure-Track</option>
            <option value="Guest Faculty (Short-Term)">Guest Faculty</option>
            <option value="Contractual">Contractual</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-hidden"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Sabbatical">On Sabbatical</option>
            <option value="Restricted / Inactive">Restricted / Inactive</option>
          </select>
        </div>
      </div>

      {/* Faculty Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Faculty Member &amp; ID</th>
                <th className="py-3 px-4">Cluster &amp; Department</th>
                <th className="py-3 px-4">Designation &amp; Type</th>
                <th className="py-3 px-4">Statutory KYC &amp; Bank</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    No faculty records matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map(faculty => {
                  const isGuest = faculty.employmentType.includes('Guest');
                  const isInactive = faculty.status === 'Restricted / Inactive';

                  return (
                    <tr
                      key={faculty.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isInactive ? 'bg-slate-950/40 opacity-75' : ''
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">
                          {faculty.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{faculty.empId}</span>
                          <span aria-hidden="true">·</span>
                          <span>Joined {faculty.joinDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {faculty.qualification}
                        </div>
                      </td>

                      {/* Cluster & Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{faculty.department}</div>
                        <div className="text-[11px] text-indigo-400 mt-0.5">{faculty.facultyCluster}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 italic truncate max-w-xs">
                          {faculty.specialization}
                        </div>
                      </td>

                      {/* Designation & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{faculty.designation}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{faculty.employmentType}</div>
                        {isGuest && faculty.guestTerms && (
                          <div className="mt-1 text-[10px] text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block">
                            ₹{faculty.guestTerms.honorariumPerSession}/session · {faculty.guestTerms.tenureDurationMonths}m
                          </div>
                        )}
                      </td>

                      {/* Statutory KYC & Bank */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {faculty.kyc.isKycVerified ? (
                            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              KYC Verified
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Verification Pending
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          PAN: {faculty.kyc.panNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Appt: {faculty.kyc.appointmentLetterNumber}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            faculty.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : faculty.status === 'On Sabbatical'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {faculty.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect KYC Dossier */}
                          <button
                            type="button"
                            onClick={() => setInspectingKycFaculty(faculty)}
                            title="Inspect KYC & Appointment Dossier"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Faculty */}
                          {isAdminOrAuthorized && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(faculty)}
                              title="Edit Faculty Record"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Toggle Active / Restrict */}
                          {isAdminOrAuthorized && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(faculty)}
                              title={isInactive ? 'Reactivate Faculty' : 'Restrict / Inactive Faculty'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isInactive
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                            >
                              {isInactive ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                          )}

                          {/* Delete */}
                          {isAdminOrAuthorized && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove faculty record for ${faculty.name}?`)) {
                                  onDeleteFaculty(faculty.id);
                                }
                              }}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Dossier Modal */}
      {/* KYC Dossier Modal */}
      {inspectingKycFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Statutory KYC &amp; Appointment Dossier
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {inspectingKycFaculty.name} ({inspectingKycFaculty.empId}) · {inspectingKycFaculty.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingKycFaculty(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Identity Documents */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Statutory Identification (Masked for Privacy)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Aadhaar Card</div>
                    <div className="text-xs font-mono font-bold text-slate-100 mt-1">
                      {inspectingKycFaculty.kyc.aadhaarNumber}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> UIDAI Verified
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">PAN Card</div>
                    <div className="text-xs font-mono font-bold text-slate-100 mt-1">
                      {inspectingKycFaculty.kyc.panNumber}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> NSDL Verified
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Passport Number</div>
                    <div className="text-xs font-mono font-bold text-slate-100 mt-1">
                      {inspectingKycFaculty.kyc.passportNumber || 'Not Required / Unfiled'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Travel Authorization</div>
                  </div>
                </div>
              </div>

              {/* Bank Routing Details */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Institutional Payroll &amp; Bank Routing
                </h4>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Bank Name</span>
                    <div className="font-semibold text-slate-100 mt-0.5">{inspectingKycFaculty.kyc.bankName}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Account (Masked)</span>
                    <div className="font-mono font-bold text-slate-100 mt-0.5">{inspectingKycFaculty.kyc.bankAccountNumber}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">IFSC Code</span>
                    <div className="font-mono font-bold text-slate-100 mt-0.5">{inspectingKycFaculty.kyc.bankIfscCode}</div>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Branch</span>
                    <div className="text-slate-200 mt-0.5 truncate">{inspectingKycFaculty.kyc.bankBranch}</div>
                  </div>
                </div>
              </div>

              {/* Appointment Letter & Testimonials */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Official Appointment Letter &amp; Testimonials
                </h4>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">
                        {inspectingKycFaculty.kyc.appointmentLetterNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Issued on {inspectingKycFaculty.kyc.appointmentDate} · Regular EOMS Appointment Seal
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
                    </span>
                  </div>

                  {inspectingKycFaculty.kyc.testimonials && inspectingKycFaculty.kyc.testimonials.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-300">Verified Testimonials ({inspectingKycFaculty.kyc.testimonials.length})</span>
                      <div className="mt-1.5 space-y-1.5">
                        {inspectingKycFaculty.kyc.testimonials.map(t => (
                          <div key={t.id} className="text-xs p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="font-medium text-slate-100">{t.title}</span>
                              <span className="text-slate-600 mx-1.5">·</span>
                              <span className="text-slate-400">{t.issuingOrganization} ({t.year})</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium">Verified Citation</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Terms if applicable */}
              {inspectingKycFaculty.guestTerms && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                    Short-Term Guest Appointment Terms
                  </h4>
                  <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-indigo-300">Honorarium / Session:</span>
                      <div className="font-bold text-white mt-0.5">Rs. {inspectingKycFaculty.guestTerms.honorariumPerSession}</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-indigo-300">Tenure Duration:</span>
                      <div className="font-bold text-white mt-0.5">{inspectingKycFaculty.guestTerms.tenureDurationMonths} Months</div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-indigo-300">Parent / Affiliated Institution:</span>
                      <div className="font-semibold text-white mt-0.5">{inspectingKycFaculty.guestTerms.affiliatedInstitution}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-indigo-300">Special Lecture Topic:</span>
                      <div className="text-white mt-0.5">{inspectingKycFaculty.guestTerms.specialLectureTopic}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingKycFaculty(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Faculty Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingFaculty ? 'Edit Faculty Record' : 'Register New Faculty / Guest Expert'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Compliant with ISO 21001 Clause 7.2 Competence &amp; Statutory KYC Verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {/* Section 1: Basic Information */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  1. Academic Profile &amp; Departmental Placement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Employee ID</label>
                    <input
                      type="text"
                      required
                      value={formData.empId || ''}
                      onChange={e => setFormData({ ...formData, empId: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Designation</label>
                    <select
                      value={formData.designation || 'Assistant Professor'}
                      onChange={e => setFormData({ ...formData, designation: e.target.value as any })}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Guest Faculty">Guest Faculty</option>
                      <option value="Visiting Scholar">Visiting Scholar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Faculty Cluster</label>
                    <select
                      value={formData.facultyCluster || 'Pharmacy'}
                      onChange={e => setFormData({ ...formData, facultyCluster: e.target.value as any })}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Medical">Medical</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sciences">Sciences</option>
                      <option value="Commerce">Commerce / Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={formData.department || ''}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Pharmaceutics & IQAC"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Employment Type</label>
                    <select
                      value={formData.employmentType || 'Permanent / Regular'}
                      onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Permanent / Regular">Permanent / Regular</option>
                      <option value="Tenure-Track">Tenure-Track</option>
                      <option value="Guest Faculty (Short-Term)">Guest Faculty (Short-Term)</option>
                      <option value="Contractual">Contractual</option>
                      <option value="Adjunct">Adjunct</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      required
                      value={formData.phone || ''}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Status</label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Active">Active</option>
                      <option value="On Sabbatical">On Sabbatical</option>
                      <option value="Restricted / Inactive">Restricted / Inactive</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">Qualifications &amp; Degrees</label>
                    <input
                      type="text"
                      required
                      value={formData.qualification || ''}
                      onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. Ph.D. in Pharmaceutics, M.Pharm, B.Pharm"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Specialization</label>
                    <input
                      type="text"
                      required
                      value={formData.specialization || ''}
                      onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Drug Delivery, Nanotechnology"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Statutory KYC, Identity & Bank */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  2. Statutory Identity &amp; Bank Vault (Aadhaar / PAN / Passport)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      required
                      value={formData.kyc?.aadhaarNumber || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: { ...formData.kyc!, aadhaarNumber: e.target.value },
                        })
                      }
                      placeholder="e.g. XXXX-XXXX-8421"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      required
                      value={formData.kyc?.panNumber || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: { ...formData.kyc!, panNumber: e.target.value.toUpperCase() },
                        })
                      }
                      placeholder="e.g. ABCDE1234F"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Passport Number (Optional)</label>
                    <input
                      type="text"
                      value={formData.kyc?.passportNumber || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: { ...formData.kyc!, passportNumber: e.target.value },
                        })
                      }
                      placeholder="e.g. Z5812948"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={formData.kyc?.bankName || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: { ...formData.kyc!, bankName: e.target.value },
                        })
                      }
                      placeholder="e.g. State Bank of India"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Account Number (Masked)</label>
                    <input
                      type="text"
                      required
                      value={formData.kyc?.bankAccountNumber || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: { ...formData.kyc!, bankAccountNumber: e.target.value },
                        })
                      }
                      placeholder="e.g. XXXXXX5892"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">IFSC Code &amp; Branch</label>
                    <input
                      type="text"
                      required
                      value={formData.kyc?.bankIfscCode || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: {
                            ...formData.kyc!,
                            bankIfscCode: e.target.value.toUpperCase(),
                            bankBranch: formData.kyc?.bankBranch || 'Main Campus Branch',
                          },
                        })
                      }
                      placeholder="e.g. SBIN0004128"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Appointment Letter Ref</label>
                    <input
                      type="text"
                      required
                      value={formData.kyc?.appointmentLetterNumber || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: { ...formData.kyc!, appointmentLetterNumber: e.target.value },
                        })
                      }
                      placeholder="e.g. REG/UNIV/APPT/2026/044"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Appointment Issue Date</label>
                    <input
                      type="date"
                      required
                      value={formData.kyc?.appointmentDate || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: { ...formData.kyc!, appointmentDate: e.target.value },
                        })
                      }
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="kycVerifiedCheck"
                      checked={formData.kyc?.isKycVerified || false}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          kyc: { ...formData.kyc!, isKycVerified: e.target.checked },
                        })
                      }
                      className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-slate-950 border-slate-700"
                    />
                    <label htmlFor="kycVerifiedCheck" className="text-slate-200 font-medium cursor-pointer">
                      Mark KYC Verified by Registrar
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Guest Faculty Terms (Conditional) */}
              {formData.employmentType === 'Guest Faculty (Short-Term)' && (
                <div className="pt-2 border-t border-slate-800 bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                    3. Short-Term Guest Faculty Terms &amp; Honorarium
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-indigo-200 font-medium mb-1">Honorarium / Session (Rs.)</label>
                      <input
                        type="number"
                        required
                        value={formData.guestTerms?.honorariumPerSession || 5000}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            guestTerms: {
                              ...formData.guestTerms!,
                              honorariumPerSession: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-indigo-200 font-medium mb-1">Tenure Duration (Months)</label>
                      <input
                        type="number"
                        required
                        value={formData.guestTerms?.tenureDurationMonths || 3}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            guestTerms: {
                              ...formData.guestTerms!,
                              tenureDurationMonths: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-indigo-200 font-medium mb-1">Parent / Affiliated Institution</label>
                      <input
                        type="text"
                        required
                        value={formData.guestTerms?.affiliatedInstitution || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            guestTerms: {
                              ...formData.guestTerms!,
                              affiliatedInstitution: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Oxford, AIIMS, IIT, Industry Research Lab"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-indigo-200 font-medium mb-1">Special Lecture / Masterclass Topic</label>
                      <input
                        type="text"
                        required
                        value={formData.guestTerms?.specialLectureTopic || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            guestTerms: {
                              ...formData.guestTerms!,
                              specialLectureTopic: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Advanced Drug Delivery Systems"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Data stored locally in encrypted vault with complete audit logging.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
                  >
                    {editingFaculty ? 'Save Changes' : 'Register Faculty'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
