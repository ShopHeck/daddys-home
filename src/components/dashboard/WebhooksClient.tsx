"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { ConfirmModal } from '@/components/ConfirmModal';
import type { WebhookEvent } from '@/types';

type WebhookEndpointItem = {
  id: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type DeliveryItem = {
  id: string;
  event: WebhookEvent;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  responseStatus: number | null;
  createdAt: string;
  lastAttemptAt: string | null;
};

type DeliveryResponse = {
  deliveries: DeliveryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type CreateWebhookResponse = WebhookEndpointItem;

type DeliveryState = {
  loading: boolean;
  error: string;
  deliveries: DeliveryItem[];
  pagination: DeliveryResponse['pagination'] | null;
};

type WebhookFormModalProps = {
  mode: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  error: string;
  initialValue?: WebhookEndpointItem | null;
  onClose: () => void;
  onSubmit: (values: { url: string; events: WebhookEvent[]; active: boolean }) => Promise<void>;
};

const WEBHOOK_EVENT_OPTIONS: WebhookEvent[] = [
  'render.completed',
  'render.failed',
  'template.created',
  'template.updated',
  'template.deleted'
];

function truncateUrl(url: string, limit = 44) {
  if (url.length <= limit) {
    return url;
  }

  return `${url.slice(0, limit)}…`;
}

function maskSecret(secret: string) {
  return `wh_...${secret.slice(-8)}`;
}

function getStatusClasses(status: DeliveryItem['status']) {
  if (status === 'success') {
    return 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  }

  if (status === 'failed') {
    return 'border border-rose-500/30 bg-rose-500/10 text-rose-300';
  }

  return 'border border-amber-500/30 bg-amber-500/10 text-amber-300';
}

function WebhookFormModal({
  mode,
  open,
  loading,
  error,
  initialValue,
  onClose,
  onSubmit
}: WebhookFormModalProps) {
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) {
      return;
    }

    setUrl(initialValue?.url ?? '');
    setSelectedEvents(initialValue?.events ?? []);
    setActive(initialValue?.active ?? true);
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  const toggleEvent = (event: WebhookEvent) => {
    setSelectedEvents((current) => (
      current.includes(event)
        ? current.filter((item) => item !== event)
        : [...current, event]
    ));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ url, events: selectedEvents, active });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
        <h2 className="text-xl font-semibold text-white">{mode === 'create' ? 'Create webhook endpoint' : 'Edit webhook endpoint'}</h2>
        <p className="mt-2 text-sm text-slate-400">
          {mode === 'create'
            ? 'Send signed event notifications to your application in real time.'
            : 'Update the delivery target, subscribed events, and active status.'}
        </p>
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        <form className="mt-6 space-y-6" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block space-y-2 text-sm">
            <span className="text-slate-300">Endpoint URL</span>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/webhooks/docforge"
              value={url}
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-sm text-slate-300">Subscribed events</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {WEBHOOK_EVENT_OPTIONS.map((event) => {
                const checked = selectedEvents.includes(event);

                return (
                  <label
                    key={event}
                    className={[
                      'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition',
                      checked
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-100'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    ].join(' ')}
                  >
                    <input
                      checked={checked}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-blue-500 focus:ring-blue-500"
                      onChange={() => toggleEvent(event)}
                      type="checkbox"
                    />
                    <span>{event}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {mode === 'edit' ? (
            <label className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              <input
                checked={active}
                className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-blue-500 focus:ring-blue-500"
                onChange={(event) => setActive(event.target.checked)}
                type="checkbox"
              />
              <span>Endpoint is active</span>
            </label>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create endpoint' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type WebhooksClientProps = {
  tier: string;
};

export function WebhooksClient({ tier }: WebhooksClientProps) {
  const [endpoints, setEndpoints] = useState<WebhookEndpointItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState<WebhookEndpointItem | null>(null);
  const [secretReveal, setSecretReveal] = useState<CreateWebhookResponse | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliveryState, setDeliveryState] = useState<Record<string, DeliveryState>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const activeCount = useMemo(() => endpoints.filter((endpoint) => endpoint.active).length, [endpoints]);

  const loadEndpoints = async () => {
    setLoading(true);
    setError('');

    const response = await fetch('/api/dashboard/webhooks', { cache: 'no-store' });
    const payload = (await response.json().catch(() => null)) as WebhookEndpointItem[] | { error?: string } | null;

    if (!response.ok || !payload || !Array.isArray(payload)) {
      setError((payload as { error?: string } | null)?.error ?? 'Unable to load webhooks.');
      setLoading(false);
      return;
    }

    setEndpoints(payload);
    setLoading(false);
  };

  useEffect(() => {
    void loadEndpoints();
  }, []);

  const loadDeliveries = async (endpointId: string) => {
    setDeliveryState((current) => ({
      ...current,
      [endpointId]: {
        loading: true,
        error: '',
        deliveries: current[endpointId]?.deliveries ?? [],
        pagination: current[endpointId]?.pagination ?? null
      }
    }));

    const response = await fetch(`/api/dashboard/webhooks/${endpointId}/deliveries?page=1&pageSize=10`, {
      cache: 'no-store'
    });
    const payload = (await response.json().catch(() => null)) as DeliveryResponse | { error?: string } | null;

    if (!response.ok || !payload || !('deliveries' in payload)) {
      setDeliveryState((current) => ({
        ...current,
        [endpointId]: {
          loading: false,
          error: (payload as { error?: string } | null)?.error ?? 'Unable to load deliveries.',
          deliveries: [],
          pagination: null
        }
      }));
      return;
    }

    setDeliveryState((current) => ({
      ...current,
      [endpointId]: {
        loading: false,
        error: '',
        deliveries: payload.deliveries,
        pagination: payload.pagination
      }
    }));
  };

  const handleCreate = async (values: { url: string; events: WebhookEvent[]; active: boolean }) => {
    setSubmitting(true);
    setFormError('');

    const response = await fetch('/api/dashboard/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: values.url,
        events: values.events
      })
    });
    const payload = (await response.json().catch(() => null)) as CreateWebhookResponse | { error?: string } | null;

    if (!response.ok || !payload || Array.isArray(payload) || !('secret' in payload)) {
      setFormError((payload as { error?: string } | null)?.error ?? 'Unable to create webhook endpoint.');
      setSubmitting(false);
      return;
    }

    setEndpoints((current) => [
      {
        ...payload,
        secret: maskSecret(payload.secret)
      },
      ...current
    ]);
    setSecretReveal(payload);
    setCopiedSecret(false);
    setCreateOpen(false);
    setSubmitting(false);
  };

  const handleEdit = async (values: { url: string; events: WebhookEvent[]; active: boolean }) => {
    if (!editEndpoint) {
      return;
    }

    setSubmitting(true);
    setFormError('');

    const response = await fetch(`/api/dashboard/webhooks/${editEndpoint.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    const payload = (await response.json().catch(() => null)) as WebhookEndpointItem | { error?: string } | null;

    if (!response.ok || !payload || Array.isArray(payload) || !('id' in payload)) {
      setFormError((payload as { error?: string } | null)?.error ?? 'Unable to update webhook endpoint.');
      setSubmitting(false);
      return;
    }

    setEndpoints((current) => current.map((endpoint) => (endpoint.id === payload.id ? payload : endpoint)));
    setEditEndpoint(null);
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const response = await fetch(`/api/dashboard/webhooks/${id}`, { method: 'DELETE' });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? 'Unable to delete webhook endpoint.');
      setDeletingId(null);
      return;
    }

    setEndpoints((current) => current.filter((endpoint) => endpoint.id !== id));
    setDeliveryState((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (expandedId === id) {
      setExpandedId(null);
    }
    setConfirmDeleteId(null);
    setDeletingId(null);
  };

  const toggleEndpointActive = async (endpoint: WebhookEndpointItem) => {
    setUpdatingId(endpoint.id);
    setError('');

    const response = await fetch(`/api/dashboard/webhooks/${endpoint.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !endpoint.active })
    });
    const payload = (await response.json().catch(() => null)) as WebhookEndpointItem | { error?: string } | null;

    if (!response.ok || !payload || !('id' in payload)) {
      setError((payload as { error?: string } | null)?.error ?? 'Unable to update webhook status.');
      setUpdatingId(null);
      return;
    }

    setEndpoints((current) => current.map((item) => (item.id === payload.id ? payload : item)));
    setUpdatingId(null);
  };

  const toggleExpanded = async (endpointId: string) => {
    if (expandedId === endpointId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(endpointId);

    if (!deliveryState[endpointId] || deliveryState[endpointId]?.deliveries.length === 0) {
      await loadDeliveries(endpointId);
    }
  };

  const copySecret = async () => {
    if (!secretReveal) {
      return;
    }

    await navigator.clipboard.writeText(secretReveal.secret);
    setCopiedSecret(true);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    setFormError('');
  };

  const closeEditModal = () => {
    setEditEndpoint(null);
    setFormError('');
  };

  return (
    <div className="space-y-6 bg-slate-950 text-slate-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Webhooks</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Webhook endpoints</h1>
          <p className="mt-2 text-sm text-slate-300">Push signed notifications to your app when renders and template changes occur.</p>
        </div>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          onClick={() => {
            setFormError('');
            setCreateOpen(true);
          }}
          type="button"
        >
          Add webhook
        </button>
      </div>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-300">Total endpoints</p>
          <p className="mt-3 text-3xl font-semibold text-white">{endpoints.length}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-300">Active endpoints</p>
          <p className="mt-3 text-3xl font-semibold text-green-400">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <p className="text-sm text-slate-300">Supported events</p>
          <p className="mt-3 text-3xl font-semibold text-white">{WEBHOOK_EVENT_OPTIONS.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50">
        {loading ? (
          <div className="p-6 text-sm text-slate-300">Loading webhook endpoints...</div>
        ) : endpoints.length === 0 ? (
          <div className="p-6">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
              <h2 className="text-xl font-semibold text-white">No webhook endpoints yet</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Register an HTTPS endpoint to receive HMAC-signed notifications for render results and template lifecycle events.
              </p>
              <button
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                onClick={() => {
                  setFormError('');
                  setCreateOpen(true);
                }}
                type="button"
              >
                Create your first webhook
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Endpoint</th>
                  <th className="px-6 py-4 font-medium">Events</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Secret</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {endpoints.map((endpoint) => {
                  const deliveries = deliveryState[endpoint.id];

                  return (
                    <FragmentRow
                      deliveries={deliveries}
                      endpoint={endpoint}
                      expanded={expandedId === endpoint.id}
                      key={endpoint.id}
                      onDelete={() => setConfirmDeleteId(endpoint.id)}
                      onEdit={() => {
                        setFormError('');
                        setEditEndpoint(endpoint);
                      }}
                      onRefreshDeliveries={() => void loadDeliveries(endpoint.id)}
                      onToggleActive={() => void toggleEndpointActive(endpoint)}
                      onToggleExpanded={() => void toggleExpanded(endpoint.id)}
                      updating={updatingId === endpoint.id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Webhook limit upgrade prompt for FREE tier */}
      {tier === 'FREE' && endpoints.length >= 1 && (
        <p className="text-xs text-slate-400 mt-4">
          Free plan includes 1 webhook endpoint.{' '}
          <Link href="/dashboard/billing" className="text-blue-400 hover:text-blue-300">
            Upgrade to Pro
          </Link>{' '}
          for 5 endpoints.
        </p>
      )}

      <WebhookFormModal
        error={formError}
        loading={submitting}
        mode="create"
        onClose={closeCreateModal}
        onSubmit={handleCreate}
        open={createOpen}
      />

      <WebhookFormModal
        error={formError}
        initialValue={editEndpoint}
        loading={submitting}
        mode="edit"
        onClose={closeEditModal}
        onSubmit={handleEdit}
        open={Boolean(editEndpoint)}
      />

      {secretReveal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
            <h2 className="text-xl font-semibold text-white">Copy this secret now</h2>
            <p className="mt-2 text-sm text-amber-300">Copy this secret now. It won&apos;t be shown again.</p>
            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-slate-100">
              {secretReveal.secret}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                onClick={() => void copySecret()}
                type="button"
              >
                {copiedSecret ? 'Copied' : 'Copy secret'}
              </button>
              <button
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                onClick={() => setSecretReveal(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        confirmLabel="Delete"
        description="This endpoint and its delivery history will be removed immediately."
        loading={deletingId === confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => (confirmDeleteId ? void handleDelete(confirmDeleteId) : undefined)}
        open={Boolean(confirmDeleteId)}
        title="Delete webhook endpoint?"
        tone="danger"
      />
    </div>
  );
}

type FragmentRowProps = {
  endpoint: WebhookEndpointItem;
  expanded: boolean;
  updating: boolean;
  deliveries?: DeliveryState;
  onToggleExpanded: () => void;
  onRefreshDeliveries: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
};

function FragmentRow({
  endpoint,
  expanded,
  updating,
  deliveries,
  onToggleExpanded,
  onRefreshDeliveries,
  onEdit,
  onDelete,
  onToggleActive
}: FragmentRowProps) {
  return (
    <>
      <tr className="align-top">
        <td className="px-6 py-4">
          <div className="space-y-1">
            <p className="font-medium text-white" title={endpoint.url}>{truncateUrl(endpoint.url)}</p>
            <p className="text-xs text-slate-500">Updated {new Date(endpoint.updatedAt).toLocaleString()}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex max-w-md flex-wrap gap-2">
            {endpoint.events.map((event) => (
              <span key={event} className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-200">
                {event}
              </span>
            ))}
          </div>
        </td>
        <td className="px-6 py-4">
          <button
            className={[
              'inline-flex rounded-full px-3 py-1 text-xs font-medium transition',
              endpoint.active
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900'
            ].join(' ')}
            disabled={updating}
            onClick={onToggleActive}
            type="button"
          >
            {updating ? 'Saving...' : endpoint.active ? 'Active' : 'Inactive'}
          </button>
        </td>
        <td className="px-6 py-4 font-mono text-slate-300">{endpoint.secret}</td>
        <td className="px-6 py-4 text-slate-300">{new Date(endpoint.createdAt).toLocaleDateString()}</td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700" onClick={onToggleExpanded} type="button">
              {expanded ? 'Hide deliveries' : 'View deliveries'}
            </button>
            <button className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700" onClick={onEdit} type="button">
              Edit
            </button>
            <button className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10" onClick={onDelete} type="button">
              Delete
            </button>
          </div>
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td className="px-6 pb-6" colSpan={6}>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Recent deliveries</h3>
                  <p className="mt-1 text-xs text-slate-400">Latest attempts for this endpoint.</p>
                </div>
                <button className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700" onClick={onRefreshDeliveries} type="button">
                  Refresh
                </button>
              </div>
              {deliveries?.loading ? (
                <div className="mt-4 text-sm text-slate-300">Loading deliveries...</div>
              ) : deliveries?.error ? (
                <div className="mt-4 text-sm text-red-400">{deliveries.error}</div>
              ) : deliveries && deliveries.deliveries.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Event</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Attempts</th>
                        <th className="px-4 py-3 font-medium">Response</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                        <th className="px-4 py-3 font-medium">Last Attempt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {deliveries.deliveries.map((delivery) => (
                        <tr key={delivery.id}>
                          <td className="px-4 py-3">{delivery.event}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 font-medium ${getStatusClasses(delivery.status)}`}>
                              {delivery.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{delivery.attempts}</td>
                          <td className="px-4 py-3">{delivery.responseStatus ?? '—'}</td>
                          <td className="px-4 py-3">{new Date(delivery.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3">{delivery.lastAttemptAt ? new Date(delivery.lastAttemptAt).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-4 text-xs text-slate-500">
                    Showing {deliveries.deliveries.length} of {deliveries.pagination?.total ?? deliveries.deliveries.length} deliveries.
                  </p>
                </div>
              ) : (
                <div className="mt-4 text-sm text-slate-400">No deliveries recorded yet.</div>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
