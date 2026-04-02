"use client";

import { useEffect, useState } from 'react';

import { ConfirmModal } from '@/components/ConfirmModal';

type ApiKeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

type CreateResponse = {
  id: string;
  name: string;
  keyPrefix: string;
  key: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<CreateResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = async () => {
    setLoading(true);
    setError('');

    const response = await fetch('/api/dashboard/api-keys', { cache: 'no-store' });
    const payload = (await response.json().catch(() => null)) as ApiKeyItem[] | { error?: string } | null;

    if (!response.ok || !payload || !Array.isArray(payload)) {
      setError((payload as { error?: string } | null)?.error ?? 'Unable to load API keys.');
      setLoading(false);
      return;
    }

    setKeys(payload);
    setLoading(false);
  };

  useEffect(() => {
    void loadKeys();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newKeyName.trim()) {
      setError('API key name is required.');
      return;
    }

    setIsCreating(true);
    setError('');

    const response = await fetch('/api/dashboard/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName })
    });
    const payload = (await response.json().catch(() => null)) as CreateResponse | { error?: string } | null;

    if (!response.ok || !payload || Array.isArray(payload) || !('key' in payload)) {
      setError((payload as { error?: string } | null)?.error ?? 'Unable to generate API key.');
      setIsCreating(false);
      return;
    }

    setKeys((current) => [
      {
        id: payload.id,
        name: payload.name,
        keyPrefix: payload.keyPrefix,
        createdAt: payload.createdAt,
        lastUsedAt: payload.lastUsedAt
      },
      ...current
    ]);
    setGeneratedKey(payload);
    setIsCreateOpen(false);
    setIsRevealOpen(true);
    setNewKeyName('');
    setCopied(false);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const response = await fetch(`/api/dashboard/api-keys/${id}`, { method: 'DELETE' });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? 'Unable to delete API key.');
      setDeletingId(null);
      return;
    }

    setKeys((current) => current.filter((key) => key.id !== id));
    setConfirmDeleteId(null);
    setDeletingId(null);
  };

  const copyKey = async () => {
    if (!generatedKey) {
      return;
    }

    await navigator.clipboard.writeText(generatedKey.key);
    setCopied(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">API Keys</h1>
          <p className="mt-2 text-sm text-slate-400">Create scoped keys for your backend services and automation jobs.</p>
        </div>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          Generate New Key
        </button>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-0">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading API keys...</div>
        ) : keys.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">No API keys yet. Generate your first key to call the DocForge API.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
              <thead className="bg-slate-900/60 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Key Prefix</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Last Used</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 font-medium text-white">{key.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{key.keyPrefix}...</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(key.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10"
                        onClick={() => setConfirmDeleteId(key.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-2xl shadow-slate-950/50">
            <h2 className="text-lg font-semibold text-white">Generate new API key</h2>
            <p className="mt-2 text-sm text-slate-400">Give this key a recognizable name for auditing and rotation.</p>
            <form className="mt-6 space-y-4" onSubmit={handleCreate}>
              <input
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500"
                onChange={(event) => setNewKeyName(event.target.value)}
                placeholder="Production backend"
                value={newKeyName}
              />
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                  onClick={() => setIsCreateOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60"
                  disabled={isCreating}
                  type="submit"
                >
                  {isCreating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isRevealOpen && generatedKey ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-2xl shadow-slate-950/50">
            <h2 className="text-lg font-semibold text-white">Copy your API key now</h2>
            <p className="mt-2 text-sm text-amber-300">This key won't be shown again. Copy it now.</p>
            <div className="mt-6 rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-200">{generatedKey.key}</div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                onClick={() => void copyKey()}
                type="button"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                onClick={() => setIsRevealOpen(false)}
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
        description="Any service using this key will lose access immediately."
        loading={deletingId === confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId ? void handleDelete(confirmDeleteId) : undefined}
        open={Boolean(confirmDeleteId)}
        title="Delete API key?"
        tone="danger"
      />
    </div>
  );
}
