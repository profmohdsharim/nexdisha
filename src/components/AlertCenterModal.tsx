import React, { useState } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Building,
  Check,
  Filter,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { TriggerAlertEvent } from '../types';

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: TriggerAlertEvent[];
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onNavigateToModule?: (target: string) => void;
  onOpenTriggerConfig?: () => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onResolve,
  onNavigateToModule,
  onOpenTriggerConfig,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => a.status === 'UNREAD').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> WARNING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300">
            Unread
          </span>
        );
      case 'ACKNOWLEDGED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300">
            Acknowledged
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300">
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Institutional Notification &amp; Trigger Alert Center
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Automated threshold monitoring for NAAC score drops, departmental budget overruns &amp; statutory compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTriggerConfig && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTriggerConfig();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Configure Triggers
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary metric banner */}
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">Total Recorded Alerts</div>
            <div className="text-base font-bold text-slate-100">{alerts.length}</div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">Active Critical Triggers</div>
            <div className="text-base font-bold text-rose-400">{criticalCount}</div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">Unread Escalations</div>
            <div className="text-base font-bold text-amber-400">{unreadCount}</div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">Delivery Channel</div>
            <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Banner &amp; Log
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Filter by:</span>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="INFO">Info Only</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNREAD">Unread Only</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-slate-200">{filteredAlerts.length}</strong> of {alerts.length} events
          </div>
        </div>

        {/* Alerts list */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-400/50 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-200">All Metrics Within Specified Thresholds</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active trigger violations found matching your current filter criteria.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.status === 'UNREAD'
                    ? alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                      <span className="text-xs font-bold text-slate-200">
                        {alert.ruleName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {alert.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>Scope: <strong className="text-slate-300">{alert.department}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{alert.triggeredAt}</span>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300">
                        Value: <strong>{alert.currentValue}{alert.unit}</strong> (Trigger: {alert.thresholdValue}{alert.unit})
                      </div>
                      {alert.acknowledgedBy && (
                        <div className="text-amber-400/90 text-[11px]">
                          Ack by: {alert.acknowledgedBy}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {alert.actionUrl && onNavigateToModule && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToModule(alert.actionUrl!);
                        }}
                        className="px-2.5 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Inspect Module
                      </button>
                    )}

                    {alert.status === 'UNREAD' && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3 text-amber-400" />
                        Acknowledge
                      </button>
                    )}

                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => onResolve(alert.id)}
                        className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Rules adhere to HOD &amp; Principal governance protocol (ISO 21001 Clause 9.1)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
