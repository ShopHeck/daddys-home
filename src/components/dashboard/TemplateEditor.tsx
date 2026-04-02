"use client";

import Handlebars from 'handlebars/dist/handlebars';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { CodeEditor } from '@/components/dashboard/CodeEditor';
import { extractVariables, mergeSchemas, type TemplateVariable, type VariableSchema } from '@/lib/template-variables-client';

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

const tabButtonClassName = 'rounded-lg px-3 py-1.5 text-sm font-medium transition';

type TemplateVersionListItem = {
  id: string;
  version: number;
  name: string;
  createdAt: string;
};

type DiffLine = {
  kind: 'added' | 'removed' | 'unchanged';
  value: string;
};

type TemplatePayload = {
  error?: string;
  id?: string;
  name?: string;
  description?: string | null;
  content?: string;
  variableSchema?: VariableSchema | null;
  currentVersion?: number;
};

function getVersionDiff(previousContent: string, currentContent: string) {
  const previousLines = previousContent.split('\n');
  const currentLines = currentContent.split('\n');
  const matrix = Array.from({ length: previousLines.length + 1 }, () => Array<number>(currentLines.length + 1).fill(0));

  for (let previousIndex = previousLines.length - 1; previousIndex >= 0; previousIndex -= 1) {
    for (let currentIndex = currentLines.length - 1; currentIndex >= 0; currentIndex -= 1) {
      if (previousLines[previousIndex] === currentLines[currentIndex]) {
        matrix[previousIndex][currentIndex] = matrix[previousIndex + 1][currentIndex + 1] + 1;
        continue;
      }

      matrix[previousIndex][currentIndex] = Math.max(matrix[previousIndex + 1][currentIndex], matrix[previousIndex][currentIndex + 1]);
    }
  }

  const diff: DiffLine[] = [];
  let previousIndex = 0;
  let currentIndex = 0;

  while (previousIndex < previousLines.length && currentIndex < currentLines.length) {
    if (previousLines[previousIndex] === currentLines[currentIndex]) {
      diff.push({ kind: 'unchanged', value: previousLines[previousIndex] });
      previousIndex += 1;
      currentIndex += 1;
      continue;
    }

    if (matrix[previousIndex + 1][currentIndex] >= matrix[previousIndex][currentIndex + 1]) {
      diff.push({ kind: 'removed', value: previousLines[previousIndex] });
      previousIndex += 1;
      continue;
    }

    diff.push({ kind: 'added', value: currentLines[currentIndex] });
    currentIndex += 1;
  }

  while (previousIndex < previousLines.length) {
    diff.push({ kind: 'removed', value: previousLines[previousIndex] });
    previousIndex += 1;
  }

  while (currentIndex < currentLines.length) {
    diff.push({ kind: 'added', value: currentLines[currentIndex] });
    currentIndex += 1;
  }

  return diff;
}

function setNestedValue(target: Record<string, unknown>, path: string[], value: unknown) {
  if (path.length === 0) {
    return;
  }

  let current = target;

  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    const existing = current[segment];

    if (!existing || typeof existing !== 'object' || Array.isArray(existing)) {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  current[path[path.length - 1]] = value;
}

function getSampleValue(variable: TemplateVariable): unknown {
  switch (variable.type) {
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'array': {
      if (!variable.children?.length) {
        return ['Example item'];
      }

      const item: Record<string, unknown> = {};

      variable.children.forEach((child) => {
        setNestedValue(item, child.path, getSampleValue(child));
      });

      return [item];
    }
    case 'object':
      return {};
    case 'string':
    case 'any':
    default:
      return `Example ${variable.path[variable.path.length - 1] ?? variable.name}`;
  }
}

function buildSampleDataFromSchema(schema: VariableSchema) {
  const sample: Record<string, unknown> = {};

  schema.variables.forEach((variable) => {
    setNestedValue(sample, variable.path, getSampleValue(variable));
  });

  return sample;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(defaultContent);
  const [sampleData, setSampleData] = useState(defaultSample);
  const [variableSchema, setVariableSchema] = useState<VariableSchema | null>(null);
  const [schemaModified, setSchemaModified] = useState(false);
  const [savingSchema, setSavingSchema] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewMode, setPreviewMode] = useState<'html' | 'pdf'>('html');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(templateId));
  const [saving, setSaving] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [renderError, setRenderError] = useState('');
  const [versions, setVersions] = useState<TemplateVersionListItem[]>([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [selectedVersionContent, setSelectedVersionContent] = useState<string | null>(null);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedVersionId) ?? null,
    [selectedVersionId, versions]
  );

  const selectedVersionDiff = useMemo(() => {
    if (selectedVersionContent === null) {
      return [];
    }

    return getVersionDiff(selectedVersionContent, content);
  }, [content, selectedVersionContent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const extracted = extractVariables(content);
        setVariableSchema((previous) => (previous ? mergeSchemas(extracted, previous) : extracted));
      } catch {
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    const loadTemplate = async () => {
      const response = await fetch(`/api/dashboard/templates/${templateId}`, { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as TemplatePayload | null;

      if (!response.ok || !payload?.name || !payload.content) {
        setError(payload?.error ?? 'Unable to load template.');
        setLoading(false);
        return;
      }

      setName(payload.name);
      setDescription(payload.description ?? '');
      setContent(payload.content);
      setVariableSchema(payload.variableSchema ?? null);
      setSchemaModified(false);
      setCurrentVersion(payload.currentVersion ?? 1);
      setLoading(false);
    };

    void loadTemplate();
  }, [templateId]);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    const loadVersions = async () => {
      setVersionsLoading(true);

      const response = await fetch(`/api/dashboard/templates/${templateId}/versions`, { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        currentVersion?: number;
        versions?: TemplateVersionListItem[];
      } | null;

      if (!response.ok || !payload?.versions) {
        setVersionsLoading(false);
        return;
      }

      setVersions(payload.versions);
      setCurrentVersion(payload.currentVersion ?? 1);
      setVersionsLoading(false);
    };

    void loadVersions();
  }, [templateId]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handlePreview = () => {
    try {
      const data = JSON.parse(sampleData) as Record<string, unknown>;
      const compiled = Handlebars.compile(content);
      setPreviewHtml(compiled(data));
      setPreviewError('');
      setPreviewMode('html');
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Preview failed.');
      setPreviewMode('html');
    }
  };

  const handleTestRender = async () => {
    setRendering(true);
    setRenderError('');
    setPreviewMode('pdf');
    setPdfUrl(null);

    try {
      const parsed = JSON.parse(sampleData);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Sample data must be a JSON object.');
      }

      const response = await fetch('/api/dashboard/templates/test-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, data: parsed })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setRenderError(payload?.error ?? 'Render failed');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : 'Render failed');
    } finally {
      setRendering(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch(templateId ? `/api/dashboard/templates/${templateId}` : '/api/dashboard/templates', {
      method: templateId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, content, variableSchema })
    });
    const payload = (await response.json().catch(() => null)) as TemplatePayload | null;

    if (!response.ok) {
      setError(payload?.error ?? 'Unable to save template.');
      setSaving(false);
      return;
    }

    if (!templateId && payload?.id) {
      router.push(`/dashboard/templates/${payload.id}/edit`);
      router.refresh();
      return;
    }

    if (templateId && payload) {
      setName(payload.name ?? name);
      setDescription(payload.description ?? '');
      setContent(payload.content ?? content);
      setVariableSchema(payload.variableSchema ?? variableSchema);
      setSchemaModified(false);
      setCurrentVersion(payload.currentVersion ?? currentVersion);
      setSelectedVersionId(null);
      setSelectedVersionContent(null);

      const versionsResponse = await fetch(`/api/dashboard/templates/${templateId}/versions`, { cache: 'no-store' });
      const versionsPayload = (await versionsResponse.json().catch(() => null)) as {
        currentVersion?: number;
        versions?: TemplateVersionListItem[];
      } | null;

      if (versionsResponse.ok && versionsPayload?.versions) {
        setVersions(versionsPayload.versions);
        setCurrentVersion(versionsPayload.currentVersion ?? payload.currentVersion ?? currentVersion);
      }
    }

    setSaving(false);
    router.refresh();
  };

  const handleViewVersion = async (versionId: string) => {
    if (!templateId) {
      return;
    }

    const response = await fetch(`/api/dashboard/templates/${templateId}/versions/${versionId}`, { cache: 'no-store' });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      content?: string;
    } | null;

    if (!response.ok || !payload?.content) {
      setError(payload?.error ?? 'Unable to load template version.');
      return;
    }

    setSelectedVersionId(versionId);
    setSelectedVersionContent(payload.content);
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!templateId) {
      return;
    }

    setRestoringVersionId(versionId);

    const response = await fetch(`/api/dashboard/templates/${templateId}/versions/${versionId}`, { method: 'POST' });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? 'Unable to restore template version.');
      setRestoringVersionId(null);
      return;
    }

    const [templateResponse, versionsResponse] = await Promise.all([
      fetch(`/api/dashboard/templates/${templateId}`, { cache: 'no-store' }),
      fetch(`/api/dashboard/templates/${templateId}/versions`, { cache: 'no-store' })
    ]);
    const templatePayload = (await templateResponse.json().catch(() => null)) as TemplatePayload | null;
    const versionsPayload = (await versionsResponse.json().catch(() => null)) as {
      currentVersion?: number;
      versions?: TemplateVersionListItem[];
    } | null;

    if (templateResponse.ok && templatePayload?.name && templatePayload.content) {
      setName(templatePayload.name);
      setDescription(templatePayload.description ?? '');
      setContent(templatePayload.content);
      setVariableSchema(templatePayload.variableSchema ?? null);
      setSchemaModified(false);
      setCurrentVersion(templatePayload.currentVersion ?? 1);
      setSelectedVersionId(null);
      setSelectedVersionContent(null);
    }

    if (versionsResponse.ok && versionsPayload?.versions) {
      setVersions(versionsPayload.versions);
      setCurrentVersion(versionsPayload.currentVersion ?? templatePayload?.currentVersion ?? 1);
    }

    setRestoringVersionId(null);
    router.refresh();
  };

  const updateVariable = (variableName: string, updater: (variable: TemplateVariable) => TemplateVariable) => {
    setVariableSchema((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        variables: previous.variables.map((variable) => (variable.name === variableName ? updater(variable) : variable))
      };
    });
    setSchemaModified(true);
  };

  const handleSaveVariableSchema = async () => {
    if (!templateId || !variableSchema) {
      return;
    }

    setSavingSchema(true);
    setError('');

    const response = await fetch(`/api/dashboard/templates/${templateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variableSchema })
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; variableSchema?: VariableSchema } | null;

    if (!response.ok || !payload?.variableSchema) {
      setError(payload?.error ?? 'Unable to save variable descriptions.');
      setSavingSchema(false);
      return;
    }

    setVariableSchema(payload.variableSchema);
    setSchemaModified(false);
    setSavingSchema(false);
  };

  const handleGenerateSampleData = () => {
    if (!variableSchema) {
      return;
    }

    setSampleData(JSON.stringify(buildSampleDataFromSchema(variableSchema), null, 2));
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
              <p className="mb-2 block text-sm font-medium text-slate-200">Content</p>
              <CodeEditor className="min-h-[460px]" language="html" onChange={setContent} value={content} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" onClick={handlePreview} type="button">
                Preview HTML
              </button>
              <button
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={rendering}
                onClick={handleTestRender}
                type="button"
              >
                {rendering ? 'Rendering PDF...' : 'Test Render PDF'}
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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Preview data</h2>
                  <p className="mt-2 text-sm text-slate-400">Edit the sample JSON used in the preview iframe and PDF test render.</p>
                </div>
                {variableSchema && variableSchema.variables.length > 0 ? (
                  <button
                    className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-600"
                    onClick={handleGenerateSampleData}
                    type="button"
                  >
                    Generate from variables
                  </button>
                ) : null}
              </div>
              <CodeEditor className="mt-4 min-h-52" language="json" onChange={setSampleData} value={sampleData} />
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Variables</h2>
                {variableSchema ? <span className="text-xs text-slate-400">{variableSchema.variables.length} detected</span> : null}
              </div>
              <p className="mt-2 text-sm text-slate-400">Auto-detected from your template. Edit descriptions and required flags.</p>

              {variableSchema && variableSchema.variables.length > 0 ? (
                <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
                  {variableSchema.variables.map((variable) => (
                    <div key={variable.name} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-medium text-blue-300">{variable.name}</code>
                          <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            {variable.type}
                          </span>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-slate-400">
                          <input
                            checked={variable.required}
                            className="rounded border-slate-600"
                            onChange={(event) => updateVariable(variable.name, (current) => ({ ...current, required: event.target.checked }))}
                            type="checkbox"
                          />
                          Required
                        </label>
                      </div>
                      <input
                        className="mt-2 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
                        onChange={(event) => updateVariable(variable.name, (current) => ({ ...current, description: event.target.value }))}
                        placeholder="Add a description..."
                        type="text"
                        value={variable.description}
                      />
                      {variable.type === 'array' && variable.children && variable.children.length > 0 ? (
                        <div className="ml-3 mt-3 space-y-2 border-l border-slate-700 pl-3">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Item fields</span>
                          {variable.children.map((child) => (
                            <div key={child.name} className="rounded border border-slate-700 bg-slate-950/50 p-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <code className="text-xs text-slate-300">{child.name}</code>
                                  <span className="rounded bg-slate-700 px-1 py-0.5 text-[10px] text-slate-500">{child.type}</span>
                                </div>
                                <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <input
                                    checked={child.required}
                                    className="rounded border-slate-600"
                                    onChange={(event) =>
                                      updateVariable(variable.name, (current) => ({
                                        ...current,
                                        children: current.children?.map((item) =>
                                          item.name === child.name ? { ...item, required: event.target.checked } : item
                                        )
                                      }))
                                    }
                                    type="checkbox"
                                  />
                                  Required
                                </label>
                              </div>
                              <input
                                className="mt-2 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500"
                                onChange={(event) =>
                                  updateVariable(variable.name, (current) => ({
                                    ...current,
                                    children: current.children?.map((item) =>
                                      item.name === child.name ? { ...item, description: event.target.value } : item
                                    )
                                  }))
                                }
                                placeholder="Add a field description..."
                                type="text"
                                value={child.description}
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">{content.trim() ? 'No variables detected.' : 'Start typing to detect variables.'}</p>
              )}

              {schemaModified && templateId ? (
                <button
                  className="mt-3 w-full rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={savingSchema}
                  onClick={() => void handleSaveVariableSchema()}
                  type="button"
                >
                  {savingSchema ? 'Saving variable descriptions...' : 'Save variable descriptions'}
                </button>
              ) : null}
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">Preview</h2>
                <div className="flex gap-2">
                  <button
                    className={`${tabButtonClassName} ${previewMode === 'html' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    onClick={() => setPreviewMode('html')}
                    type="button"
                  >
                    HTML
                  </button>
                  <button
                    className={`${tabButtonClassName} ${previewMode === 'pdf' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    onClick={() => setPreviewMode('pdf')}
                    type="button"
                  >
                    PDF
                  </button>
                </div>
              </div>

              {previewMode === 'html' ? (
                <>
                  {previewError ? <p className="mt-3 text-sm text-rose-400">{previewError}</p> : null}
                  <div className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-white">
                    <iframe
                      className="h-[420px] w-full"
                      sandbox="allow-same-origin"
                      srcDoc={previewHtml || '<html><body style="font-family: Arial; padding: 24px; color: #64748b;">Click Preview HTML to render this template.</body></html>'}
                      title="Template HTML preview"
                    />
                  </div>
                </>
              ) : (
                <>
                  {renderError ? <p className="mt-3 text-sm text-rose-400">{renderError}</p> : null}
                  <div className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-white">
                    {pdfUrl ? (
                      <iframe className="h-[420px] w-full" src={pdfUrl} title="Template PDF preview" />
                    ) : (
                      <div className="flex h-[420px] items-center justify-center px-6 text-center text-sm text-slate-500">
                        {rendering ? 'Rendering PDF preview...' : 'Click Test Render PDF to generate an inline server-rendered PDF preview.'}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {templateId ? (
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setShowVersionHistory((current) => !current)}
                  type="button"
                >
                  <h2 className="text-lg font-semibold text-white">Version History</h2>
                  <span className="text-sm text-slate-400">
                    {showVersionHistory ? '▾' : '▸'} v{currentVersion}
                  </span>
                </button>

                {showVersionHistory ? (
                  <div className="mt-4 space-y-2">
                    {versionsLoading ? (
                      <p className="text-sm text-slate-400">Loading versions...</p>
                    ) : versions.length === 0 ? (
                      <p className="text-sm text-slate-400">No version history available.</p>
                    ) : (
                      <div className="max-h-72 space-y-2 overflow-y-auto">
                        {versions.map((version) => (
                          <div
                            key={version.id}
                            className={`rounded-lg border p-3 text-sm ${
                              version.version === currentVersion
                                ? 'border-blue-500/40 bg-blue-500/10'
                                : 'border-slate-700 bg-slate-900/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <span className="font-medium text-white">v{version.version}</span>
                                {version.version === currentVersion ? <span className="ml-2 text-xs text-blue-300">(current)</span> : null}
                              </div>
                              <span className="text-xs text-slate-400">{new Date(version.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-1 truncate text-xs text-slate-400">{version.name}</p>
                            {version.version !== currentVersion ? (
                              <div className="mt-2 flex gap-2">
                                <button
                                  className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-600"
                                  onClick={() => void handleViewVersion(version.id)}
                                  type="button"
                                >
                                  View diff
                                </button>
                                <button
                                  className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500 disabled:opacity-60"
                                  disabled={restoringVersionId !== null}
                                  onClick={() => void handleRestoreVersion(version.id)}
                                  type="button"
                                >
                                  {restoringVersionId === version.id ? 'Restoring...' : 'Restore'}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedVersionContent !== null ? (
                      <div className="mt-4 rounded-lg border border-slate-600 bg-slate-900 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-white">Version {selectedVersion?.version} diff</p>
                            <p className="mt-1 text-xs text-slate-400">Comparing the selected snapshot against the current editor state.</p>
                          </div>
                          <button
                            className="text-xs text-slate-400 hover:text-white"
                            onClick={() => {
                              setSelectedVersionId(null);
                              setSelectedVersionContent(null);
                            }}
                            type="button"
                          >
                            Close
                          </button>
                        </div>
                        <div className="mt-3 max-h-60 overflow-auto rounded bg-slate-950 p-3 text-xs">
                          {selectedVersionDiff.length === 0 ? (
                            <p className="text-slate-300">No differences.</p>
                          ) : (
                            <div className="space-y-1 font-mono">
                              {selectedVersionDiff.map((line, index) => (
                                <div
                                  key={`${line.kind}-${index}-${line.value}`}
                                  className={
                                    line.kind === 'added'
                                      ? 'bg-emerald-500/10 text-emerald-300'
                                      : line.kind === 'removed'
                                        ? 'bg-rose-500/10 text-rose-300'
                                        : 'text-slate-400'
                                  }
                                >
                                  <span className="mr-2 inline-block w-4 text-center">
                                    {line.kind === 'added' ? '+' : line.kind === 'removed' ? '-' : ' '}
                                  </span>
                                  <span className="whitespace-pre-wrap break-words">{line.value || ' '}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
