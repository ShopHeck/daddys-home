"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type TemplateOption = {
  id: string;
  name: string;
};

type RenderHistoryRecord = {
  id: string;
  status: 'SUCCESS' | 'FAILED';
  durationMs: number | null;
  fileSizeBytes: number | null;
  errorMessage: string | null;
  createdAt: string;
  templateName: string | null;
  templateId: string | null;
  apiKeyName: string | null;
  apiKeyPrefix: string | null;
};

type RenderHistoryResponse = {
  records: RenderHistoryRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type SortField = 'createdAt' | 'durationMs' | 'fileSizeBytes';
type SortOrder = 'asc' | 'desc';
type StatusFilter = '' | 'SUCCESS' | 'FAILED';

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function truncateError(message: string | null, limit = 64) {
  if (!message) {
    return '—';
  }

  if (message.length <= limit) {
    return message;
  }

  return `${message.slice(0, limit)}…`;
}

function getSortIndicator(active: boolean, order: SortOrder) {
  if (!active) {
    return '↕';
  }

  return order === 'asc' ? '↑' : '↓';
}

export function RenderHistoryClient() {
  const [records, setRecords] = useState<RenderHistoryRecord[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [pagination, setPagination] = useState<RenderHistoryResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [templateId, setTemplateId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);

      const response = await fetch('/api/dashboard/templates', { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as
        | Array<{ id: string; name: string }>
        | { error?: string }
        | null;

      if (!response.ok || !payload || !Array.isArray(payload)) {
        setError((payload as { error?: string } | null)?.error ?? 'Unable to load render history.');
        setTemplatesLoading(false);
        return;
      }

      setTemplates(payload.map((template) => ({ id: template.id, name: template.name })));
      setTemplatesLoading(false);
    };

    void loadTemplates();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadRenderHistory = async () => {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: String(page),
        pageSize: '20',
        sortBy,
        sortOrder
      });

      if (status) {
        params.set('status', status);
      }

      if (templateId) {
        params.set('templateId', templateId);
      }

      if (from) {
        params.set('from', from);
      }

      if (to) {
        params.set('to', to);
      }

      const response = await fetch(`/api/dashboard/render-history?${params.toString()}`, {
        cache: 'no-store',
        signal: controller.signal
      }).catch((requestError) => requestError);

      if (response instanceof Error) {
        if (response.name !== 'AbortError') {
          setError('Unable to load render history.');
          setLoading(false);
        }

        return;
      }

      const payload = (await response.json().catch(() => null)) as RenderHistoryResponse | { error?: string } | null;

      if (!response.ok || !payload || !('records' in payload) || !('pagination' in payload)) {
        setError((payload as { error?: string } | null)?.error ?? 'Unable to load render history.');
        setLoading(false);
        return;
      }

      setRecords(payload.records);
      setPagination(payload.pagination);
      setExpandedErrors({});
      setLoading(false);
    };

    void loadRenderHistory();

    return () => controller.abort();
  }, [from, page, sortBy, sortOrder, status, templateId, to]);

  const averageDuration = useMemo(() => {
    const durations = records.map((record) => record.durationMs).filter((value): value is number => value !== null && value !== undefined);

    if (durations.length === 0) {
      return '—';
    }

    return formatDuration(Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length));
  }, [records]);

  const successRate = useMemo(() => {
    if (records.length === 0) {
      return '—';
    }

    const successCount = records.filter((record) => record.status === 'SUCCESS').length;

    return `${((successCount / records.length) * 100).toFixed(1)}%`;
  }, [records]);

  const clearFilters = () => {
    setStatus('');
    setTemplateId('');
    setFrom('');
    setTo('');
    setPage(1);
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const toggleSort = (field: SortField) => {
    setPage(1);

    if (field === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
  };

  const toggleExpandedError = (recordId: string) => {
    setExpandedErrors((current) => ({
      ...current,
      [recordId]: !current[recordId]
    }));
  };

  if (loading && !pagination) {
    return <div className="text-sm text-slate-400">Loading render history...</div>;
  }

  if (error && !pagination) {
    return <div className="text-sm text-rose-400">{error}</div>;
  }

  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Render History</h1>
        <p className="mt-2 text-sm text-slate-400">Inspect render outcomes, durations, payload sizes, and API key usage.</p>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Status</span>
            <select
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                setPage(1);
              }}
              value={status}
            >
              <option value="">All</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-300">Template</span>
            <select
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={templatesLoading}
              onChange={(event) => {
                setTemplateId(event.target.value);
                setPage(1);
              }}
              value={templateId}
            >
              <option value="">{templatesLoading ? 'Loading templates...' : 'All templates'}</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-300">From</span>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              type="date"
              value={from}
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-300">To</span>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              type="date"
              value={to}
            />
          </label>

          <div className="flex items-end">
            <button
              className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400">Total renders</p>
          <p className="mt-2 text-2xl font-semibold text-white">{pagination?.total.toLocaleString() ?? '0'}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400">Average duration</p>
          <p className="mt-2 text-2xl font-semibold text-white">{averageDuration}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400">Success rate</p>
          <p className="mt-2 text-2xl font-semibold text-white">{successRate}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading render history...</div>
        ) : records.length === 0 ? (
          <div className="p-6">
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
              <p className="text-lg font-semibold text-white">No renders yet.</p>
              <p className="mt-2 text-sm text-slate-300">Use the API to generate your first document.</p>
              <Link className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500" href="/docs">
                Read the docs
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Template</th>
                    <th className="px-6 py-4 font-medium">API Key</th>
                    <th className="px-6 py-4 font-medium">
                      <button className="inline-flex items-center gap-2 text-left hover:text-white" onClick={() => toggleSort('durationMs')} type="button">
                        <span>Duration</span>
                        <span className={sortBy === 'durationMs' ? 'text-blue-300' : 'text-slate-500'}>{getSortIndicator(sortBy === 'durationMs', sortOrder)}</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 font-medium">
                      <button className="inline-flex items-center gap-2 text-left hover:text-white" onClick={() => toggleSort('fileSizeBytes')} type="button">
                        <span>File Size</span>
                        <span className={sortBy === 'fileSizeBytes' ? 'text-blue-300' : 'text-slate-500'}>{getSortIndicator(sortBy === 'fileSizeBytes', sortOrder)}</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 font-medium">Error</th>
                    <th className="px-6 py-4 font-medium">
                      <button className="inline-flex items-center gap-2 text-left hover:text-white" onClick={() => toggleSort('createdAt')} type="button">
                        <span>Date</span>
                        <span className={sortBy === 'createdAt' ? 'text-blue-300' : 'text-slate-500'}>{getSortIndicator(sortBy === 'createdAt', sortOrder)}</span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {records.map((record) => {
                    const isExpanded = expandedErrors[record.id];

                    return (
                      <tr key={record.id} className="align-top">
                        <td className="px-6 py-4">
                          {record.status === 'SUCCESS' ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">SUCCESS</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-rose-500/10 text-rose-400">FAILED</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{record.templateName ?? '—'}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {record.apiKeyName && record.apiKeyPrefix ? `${record.apiKeyName} (${record.apiKeyPrefix}...)` : '—'}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{formatDuration(record.durationMs)}</td>
                        <td className="px-6 py-4 text-slate-300">{formatFileSize(record.fileSizeBytes)}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {record.errorMessage ? (
                            <button
                              className="max-w-xs text-left text-slate-300 underline decoration-slate-600 underline-offset-4 transition hover:text-white"
                              onClick={() => toggleExpandedError(record.id)}
                              title={record.errorMessage}
                              type="button"
                            >
                              {isExpanded ? record.errorMessage : truncateError(record.errorMessage)}
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400">{new Date(record.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-700 px-6 py-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Page {pagination?.page ?? 1} of {totalPages} · {pagination?.total.toLocaleString() ?? '0'} total
              </p>
              <div className="flex gap-3">
                <button
                  className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-200 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={(pagination?.page ?? 1) <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-200 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={(pagination?.page ?? 1) >= totalPages}
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
