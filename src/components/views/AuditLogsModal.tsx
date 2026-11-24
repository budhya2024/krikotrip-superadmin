import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Code,
  Calendar,
  Activity,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAdminAuditLogsQuery } from '../../api/audit';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const [page, setPage] = useState<number>(1);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
  const [actorTypeFilter, setActorTypeFilter] = useState<
    'super_admin' | 'customer' | 'vendor_member' | 'system' | ''
  >('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { data, isLoading } = useAdminAuditLogsQuery({
    page,
    limit: 15,
    entityType: entityTypeFilter.trim() || undefined,
    actorType: actorTypeFilter || undefined,
  });

  if (!isOpen) return null;

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-5xl rounded-[4px] border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[4px] bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                System Audit Logs
              </h2>
              <p className="text-xs text-slate-500">
                Immutable activity trail of administrative and operational actions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by Entity Type (e.g. enquiry, package, vendor)..."
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={actorTypeFilter}
              onChange={(e) => {
                setActorTypeFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Actors</option>
              <option value="super_admin">Super Admin</option>
              <option value="customer">Customer</option>
              <option value="vendor_member">Vendor Member</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Loading audit records...
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="py-16 text-center">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No audit log entries found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Records will appear here as actions occur in the system.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.items.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-[4px] border text-xs transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-[4px] font-semibold text-[11px] ${
                            log.actorType === 'super_admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : log.actorType === 'system'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : log.actorType === 'vendor_member'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {log.actorType}
                        </span>

                        <span className="font-semibold text-slate-900 dark:text-white">
                          {log.action}
                        </span>

                        <span className="text-slate-400 font-mono text-[11px]">
                          [{log.entityType}:{log.entityId.slice(0, 8)}]
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                          })}
                        </span>
                        {log.changes && (
                          <button
                            onClick={() =>
                              setExpandedLogId(isExpanded ? null : log.id)
                            }
                            className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>{isExpanded ? 'Hide' : 'Changes'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && log.changes && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80">
                        <pre className="p-2.5 rounded-[4px] bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <span className="text-slate-500 font-medium">
            Showing Page {page} of {totalPages} ({data?.total ?? 0} Total Records)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded-[4px] border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded-[4px] border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
