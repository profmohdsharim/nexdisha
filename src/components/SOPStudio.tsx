import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertOctagon,
  Shield,
  Printer,
  Download,
  BookOpen,
  Eye,
  X,
} from 'lucide-react';
import { SOPDocument, FacultyCluster } from '../types';
import { DataActionsBar } from './DataActionsBar';

interface SOPStudioProps {
  sops: SOPDocument[];
  onSaveSOP: (sop: SOPDocument) => void;
  currentUserRole: string;
}

export const SOPStudio: React.FC<SOPStudioProps> = ({
  sops,
  onSaveSOP,
  currentUserRole,
}) => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSOP, setActiveSOP] = useState<SOPDocument | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New SOP Form State
  const [newSop, setNewSop] = useState<Partial<SOPDocument>>({
    sopNumber: `SOP/INST/${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    title: '',
    faculty: 'Pharmacy',
    department: 'Pharmaceutics & Formulation',
    category: 'Safety',
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Draft',
    scope: '',
    procedureSteps: [''],
    safetyPrecautions: [''],
    wasteDisposalCode: 'BMW-COLOR-CODE (Compliant with CPCB Guidelines)',
    hazards: [''],
  });

  const filteredSops = sops.filter((s) => {
    const matchesFaculty = selectedFaculty === 'All' || s.faculty === selectedFaculty;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sopNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFaculty && matchesSearch;
  });

  const handleAddStep = () => {
    setNewSop({
      ...newSop,
      procedureSteps: [...(newSop.procedureSteps || []), ''],
    });
  };

  const handleStepChange = (index: number, val: string) => {
    const steps = [...(newSop.procedureSteps || [])];
    steps[index] = val;
    setNewSop({ ...newSop, procedureSteps: steps });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSop.title) return;

    const created: SOPDocument = {
      id: `sop-custom-${Date.now()}`,
      sopNumber: newSop.sopNumber || 'SOP/GEN/001',
      title: newSop.title,
      faculty: (newSop.faculty as FacultyCluster) || 'Pharmacy',
      department: newSop.department || 'General Administration',
      category: newSop.category || 'Safety',
      version: newSop.version || '1.0',
      effectiveDate: newSop.effectiveDate || new Date().toISOString().split('T')[0],
      reviewDate: newSop.reviewDate || new Date().toISOString().split('T')[0],
      author: 'Current User (Faculty)',
      reviewer: 'HOD / Quality Auditor',
      approver: 'Dr. Sharim Siddiqui (Dean & IQAC Chair)',
      status: 'Published',
      scope: newSop.scope || 'Institutional standard scope',
      procedureSteps: (newSop.procedureSteps || []).filter((s) => s.trim().length > 0),
      safetyPrecautions: (newSop.safetyPrecautions || []).filter((s) => s.trim().length > 0),
      wasteDisposalCode: newSop.wasteDisposalCode || 'Standard disposal',
      hazards: (newSop.hazards || []).filter((h) => h.trim().length > 0),
    };

    onSaveSOP(created);
    setIsCreating(false);
    setActiveSOP(created);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                ISO 21001:2025 Standardized
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Controlled Copy Watermarked
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              Institutional SOP Development Studio &amp; Department Administration
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Standard Operating Procedure authoring, workflow approvals, biomedical waste coding, and department administration across Medical, Pharmacy, Paramedical, Tech, Science, Arts, and Commerce disciplines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Author New Department SOP
            </button>
          </div>
        </div>
      </div>

      {/* Data Actions Bar: Multi-format Export & Import */}
      <DataActionsBar<SOPDocument>
        title="Institutional Standard Operating Procedures (SOP) Master Index"
        filename="Institutional_SOP_Master_Index"
        data={filteredSops}
        columns={[
          { header: 'SOP Number', accessor: 'sopNumber' },
          { header: 'Title', accessor: 'title' },
          { header: 'Faculty', accessor: 'faculty' },
          { header: 'Department', accessor: 'department' },
          { header: 'Category', accessor: 'category' },
          { header: 'Version', accessor: 'version' },
          { header: 'Status', accessor: 'status' },
          { header: 'Effective Date', accessor: 'effectiveDate' },
          { header: 'Review Date', accessor: 'reviewDate' },
          { header: 'Author', accessor: 'author' },
          { header: 'Reviewer', accessor: 'reviewer' },
          { header: 'Approver', accessor: 'approver' },
          { header: 'Waste Disposal Code', accessor: 'wasteDisposalCode' },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SOP number, title, chemical/equipment, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
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
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {fac}
              </button>
            )
          )}
        </div>
      </div>

      {/* SOP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSops.map((sop) => (
          <div
            key={sop.id}
            onClick={() => setActiveSOP(sop)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {sop.sopNumber}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  v{sop.version} {sop.status}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 mt-2.5 transition-colors line-clamp-2">
                {sop.title}
              </h3>

              <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <span className="text-slate-300 font-medium">{sop.faculty}</span>
                <span>•</span>
                <span className="truncate">{sop.department}</span>
              </div>

              <p className="mt-2 text-xs text-slate-400 line-clamp-2">{sop.scope}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Next Review: {sop.reviewDate}
              </span>
              <span className="text-sky-400 font-medium flex items-center gap-1 group-hover:underline">
                <Eye className="w-3.5 h-3.5" /> View Controlled Copy
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Active SOP Document Viewer Modal */}
      {activeSOP && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-sky-400">
                      {activeSOP.sopNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Controlled Copy - ISO 21001:2025
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100 mt-0.5">{activeSOP.title}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Print Official Controlled Copy"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveSOP(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-xs text-slate-400 block">Faculty Domain</span>
                  <strong className="text-slate-200">{activeSOP.faculty}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Department</span>
                  <strong className="text-slate-200">{activeSOP.department}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Effective Date</span>
                  <strong className="text-slate-200">{activeSOP.effectiveDate}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Annual Review Date</span>
                  <strong className="text-slate-200">{activeSOP.reviewDate}</strong>
                </div>
              </div>

              {/* Scope */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  1. Scope &amp; Regulatory Jurisdiction
                </h4>
                <p className="text-slate-300 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                  {activeSOP.scope}
                </p>
              </div>

              {/* Step by step procedure */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  2. Sequential Standard Operating Procedure (ISO 21001:2025)
                </h4>
                <ol className="space-y-2">
                  {activeSOP.procedureSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 bg-slate-800/30 p-3 rounded-lg border border-slate-800/60"
                    >
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-xs flex items-center justify-center shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Safety, Precautions & Waste Handling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                    <Shield className="w-4 h-4" /> Safety Precautions &amp; PPE Protocol
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeSOP.safetyPrecautions.map((safe, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{safe}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertOctagon className="w-4 h-4" /> Bio-Medical / Chemical Waste Disposal
                  </h4>
                  <div className="text-xs text-slate-300 space-y-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Authorized Segregation Bin:</span>
                      <strong className="text-rose-300 font-mono">{activeSOP.wasteDisposalCode}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Primary Hazards:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeSOP.hazards.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px] border border-rose-500/20"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures & Chain of Custody */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-xs text-slate-400">
                <div>
                  <span className="block text-[11px]">Author / Lab Incharge:</span>
                  <strong className="text-slate-200">{activeSOP.author}</strong>
                </div>
                <div>
                  <span className="block text-[11px]">Departmental Reviewer (HOD):</span>
                  <strong className="text-slate-200">{activeSOP.reviewer}</strong>
                </div>
                <div>
                  <span className="block text-[11px]">IQAC Executive Approver:</span>
                  <strong className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {activeSOP.approver}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Author New SOP Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                ISO 21001:2025 SOP Development Wizard
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">SOP Control Number</label>
                  <input
                    type="text"
                    value={newSop.sopNumber}
                    onChange={(e) => setNewSop({ ...newSop, sopNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Faculty Domain</label>
                  <select
                    value={newSop.faculty}
                    onChange={(e) => setNewSop({ ...newSop, faculty: e.target.value as FacultyCluster })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="Pharmacy">Pharmacy &amp; Pharmaceutical Sciences</option>
                    <option value="Medical">Medical Sciences &amp; Hospital</option>
                    <option value="Paramedical">Paramedical &amp; Allied Health</option>
                    <option value="Engineering">Engineering &amp; Technology</option>
                    <option value="Sciences">Traditional Basic &amp; Applied Sciences</option>
                    <option value="Arts">Arts &amp; Humanities</option>
                    <option value="Commerce">Commerce &amp; Healthcare Management</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">SOP Title</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Procedure for Karl Fischer Moisture Titrator Calibration"
                  value={newSop.title}
                  onChange={(e) => setNewSop({ ...newSop, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Quality Assurance / Formulation"
                    value={newSop.department}
                    onChange={(e) => setNewSop({ ...newSop, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newSop.category}
                    onChange={(e) => setNewSop({ ...newSop, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                  >
                    <option value="Equipment">Equipment Calibration &amp; Operation</option>
                    <option value="Safety">Safety &amp; Emergency Protocols</option>
                    <option value="Clinical">Clinical Rotations &amp; Hospital Protocols</option>
                    <option value="Chemical & Bio-waste">Chemical &amp; Bio-waste Management</option>
                    <option value="Academic">Academic &amp; OSCE Rubrics</option>
                    <option value="Administrative">Administrative &amp; Finance Procedures</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Institutional Scope</label>
                <textarea
                  rows={2}
                  placeholder="Describe the target audience, laboratory rooms, and clinical context..."
                  value={newSop.scope}
                  onChange={(e) => setNewSop({ ...newSop, scope: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">Sequential Procedure Steps</label>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    + Add Step
                  </button>
                </div>
                <div className="space-y-2">
                  {(newSop.procedureSteps || []).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Step ${idx + 1} action...`}
                        value={step}
                        onChange={(e) => handleStepChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium cursor-pointer"
                >
                  Publish to Controlled SOP Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
