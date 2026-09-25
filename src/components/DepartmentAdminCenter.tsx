import React, { useState } from 'react';
import {
  Wrench,
  FlaskConical,
  DollarSign,
  AlertTriangle,
  Calendar,
  CheckCircle,
  FileText,
  Search,
  Plus,
  ShieldCheck,
  TrendingDown,
  Building,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  DepartmentAsset,
  ChemicalInventoryItem,
  FinancialBudgetRecord,
  FacultyWorkloadRecord,
  FacultyCluster,
} from '../types';
import { FacultyWorkloadModule } from './FacultyWorkloadModule';
import { DataActionsBar } from './DataActionsBar';
import { ExportColumn } from '../utils/exportEngine';

interface DepartmentAdminCenterProps {
  assets: DepartmentAsset[];
  chemicals: ChemicalInventoryItem[];
  budgets: FinancialBudgetRecord[];
  workloads: FacultyWorkloadRecord[];
  onAddAsset: (asset: DepartmentAsset) => void;
  onUpdateAsset: (asset: DepartmentAsset) => void;
  onDeleteAsset: (id: string) => void;
  onImportAssets: (assets: DepartmentAsset[]) => void;
  onAddChemical: (chemical: ChemicalInventoryItem) => void;
  onUpdateChemical: (chemical: ChemicalInventoryItem) => void;
  onDeleteChemical: (id: string) => void;
  onImportChemicals: (chemicals: ChemicalInventoryItem[]) => void;
  onAddWorkload: (workload: FacultyWorkloadRecord) => void;
  onUpdateWorkload: (workload: FacultyWorkloadRecord) => void;
  onDeleteWorkload: (id: string) => void;
  onImportWorkloads: (workloads: FacultyWorkloadRecord[]) => void;
  isAdminOrAuthorized?: boolean;
}

export const DepartmentAdminCenter: React.FC<DepartmentAdminCenterProps> = ({
  assets,
  chemicals,
  budgets,
  workloads,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onImportAssets,
  onAddChemical,
  onUpdateChemical,
  onDeleteChemical,
  onImportChemicals,
  onAddWorkload,
  onUpdateWorkload,
  onDeleteWorkload,
  onImportWorkloads,
  isAdminOrAuthorized = true,
}) => {
  const [activeTab, setActiveTab] = useState<'Workload' | 'Equipment' | 'Chemicals' | 'Budgets'>('Workload');
  const [facultyFilter, setFacultyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Asset Modals
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DepartmentAsset | null>(null);
  const [assetForm, setAssetForm] = useState<Partial<DepartmentAsset>>({
    name: '',
    department: 'Pharmaceutics Lab',
    faculty: 'Pharmacy',
    serialNumber: '',
    calibrationDueDate: '2026-10-15',
    amcStatus: 'Active',
    operationalStatus: 'Operational',
    cost: 500000,
    custodian: '',
  });

  // Chemical Modals
  const [isChemicalModalOpen, setIsChemicalModalOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<ChemicalInventoryItem | null>(null);
  const [chemicalForm, setChemicalForm] = useState<Partial<ChemicalInventoryItem>>({
    name: '',
    casNumber: '',
    department: 'Medicinal Chemistry Lab',
    faculty: 'Pharmacy',
    currentStock: 500,
    unit: 'g',
    minimumThreshold: 100,
    hazardClass: 'Toxic/Poison',
    storageLocation: 'Flammable Cabinet A',
    lastInspected: new Date().toISOString().slice(0, 10),
  });

  // Equipment Filtering
  const filteredAssets = assets.filter((a) => {
    const matchesFac = facultyFilter === 'All' || a.faculty === facultyFilter;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFac && matchesSearch;
  });

  // Chemicals Filtering
  const filteredChemicals = chemicals.filter((c) => {
    const matchesFac = facultyFilter === 'All' || c.faculty === facultyFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.casNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.storageLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFac && matchesSearch;
  });

  // Export Columns
  const assetExportColumns: ExportColumn<DepartmentAsset>[] = [
    { header: 'Instrument / Asset Name', accessor: 'name' },
    { header: 'Department', accessor: 'department' },
    { header: 'Faculty', accessor: 'faculty' },
    { header: 'Serial Number', accessor: 'serialNumber' },
    { header: 'Calibration Due Date', accessor: 'calibrationDueDate' },
    { header: 'AMC Contract Status', accessor: 'amcStatus' },
    { header: 'Operational Condition', accessor: 'operationalStatus' },
    { header: 'Asset Cost (INR)', accessor: 'cost' },
    { header: 'Custodian', accessor: 'custodian' },
  ];

  const chemicalExportColumns: ExportColumn<ChemicalInventoryItem>[] = [
    { header: 'Chemical / Reagent Name', accessor: 'name' },
    { header: 'CAS Number', accessor: 'casNumber' },
    { header: 'Faculty', accessor: 'faculty' },
    { header: 'Department', accessor: 'department' },
    { header: 'Current Stock', accessor: (c: any) => `${c.currentStock} ${c.unit}` },
    { header: 'Min Safe Threshold', accessor: (c: any) => `${c.minimumThreshold} ${c.unit}` },
    { header: 'Hazard Classification', accessor: 'hazardClass' },
    { header: 'Storage Vault Location', accessor: 'storageLocation' },
    { header: 'Last Safety Inspection', accessor: 'lastInspected' },
  ];

  const budgetExportColumns: ExportColumn<FinancialBudgetRecord>[] = [
    { header: 'Department Name', accessor: 'department' },
    { header: 'Faculty', accessor: 'faculty' },
    { header: 'Allocated Budget', accessor: 'allocatedBudget' },
    { header: 'Actual Expenditure', accessor: 'expenditure' },
    { header: 'Committed Funds', accessor: 'committed' },
    { header: 'Available Balance', accessor: 'availableBalance' },
    { header: 'Grant Funded', accessor: 'grantFunded' },
  ];

  // Asset Handlers
  const handleOpenAddAsset = () => {
    setEditingAsset(null);
    setAssetForm({
      name: '',
      department: 'Central Instrumentation Lab',
      faculty: 'Pharmacy',
      serialNumber: `INST-${Date.now().toString().slice(-4)}`,
      calibrationDueDate: '2026-11-20',
      amcStatus: 'Active',
      operationalStatus: 'Operational',
      cost: 450000,
      custodian: 'Prof. In-Charge',
    });
    setIsAssetModalOpen(true);
  };

  const handleOpenEditAsset = (a: DepartmentAsset) => {
    setEditingAsset(a);
    setAssetForm({ ...a });
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name || !assetForm.serialNumber) {
      alert('Fill in instrument name and serial number.');
      return;
    }

    if (editingAsset) {
      onUpdateAsset({
        ...editingAsset,
        ...assetForm,
        cost: Number(assetForm.cost) || 0,
      } as DepartmentAsset);
    } else {
      onAddAsset({
        id: `ast-${Date.now()}`,
        name: assetForm.name || 'New Instrument',
        department: assetForm.department || 'Lab',
        faculty: (assetForm.faculty as FacultyCluster) || 'Pharmacy',
        serialNumber: assetForm.serialNumber || 'SN-000',
        calibrationDueDate: assetForm.calibrationDueDate || '2026-12-31',
        amcStatus: (assetForm.amcStatus as any) || 'Active',
        operationalStatus: (assetForm.operationalStatus as any) || 'Operational',
        cost: Number(assetForm.cost) || 0,
        custodian: assetForm.custodian || 'Faculty In-Charge',
      });
    }
    setIsAssetModalOpen(false);
  };

  // Chemical Handlers
  const handleOpenAddChemical = () => {
    setEditingChemical(null);
    setChemicalForm({
      name: '',
      casNumber: '',
      department: 'Medicinal Chemistry Lab',
      faculty: 'Pharmacy',
      currentStock: 500,
      unit: 'g',
      minimumThreshold: 100,
      hazardClass: 'Toxic/Poison',
      storageLocation: 'Poison Locker A',
      lastInspected: new Date().toISOString().slice(0, 10),
    });
    setIsChemicalModalOpen(true);
  };

  const handleOpenEditChemical = (c: ChemicalInventoryItem) => {
    setEditingChemical(c);
    setChemicalForm({ ...c });
    setIsChemicalModalOpen(true);
  };

  const handleSaveChemical = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chemicalForm.name || !chemicalForm.casNumber) {
      alert('Please fill out chemical name and CAS number.');
      return;
    }

    if (editingChemical) {
      onUpdateChemical({
        ...editingChemical,
        ...chemicalForm,
        currentStock: Number(chemicalForm.currentStock) || 0,
        minimumThreshold: Number(chemicalForm.minimumThreshold) || 0,
      } as ChemicalInventoryItem);
    } else {
      onAddChemical({
        id: `chem-${Date.now()}`,
        name: chemicalForm.name || 'Reagent',
        casNumber: chemicalForm.casNumber || '00-00-0',
        department: chemicalForm.department || 'Lab',
        faculty: (chemicalForm.faculty as FacultyCluster) || 'Pharmacy',
        currentStock: Number(chemicalForm.currentStock) || 0,
        unit: (chemicalForm.unit as any) || 'g',
        minimumThreshold: Number(chemicalForm.minimumThreshold) || 0,
        hazardClass: (chemicalForm.hazardClass as any) || 'General',
        storageLocation: chemicalForm.storageLocation || 'Shelf',
        lastInspected: chemicalForm.lastInspected || new Date().toISOString().slice(0, 10),
      });
    }
    setIsChemicalModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Departmental Infrastructure &amp; Faculty
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                NAAC / NBA Workload &amp; Fiscal Ledger
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              Department Administration, Faculty Workload &amp; Fiscal Ledger
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Integrated faculty teaching hours &amp; research output calculated against NAAC/NBA norms, equipment calibration AMC logs, hazardous chemical registers, and multi-department fiscal balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('Workload')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                activeTab === 'Workload'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Faculty Workload (NAAC/NBA)
            </button>
            <button
              onClick={() => setActiveTab('Equipment')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                activeTab === 'Equipment'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Equipment &amp; AMC
            </button>
            <button
              onClick={() => setActiveTab('Chemicals')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                activeTab === 'Chemicals'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Chemicals &amp; Hazardous
            </button>
            <button
              onClick={() => setActiveTab('Budgets')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                activeTab === 'Budgets'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Financial Ledgers
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Workload Visualization Module Tab */}
      {activeTab === 'Workload' && (
        <FacultyWorkloadModule
          workloads={workloads}
          onAddWorkload={onAddWorkload}
          onUpdateWorkload={onUpdateWorkload}
          onDeleteWorkload={onDeleteWorkload}
          onImportWorkloads={onImportWorkloads}
          isAdminOrAuthorized={isAdminOrAuthorized}
        />
      )}

      {/* Equipment View */}
      {activeTab === 'Equipment' && (
        <div className="space-y-4">
          <DataActionsBar<DepartmentAsset>
            title="Institutional Equipment & Central Instrumentation Calibration Log"
            filename="Equipment_AMC_Calibration_Log"
            data={filteredAssets}
            columns={assetExportColumns}
            onImportData={onImportAssets}
            onAddNew={handleOpenAddAsset}
            addLabel="Add Instrument / Asset"
            isAdminOrAuthorized={isAdminOrAuthorized}
          />

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search equipment by name, model, serial no, or lab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
              />
            </div>
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 px-3 py-2"
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
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Instrument / Equipment</th>
                    <th className="py-3 px-4">Faculty &amp; Department</th>
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">Calibration Due</th>
                    <th className="py-3 px-4">AMC Status</th>
                    <th className="py-3 px-4">Operational Status</th>
                    <th className="py-3 px-4">Custodian</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-medium text-slate-100 flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-sky-400" />
                        {asset.name}
                      </td>
                      <td className="py-3 px-4">
                        <div>{asset.department}</div>
                        <span className="text-[10px] text-slate-400 font-medium">{asset.faculty}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{asset.serialNumber}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">{asset.calibrationDueDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            asset.amcStatus === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {asset.amcStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            asset.operationalStatus === 'Operational'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {asset.operationalStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{asset.custodian}</td>
                      <td className="py-3 px-4 text-right">
                        {isAdminOrAuthorized ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditAsset(asset)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-sky-400 rounded transition cursor-pointer"
                              title="Edit Instrument"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove asset ${asset.name}?`)) {
                                  onDeleteAsset(asset.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                              title="Delete Asset"
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

      {/* Chemicals View */}
      {activeTab === 'Chemicals' && (
        <div className="space-y-4">
          <DataActionsBar<ChemicalInventoryItem>
            title="Chemical Inventory & Toxic/Hazardous Poison Register"
            filename="Chemical_Hazard_Register"
            data={filteredChemicals}
            columns={chemicalExportColumns}
            onImportData={onImportChemicals}
            onAddNew={handleOpenAddChemical}
            addLabel="Add Chemical / Reagent"
            isAdminOrAuthorized={isAdminOrAuthorized}
          />

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search chemical by name, CAS registry no, or storage location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Chemical / Reagent</th>
                    <th className="py-3 px-4">CAS Number</th>
                    <th className="py-3 px-4">Department &amp; Faculty</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Hazard Classification</th>
                    <th className="py-3 px-4">Storage Location</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {filteredChemicals.map((chem) => (
                    <tr key={chem.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-medium text-slate-100 flex items-center gap-2">
                        <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                        {chem.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{chem.casNumber}</td>
                      <td className="py-3 px-4">
                        <div>{chem.department}</div>
                        <span className="text-[10px] text-slate-400 font-medium">{chem.faculty}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <span className={chem.currentStock <= chem.minimumThreshold ? 'text-rose-400 font-bold' : ''}>
                          {chem.currentStock} {chem.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Min threshold: {chem.minimumThreshold} {chem.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            chem.hazardClass === 'Toxic/Poison'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : chem.hazardClass === 'Flammable'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {chem.hazardClass}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{chem.storageLocation}</td>
                      <td className="py-3 px-4 text-right">
                        {isAdminOrAuthorized ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditChemical(chem)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
                              title="Edit Chemical"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove chemical ${chem.name}?`)) {
                                  onDeleteChemical(chem.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                              title="Delete Chemical"
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

      {/* Budgets View */}
      {activeTab === 'Budgets' && (
        <div className="space-y-4">
          <DataActionsBar<FinancialBudgetRecord>
            title="Institutional Departmental Budget & Grant Ledger"
            filename="Departmental_Financial_Ledger"
            data={budgets}
            columns={budgetExportColumns}
            isAdminOrAuthorized={isAdminOrAuthorized}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {b.faculty}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">AY 2025-26</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm mt-2">{b.department}</h3>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocated Budget:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      ₹{b.allocatedBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Actual Expenditure:</span>
                    <span className="font-mono text-rose-400">₹{b.expenditure.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Committed / PO:</span>
                    <span className="font-mono text-amber-400">₹{b.committed.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                    <span className="text-slate-300">Available Balance:</span>
                    <span className="font-mono text-emerald-400">₹{b.availableBalance.toLocaleString()}</span>
                  </div>
                  {b.grantFunded > 0 && (
                    <div className="bg-sky-500/10 border border-sky-500/20 p-2 rounded text-[11px] text-sky-300 mt-2">
                      Research Grants Mobilized: ₹{b.grantFunded.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Asset Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-sky-400" />
                {editingAsset ? 'Edit Instrument / Asset' : 'Add Department Asset'}
              </h3>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Equipment / Model Name</label>
                <input
                  type="text"
                  required
                  value={assetForm.name || ''}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. HPLC System (Shimadzu Prominence-i)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={assetForm.department || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Faculty</label>
                  <select
                    value={assetForm.faculty}
                    onChange={(e) => setAssetForm({ ...assetForm, faculty: e.target.value as any })}
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    value={assetForm.serialNumber || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Calibration Due Date</label>
                  <input
                    type="date"
                    required
                    value={assetForm.calibrationDueDate || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, calibrationDueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">AMC Status</label>
                  <select
                    value={assetForm.amcStatus}
                    onChange={(e) => setAssetForm({ ...assetForm, amcStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Operational Status</label>
                  <select
                    value={assetForm.operationalStatus}
                    onChange={(e) => setAssetForm({ ...assetForm, operationalStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Calibration Due">Calibration Due</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Asset Value (₹)</label>
                  <input
                    type="number"
                    value={assetForm.cost || 0}
                    onChange={(e) => setAssetForm({ ...assetForm, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Custodian / Lab In-Charge</label>
                  <input
                    type="text"
                    value={assetForm.custodian || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, custodian: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold cursor-pointer shadow-md shadow-sky-600/30"
                >
                  {editingAsset ? 'Save Instrument' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chemical Modal */}
      {isChemicalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-400" />
                {editingChemical ? 'Edit Chemical / Reagent' : 'Add Chemical to Hazardous Register'}
              </h3>
              <button
                onClick={() => setIsChemicalModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChemical} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Chemical / Reagent Name</label>
                <input
                  type="text"
                  required
                  value={chemicalForm.name || ''}
                  onChange={(e) => setChemicalForm({ ...chemicalForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Potassium Cyanide (Pure Grade)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">CAS Registry Number</label>
                  <input
                    type="text"
                    required
                    value={chemicalForm.casNumber || ''}
                    onChange={(e) => setChemicalForm({ ...chemicalForm, casNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="e.g. 151-50-8"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hazard Class</label>
                  <select
                    value={chemicalForm.hazardClass}
                    onChange={(e) => setChemicalForm({ ...chemicalForm, hazardClass: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Toxic/Poison">Toxic/Poison (Dual Lock)</option>
                    <option value="Flammable">Flammable</option>
                    <option value="Corrosive">Corrosive</option>
                    <option value="Biohazard">Biohazard</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Current Stock</label>
                  <input
                    type="number"
                    required
                    value={chemicalForm.currentStock || 0}
                    onChange={(e) => setChemicalForm({ ...chemicalForm, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit</label>
                  <select
                    value={chemicalForm.unit}
                    onChange={(e) => setChemicalForm({ ...chemicalForm, unit: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="mL">mL</option>
                    <option value="L">L</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={chemicalForm.minimumThreshold || 0}
                    onChange={(e) => setChemicalForm({ ...chemicalForm, minimumThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Storage Location Vault</label>
                <input
                  type="text"
                  required
                  value={chemicalForm.storageLocation || ''}
                  onChange={(e) => setChemicalForm({ ...chemicalForm, storageLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Poison Locker Vault B, Keyed Custody"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChemicalModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold cursor-pointer shadow-md shadow-amber-600/30"
                >
                  {editingChemical ? 'Save Chemical' : 'Register Chemical'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
