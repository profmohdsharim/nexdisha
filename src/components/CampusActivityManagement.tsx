import React, { useState, useMemo } from 'react';
import {
  CampusActivity,
  ActivityCategory,
  ActivityStatus,
} from '../types';
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Award,
  BookOpen,
  Globe2,
  HeartHandshake,
  Music,
  Trash2,
  Edit,
  X,
  ExternalLink,
} from 'lucide-react';
import { exportActivitiesData } from '../utils/exportEngine';

interface Props {
  activities: CampusActivity[];
  onAddActivity: (act: CampusActivity) => void;
  onUpdateActivity: (act: CampusActivity) => void;
  onDeleteActivity: (id: string) => void;
  isAdminOrAuthorized: boolean;
}

export const CampusActivityManagement: React.FC<Props> = ({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  isAdminOrAuthorized,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CampusActivity | null>(null);
  const [inspectingActivity, setInspectingActivity] = useState<CampusActivity | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CampusActivity>>({
    activityCode: '',
    title: '',
    category: 'Sports & Athletics',
    organizingDepartment: 'Physical Education & Student Affairs',
    facultyCoordinator: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    venue: '',
    participantCount: 100,
    budgetAllocated: 100000,
    budgetUtilized: 85000,
    status: 'Upcoming',
    naacCriterionLink: 5,
    isoClauseLink: '8.1',
    keyOutcomes: '',
    certificatesIssued: 0,
    reportSummary: '',
  });

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (selectedCategory !== 'All Categories' && a.category !== selectedCategory) return false;
      if (selectedStatus !== 'All Statuses' && a.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchCode = a.activityCode.toLowerCase().includes(q);
        const matchCoord = a.facultyCoordinator.toLowerCase().includes(q);
        const matchDept = a.organizingDepartment.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchCoord && !matchDept) return false;
      }
      return true;
    });
  }, [activities, selectedCategory, selectedStatus, searchQuery]);

  // Aggregate Metrics
  const totalParticipants = useMemo(() => {
    return activities.reduce((acc, curr) => acc + curr.participantCount, 0);
  }, [activities]);

  const totalBudgetSpent = useMemo(() => {
    return activities.reduce((acc, curr) => acc + curr.budgetUtilized, 0);
  }, [activities]);

  const handleOpenAddForm = (category?: ActivityCategory) => {
    setEditingActivity(null);
    const cat = category || 'Sports & Athletics';
    setFormData({
      activityCode: `ACT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      category: cat,
      organizingDepartment: 'Student Affairs & Faculty Council',
      facultyCoordinator: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      venue: 'University Central Auditorium & Campus Grounds',
      participantCount: 150,
      budgetAllocated: 150000,
      budgetUtilized: 120000,
      status: 'Upcoming',
      naacCriterionLink: cat === 'Sports & Athletics' || cat === 'Cultural Fest' ? 5 : cat === 'Community Outreach' ? 7 : 3,
      isoClauseLink: '8.1',
      keyOutcomes: '',
      certificatesIssued: 0,
      reportSummary: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (act: CampusActivity) => {
    setEditingActivity(act);
    setFormData({ ...act });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingActivity) {
      const updated: CampusActivity = {
        ...editingActivity,
        ...formData,
        id: editingActivity.id,
      } as CampusActivity;
      onUpdateActivity(updated);
    } else {
      const newAct: CampusActivity = {
        id: `act-${Date.now().toString(36)}`,
        ...formData,
      } as CampusActivity;
      onAddActivity(newAct);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Campus Life &amp; Institutional Milestones
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">NAAC Criteria 3, 5 &amp; 7 Linkage</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Sports, Seminars, Symposiums &amp; Activity Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Comprehensive lifecycle manager for inter-collegiate sports meets, international symposiums, research seminars, technical workshops, cultural festivals, and community outreach campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Export Button */}
          <button
            type="button"
            onClick={() => exportActivitiesData(activities, 'XLSX')}
            className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Activities
          </button>

          {/* Schedule Event Button */}
          {isAdminOrAuthorized && (
            <button
              type="button"
              onClick={() => handleOpenAddForm()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Event / Activity
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Total Activities Logged</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {activities.length}
            </span>
            <span className="text-xs text-slate-400">Events</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-400">{activities.filter(a => a.status === 'Completed').length} Completed</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{activities.filter(a => a.status === 'Upcoming').length} Scheduled</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Total Participation Count</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-400 tabular-nums">
              {totalParticipants.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Learners &amp; Delegates</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>NAAC C5.3 Student Representation</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Cumulative Budget Utilized</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              ₹{(totalBudgetSpent / 100000).toFixed(1)}L
            </span>
            <span className="text-xs text-slate-400">Disbursed</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span>ISO 21001 Clause 7.1 Financial Audit</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-400 mb-1">Accreditation Linkages</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              100%
            </span>
            <span className="text-xs text-slate-400">Mapped</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span>NAAC Criteria 3, 5 &amp; 7 Aligned</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events, codes, coordinators, venues..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-hidden"
          >
            <option value="All Categories">All Categories</option>
            <option value="Sports & Athletics">Sports &amp; Athletics</option>
            <option value="National Seminar">National Seminar</option>
            <option value="International Symposium">International Symposium</option>
            <option value="Technical Workshop">Technical Workshop</option>
            <option value="Cultural Fest">Cultural Fest</option>
            <option value="Community Outreach">Community Outreach</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-hidden"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 italic">
            No campus activities matching the active filter criteria.
          </div>
        ) : (
          filteredActivities.map(act => {
            const isCompleted = act.status === 'Completed';

            return (
              <div
                key={act.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-[11px] font-semibold text-indigo-400">
                      {act.activityCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                    {act.title}
                  </h3>
                  <div className="text-xs text-indigo-400 font-medium mt-1">
                    {act.category}
                  </div>

                  {/* Metadata List */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{act.startDate} {act.startDate !== act.endDate ? `to ${act.endDate}` : ''}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{act.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{act.participantCount} Participants · {act.certificatesIssued} Certificates</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        Budget: ₹{(act.budgetUtilized / 1000).toFixed(0)}k spent / {(act.budgetAllocated / 1000).toFixed(0)}k allocated
                      </span>
                    </div>
                  </div>

                  {/* Linkages */}
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>NAAC Criterion {act.naacCriterionLink}</span>
                    <span className="font-mono text-indigo-400">ISO {act.isoClauseLink}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setInspectingActivity(act)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View Dossier &amp; Outcomes
                  </button>

                  <div className="flex items-center gap-1">
                    {isAdminOrAuthorized && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(act)}
                        title="Edit Activity"
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isAdminOrAuthorized && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${act.title}?`)) {
                            onDeleteActivity(act.id);
                          }
                        }}
                        title="Delete Activity"
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect Activity Dossier Modal */}
      {inspectingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Activity Dossier: {inspectingActivity.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {inspectingActivity.activityCode} · {inspectingActivity.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingActivity(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="font-semibold text-white">Event Overview</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><strong className="text-slate-400">Department:</strong> {inspectingActivity.organizingDepartment}</div>
                  <div><strong className="text-slate-400">Coordinator:</strong> {inspectingActivity.facultyCoordinator}</div>
                  <div><strong className="text-slate-400">Dates:</strong> {inspectingActivity.startDate} to {inspectingActivity.endDate}</div>
                  <div><strong className="text-slate-400">Venue:</strong> {inspectingActivity.venue}</div>
                  <div><strong className="text-slate-400">Participants:</strong> {inspectingActivity.participantCount}</div>
                  <div><strong className="text-slate-400">Certificates:</strong> {inspectingActivity.certificatesIssued}</div>
                </div>
              </div>

              {inspectingActivity.externalGuests && inspectingActivity.externalGuests.length > 0 && (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-white mb-1">Keynote Speakers &amp; External Dignitaries</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                    {inspectingActivity.externalGuests.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="font-semibold text-white mb-1">Tangible Outcomes &amp; Impact</div>
                <p className="text-slate-300 leading-relaxed">
                  {inspectingActivity.keyOutcomes}
                </p>
              </div>

              {inspectingActivity.reportSummary && (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-white mb-1">Executive Summary Report</div>
                  <p className="text-slate-400 leading-relaxed italic">
                    "{inspectingActivity.reportSummary}"
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingActivity(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Activity Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingActivity ? 'Edit Campus Activity' : 'Schedule Campus Event / Activity'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Maps directly to NAAC criteria and ISO 21001 institutional reporting
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

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Event / Activity Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Annual Health Sciences Sports Olympiad 2026"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={formData.category || 'Sports & Athletics'}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Sports & Athletics">Sports &amp; Athletics</option>
                    <option value="National Seminar">National Seminar</option>
                    <option value="International Symposium">International Symposium</option>
                    <option value="Technical Workshop">Technical Workshop</option>
                    <option value="Cultural Fest">Cultural Fest</option>
                    <option value="Community Outreach">Community Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Activity Code</label>
                  <input
                    type="text"
                    required
                    value={formData.activityCode || ''}
                    onChange={e => setFormData({ ...formData, activityCode: e.target.value })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Organizing Department</label>
                  <input
                    type="text"
                    required
                    value={formData.organizingDepartment || ''}
                    onChange={e => setFormData({ ...formData, organizingDepartment: e.target.value })}
                    placeholder="e.g. Pharmaceutics & IQAC"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Faculty Coordinator</label>
                  <input
                    type="text"
                    required
                    value={formData.facultyCoordinator || ''}
                    onChange={e => setFormData({ ...formData, facultyCoordinator: e.target.value })}
                    placeholder="e.g. Dr. Sharim Siddiqui"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate || ''}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate || ''}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Venue / Facility</label>
                  <input
                    type="text"
                    required
                    value={formData.venue || ''}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. University Grand Auditorium & Sports Complex"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Expected Participants</label>
                  <input
                    type="number"
                    required
                    value={formData.participantCount || 100}
                    onChange={e => setFormData({ ...formData, participantCount: Number(e.target.value) })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={formData.status || 'Upcoming'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Budget Allocated (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={formData.budgetAllocated || 0}
                    onChange={e => setFormData({ ...formData, budgetAllocated: Number(e.target.value) })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Budget Utilized (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={formData.budgetUtilized || 0}
                    onChange={e => setFormData({ ...formData, budgetUtilized: Number(e.target.value) })}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Key Outcomes &amp; Deliverables</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.keyOutcomes || ''}
                    onChange={e => setFormData({ ...formData, keyOutcomes: e.target.value })}
                    placeholder="State specific achievements, research publications, awards, or student benefits..."
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Linked to NAAC Criterion {formData.naacCriterionLink} &amp; ISO Clause {formData.isoClauseLink}
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
                    {editingActivity ? 'Save Changes' : 'Schedule Activity'}
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
