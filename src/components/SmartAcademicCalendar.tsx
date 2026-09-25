import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Clock,
  MapPin,
  Building,
  Users,
  CheckCircle2,
  Share2,
  Tag,
  GraduationCap,
  ClipboardCheck,
  Trophy,
  Mic,
  CalendarCheck,
  Search,
} from 'lucide-react';
import {
  AcademicCalendarEvent,
  CalendarEventCategory,
  CalendarEventStatus,
} from '../types';

interface SmartAcademicCalendarProps {
  events: AcademicCalendarEvent[];
  onAddEvent: (event: AcademicCalendarEvent) => void;
  onUpdateEvent: (event: AcademicCalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onSyncExternalSources: () => void;
  departments?: string[];
}

export const SmartAcademicCalendar: React.FC<SmartAcademicCalendarProps> = ({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onSyncExternalSources,
  departments = [
    'Institutional',
    'Controller of Examinations',
    'Internal Quality Assurance Cell (IQAC)',
    'Department of Pharmaceutical Chemistry',
    'Department of Computer Science & Engineering',
    'Department of Physical Education',
    'Institutional Quality Board',
  ],
}) => {
  // Current calendar view month: Defaults to September 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 1)); // September 2026
  const [viewMode, setViewMode] = useState<'MONTH' | 'TIMELINE' | 'AGENDA'>('MONTH');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<AcademicCalendarEvent | null>(null);

  // New Event Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    category: CalendarEventCategory;
    startDate: string;
    endDate: string;
    department: string;
    venue: string;
    targetAudience: string;
    responsibleLead: string;
    description: string;
    naacCriterion: number;
  }>({
    title: '',
    category: 'EXAM',
    startDate: '2026-10-01',
    endDate: '2026-10-02',
    department: 'Institutional',
    venue: 'Main Campus',
    targetAudience: 'All Faculty & Students',
    responsibleLead: 'Dean Academics',
    description: '',
    naacCriterion: 2,
  });

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedCategory !== 'ALL' && ev.category !== selectedCategory) return false;
      if (selectedDepartment !== 'ALL' && ev.department !== selectedDepartment) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDept = ev.department.toLowerCase().includes(q);
        const matchVenue = (ev.venue || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDept && !matchVenue) return false;
      }
      return true;
    });
  }, [events, selectedCategory, selectedDepartment, searchQuery]);

  // Calendar grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month & first day index
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 25));
  };

  const handleSyncClick = () => {
    onSyncExternalSources();
    setSyncFeedback('Synchronized active schedules from Exam Center, AAA Audits, and Campus Activities.');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Helper for category styling
  const getCategoryStyles = (category: CalendarEventCategory) => {
    switch (category) {
      case 'EXAM':
        return {
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          dot: 'bg-indigo-400',
          icon: <GraduationCap className="w-3 h-3" />,
          label: 'Exam & Assessment',
        };
      case 'AUDIT':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
          icon: <ClipboardCheck className="w-3 h-3" />,
          label: 'AAA & ISO Audit',
        };
      case 'SEMINAR_SYMPOSIUM':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: <Mic className="w-3 h-3" />,
          label: 'Seminar / Symposium',
        };
      case 'SPORTS_CULTURAL':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: <Trophy className="w-3 h-3" />,
          label: 'Sports & Cultural',
        };
      case 'SEMESTER_MILESTONE':
        return {
          bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          dot: 'bg-sky-400',
          icon: <CalendarCheck className="w-3 h-3" />,
          label: 'Semester Milestone',
        };
      case 'HOLIDAY':
      default:
        return {
          bg: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
          dot: 'bg-slate-400',
          icon: <CalendarIcon className="w-3 h-3" />,
          label: 'Recess & Holiday',
        };
    }
  };

  // iCal export generator (.ics)
  const handleExportICal = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Institutional Academic ERP//Smart Academic Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    filteredEvents.forEach((ev) => {
      const dtStart = ev.startDate.replace(/-/g, '') + 'T090000Z';
      const dtEnd = (ev.endDate ? ev.endDate.replace(/-/g, '') : ev.startDate.replace(/-/g, '')) + 'T180000Z';

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${ev.id}@academic-erp.edu`);
      icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      icsContent.push(`DTSTART:${dtStart}`);
      icsContent.push(`DTEND:${dtEnd}`);
      icsContent.push(`SUMMARY:${ev.title.replace(/,/g, '\\,')}`);
      icsContent.push(`DESCRIPTION:${(ev.description || '').replace(/\n/g, '\\n')}`);
      icsContent.push(`LOCATION:${(ev.venue || 'Campus').replace(/,/g, '\\,')}`);
      icsContent.push(`CATEGORIES:${ev.category}`);
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Academic_Calendar_${year}_${monthNames[month]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newEv: AcademicCalendarEvent = {
      id: `cal-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      department: formData.department,
      venue: formData.venue.trim() || undefined,
      targetAudience: formData.targetAudience.trim(),
      responsibleLead: formData.responsibleLead.trim() || undefined,
      status: 'SCHEDULED',
      syncSource: 'MANUAL',
      description: formData.description.trim() || undefined,
      naacCriterion: formData.naacCriterion,
    };

    onAddEvent(newEv);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                NAAC &amp; ISO 21001 Synchronized
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Multi-Module Bridge
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Academic Year 2025–2026
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              Institutional Smart Academic Calendar &amp; Milestone Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Centralized institutional calendar with interactive monthly grid, semester progression timeline, and live automated synchronization with Exam Schedules, AAA Audits, and Campus Activities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncClick}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              Sync Exams &amp; Audits
            </button>

            <button
              onClick={handleExportICal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              Export iCal (.ics)
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Event
            </button>
          </div>
        </div>

        {syncFeedback && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {syncFeedback}
          </div>
        )}
      </div>

      {/* Control bar: Month Selector + Filters + View Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-100 min-w-[140px] text-center font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="EXAM">Examinations</option>
              <option value="AUDIT">AAA &amp; ISO Audits</option>
              <option value="SEMINAR_SYMPOSIUM">Seminars &amp; Symposiums</option>
              <option value="SPORTS_CULTURAL">Sports &amp; Cultural</option>
              <option value="SEMESTER_MILESTONE">Semester Milestones</option>
              <option value="HOLIDAY">Holidays &amp; Recess</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-lg p-1 ml-auto">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'MONTH'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'TIMELINE'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semester Timeline
            </button>
            <button
              onClick={() => setViewMode('AGENDA')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'AGENDA'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'MONTH' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/60 text-center py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            {daysOfWeek.map((d, i) => (
              <div key={d} className={i === 0 || i === 6 ? 'text-amber-400/80' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Monthly Day Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80 bg-slate-950/30">
            {/* Empty padding cells before first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-slate-950/50 opacity-40"></div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = year === 2026 && month === 8 && dayNum === 25; // 2026-09-25

              // Find events that fall on or include this date
              const dayEvents = filteredEvents.filter((ev) => {
                if (ev.endDate) {
                  return dateStr >= ev.startDate && dateStr <= ev.endDate;
                }
                return ev.startDate === dateStr;
              });

              return (
                <div
                  key={dayNum}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-800/30 ${
                    isToday ? 'bg-indigo-950/20 ring-1 ring-inset ring-indigo-500/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                        isToday
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-slate-400">
                        {dayEvents.length} events
                      </span>
                    )}
                  </div>

                  {/* Day Event Badges */}
                  <div className="space-y-1 overflow-y-auto max-h-[72px] pr-0.5">
                    {dayEvents.map((ev) => {
                      const style = getCategoryStyles(ev.category);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          title={`${ev.title} (${ev.department})`}
                          className={`p-1 rounded text-[10px] font-medium border truncate cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1 ${style.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}></span>
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Semester Timeline View */}
      {viewMode === 'TIMELINE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-400" />
                Academic Year 2025–2026 Semester Progression Roadmap
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Statutory milestones, exam windows, internal AAA audits, and scientific symposiums.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Total Milestones: <strong className="text-slate-200">{filteredEvents.length}</strong>
            </div>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-8 my-4">
            {filteredEvents.map((ev) => {
              const style = getCategoryStyles(ev.category);
              return (
                <div key={ev.id} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 ${style.dot} ring-4 ring-slate-900`}
                  ></div>

                  <div
                    onClick={() => setSelectedEvent(ev)}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${style.bg}`}>
                          {style.icon}
                          {style.label}
                        </span>
                        {ev.naacCriterion && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            NAAC Criterion {ev.naacCriterion}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                          Sync: {ev.syncSource}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {ev.startDate} {ev.endDate && `→ ${ev.endDate}`}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {ev.title}
                    </h3>

                    {ev.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>{ev.department}</span>
                      </div>
                      {ev.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{ev.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{ev.targetAudience}</span>
                      </div>
                      {ev.responsibleLead && (
                        <div className="text-indigo-400">
                          Lead: {ev.responsibleLead}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda Table View */}
      {viewMode === 'AGENDA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100">
              Institutional Master Schedule Register
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {filteredEvents.length} items logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date Range</th>
                  <th className="py-3 px-4">Event &amp; Scope</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department &amp; Lead</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">NAAC / Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredEvents.map((ev) => {
                  const style = getCategoryStyles(ev.category);
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {ev.startDate}
                        {ev.endDate && <div className="text-[10px] text-slate-500">to {ev.endDate}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{ev.title}</div>
                        <div className="text-[11px] text-slate-400">{ev.targetAudience}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${style.bg}`}>
                          {style.icon}
                          {style.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>{ev.department}</div>
                        {ev.responsibleLead && (
                          <span className="text-[10px] text-indigo-400">{ev.responsibleLead}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{ev.venue || 'Campus Wide'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {ev.naacCriterion && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 w-fit">
                              Criterion {ev.naacCriterion}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-500">{ev.syncSource}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Details Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getCategoryStyles(selectedEvent.category).bg}`}>
                  {selectedEvent.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Sync: {selectedEvent.syncSource}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <h3 className="text-lg font-bold text-slate-100">
                {selectedEvent.title}
              </h3>

              {selectedEvent.description && (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedEvent.description}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Date Range</div>
                  <div className="font-mono font-semibold mt-0.5">
                    {selectedEvent.startDate} {selectedEvent.endDate ? `→ ${selectedEvent.endDate}` : ''}
                  </div>
                </div>

                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Venue / Location</div>
                  <div className="font-semibold mt-0.5">{selectedEvent.venue || 'Campus Main Grounds'}</div>
                </div>

                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Department</div>
                  <div className="font-semibold mt-0.5 truncate">{selectedEvent.department}</div>
                </div>

                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Responsible Officer</div>
                  <div className="font-semibold mt-0.5 text-indigo-400">
                    {selectedEvent.responsibleLead || 'Institutional Office'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-500 text-[10px]">Target Audience</div>
                <div className="text-slate-200">{selectedEvent.targetAudience}</div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    onDeleteEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Delete Event
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Schedule Academic Event</h3>
                  <p className="text-xs text-slate-400">Add official milestone to the institutional calendar</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester OSCE Practical Examinations"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Event Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CalendarEventCategory })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="EXAM">Examination &amp; Assessment</option>
                    <option value="AUDIT">AAA / ISO Quality Audit</option>
                    <option value="SEMINAR_SYMPOSIUM">National Seminar / Symposium</option>
                    <option value="SPORTS_CULTURAL">Sports, Athletics &amp; Cultural</option>
                    <option value="SEMESTER_MILESTONE">Semester Milestone</option>
                    <option value="HOLIDAY">Recess &amp; Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Department Scope *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Campus Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Examination Complex - Block B"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Responsible Lead / Officer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Controller of Examinations"
                    value={formData.responsibleLead}
                    onChange={(e) => setFormData({ ...formData, responsibleLead: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Audience *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. All Registered B.Tech & B.Pharm Students"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description &amp; Operational Directives
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail instructions, syllabus scope, or compliance requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
