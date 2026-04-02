"use client";

import Handlebars from 'handlebars/dist/handlebars';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type TemplateEditorProps = {
  templateId?: string;
};

const defaultContent = `<html>
  <body style="font-family: Inter, Arial, sans-serif; padding: 40px; color: #0f172a;">
    <h1>Invoice {{invoiceNumber}}</h1>
    <p>Customer: {{customer.name}}</p>
    <ul>
      {{#each items}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
    <p>Total: {{total}}</p>
  </body>
</html>`;

const defaultSample = `{
  "invoiceNumber": "INV-2026-001",
  "customer": { "name": "Acme Inc." },
  "items": ["Design Retainer", "Integration Work"],
  "total": "$2,550.00"
}`;

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(defaultContent);
  const [sampleData, setSampleData] = useState(defaultSample);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(Boolean(templateId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    if (!templateId) {
      return;
    }

    const loadTemplate = async () => {
      const response = await fetch(`/api/dashboard/templates/${templateId}`, { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        name?: string;
        description?: string | null;
        content?: string;
      } | null;

      if (!response.ok || !payload?.name || !payload.content) {
        setError(payload?.error ?? 'Unable to load template.');
        setLoading(false);
        return;
      }

      setName(payload.name);
      setDescription(payload.description ?? '');
      setContent(payload.content);
      setLoading(false);
    };

    void loadTemplate();
  }, [templateId]);

  const handlePreview = () => {
    try {
      const data = JSON.parse(sampleData) as Record<string, unknown>;
      const compiled = Handlebars.compile(content);
      setPreviewHtml(compiled(data));
      setPreviewError('');
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Preview failed.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch(templateId ? `/api/dashboard/templates/${templateId}` : '/api/dashboard/templates', {
      method: templateId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, content })
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? 'Unable to save template.');
      setSaving(false);
      return;
    }

    router.push('/dashboard/templates');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{templateId ? 'Edit Template' : 'New Template'}</h1>
          <p className="mt-2 text-sm text-slate-400">Build reusable HTML and Handlebars templates for render requests.</p>
        </div>
        <Link className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/dashboard/templates">
          Back
        </Link>
      </div>

      {loading ? <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-sm text-slate-300">Loading template...</div> : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      {!loading ? (
        <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
          <div className="space-y-6 rounded-lg border border-slate-700 bg-slate-800 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="template-name">
                Name
              </label>
              <input
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500"
                id="template-name"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="template-description">
                Description
              </label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500"
                id="template-description"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="template-content">
                Content
              </label>
              <textarea
                className="min-h-[460px] w-full rounded-lg border border-slate-600 bg-slate-950 p-4 font-mono text-sm text-slate-100 focus:ring-2 focus:ring-blue-500"
                id="template-content"
                onChange={(event) => setContent(event.target.value)}
                spellCheck={false}
                value={content}
              />
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" onClick={handlePreview} type="button">
                Preview
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? 'Saving...' : 'Save template'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white">Preview data</h2>
              <p className="mt-2 text-sm text-slate-400">Edit the sample JSON used in the preview iframe.</p>
              <textarea
                className="mt-4 min-h-52 w-full rounded-lg border border-slate-600 bg-slate-950 p-4 font-mono text-sm text-slate-100 focus:ring-2 focus:ring-blue-500"
                onChange={(event) => setSampleData(event.target.value)}
                spellCheck={false}
                value={sampleData}
              />
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white">Rendered preview</h2>
              {previewError ? <p className="mt-3 text-sm text-rose-400">{previewError}</p> : null}
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-white">
                <iframe className="h-[420px] w-full" srcDoc={previewHtml || '<html><body style="font-family: Arial; padding: 24px; color: #64748b;">Click preview to render this template.</body></html>'} title="Template preview" />
              </div>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
