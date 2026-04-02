"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ConfirmModal } from '@/components/ConfirmModal';

type TemplateItem = {
  id: string;
  name: string;
  description: string | null;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
};

export function TemplatesClient() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');

    const response = await fetch('/api/dashboard/templates', { cache: 'no-store' });
    const payload = (await response.json().catch(() => null)) as TemplateItem[] | { error?: string } | null;

    if (!response.ok || !payload || !Array.isArray(payload)) {
      setError((payload as { error?: string } | null)?.error ?? 'Unable to load templates.');
      setLoading(false);
      return;
    }

    setTemplates(payload);
    setLoading(false);
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const response = await fetch(`/api/dashboard/templates/${id}`, { method: 'DELETE' });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? 'Unable to delete template.');
      setDeletingId(null);
      return;
    }

    setTemplates((current) => current.filter((template) => template.id !== id));
    setDeletingId(null);
    setConfirmingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Templates</h1>
          <p className="mt-2 text-sm text-slate-400">Manage your reusable HTML and Handlebars templates.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/dashboard/templates/gallery">
            Browse Gallery
          </Link>
          <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500" href="/dashboard/templates/new">
            New Template
          </Link>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-0">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="p-6">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
              <h2 className="text-xl font-semibold text-white">Get started with a pre-built template</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Browse professionally designed invoices, proposals, reports, labels, and more — then clone one into your account and customize it.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500" href="/dashboard/templates/gallery">
                  Browse Gallery
                </Link>
                <Link className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/dashboard/templates/new">
                  Start from Scratch
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
              <thead className="bg-slate-900/60 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Version</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Updated</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {templates.map((template) => (
                  <tr key={template.id} className="align-top">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{template.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400">v{template.currentVersion}</td>
                    <td className="px-6 py-4 text-slate-300">{template.description || '—'}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(template.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-400">{new Date(template.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-3">
                        <Link className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-600" href={`/dashboard/templates/${template.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10"
                          onClick={() => setConfirmingId(template.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        confirmLabel="Delete"
        description="This action cannot be undone."
        loading={deletingId === confirmingId}
        onCancel={() => setConfirmingId(null)}
        onConfirm={() => (confirmingId ? void handleDelete(confirmingId) : undefined)}
        open={Boolean(confirmingId)}
        title="Delete template?"
        tone="danger"
      />
    </div>
  );
}
