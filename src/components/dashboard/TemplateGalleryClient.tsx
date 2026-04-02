"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { TemplatePreviewModal } from '@/components/dashboard/TemplatePreviewModal';
import { templateGallery, type GalleryTemplate } from '@/lib/template-gallery';

type CategoryFilter = 'all' | GalleryTemplate['category'];

type CreatedTemplateResponse = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'All',
  business: 'Business',
  education: 'Education',
  finance: 'Finance',
  hr: 'HR',
  shipping: 'Shipping'
};

const categoryBadgeStyles: Record<GalleryTemplate['category'], string> = {
  business: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  education: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  finance: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  hr: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200',
  shipping: 'border-orange-500/30 bg-orange-500/10 text-orange-200'
};

const filters: CategoryFilter[] = ['all', 'business', 'finance', 'hr', 'education', 'shipping'];

export function TemplateGalleryClient() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<GalleryTemplate | null>(null);
  const [creatingSlug, setCreatingSlug] = useState<string | null>(null);
  const [error, setError] = useState('');

  const filteredTemplates = useMemo(
    () => templateGallery.filter((template) => activeFilter === 'all' || template.category === activeFilter),
    [activeFilter]
  );

  const handleUseTemplate = async (template: GalleryTemplate) => {
    setCreatingSlug(template.slug);
    setError('');

    const response = await fetch('/api/dashboard/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: template.name,
        description: template.description,
        content: template.content
      })
    });

    const payload = (await response.json().catch(() => null)) as CreatedTemplateResponse | { error?: string } | null;

    if (!response.ok || !payload || !('id' in payload)) {
      setError((payload as { error?: string } | null)?.error ?? 'Unable to create template.');
      setCreatingSlug(null);
      return;
    }

    router.push(`/dashboard/templates/${payload.id}/edit`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Templates</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Template Gallery</h1>
          <p className="mt-2 text-sm text-slate-400">Start with a professionally designed template.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/dashboard/templates">
            Back to Templates
          </Link>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = filter === activeFilter;

          return (
            <button
              key={filter}
              className={[
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'border-blue-500/40 bg-blue-500/15 text-blue-100'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700'
              ].join(' ')}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {categoryLabels[filter]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => (
          <article key={template.slug} className="flex h-full flex-col rounded-xl border border-slate-700 bg-slate-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${categoryBadgeStyles[template.category]}`}>
                  {categoryLabels[template.category]}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">{template.name}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-200">
                {template.name
                  .split(' ')
                  .slice(0, 2)
                  .map((segment) => segment[0])
                  .join('')}
              </div>
            </div>

            <p className="mt-4 max-h-[4.5rem] flex-1 overflow-hidden text-sm leading-6 text-slate-300">{template.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                onClick={() => setSelectedTemplate(template)}
                type="button"
              >
                Preview
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={creatingSlug !== null}
                onClick={() => void handleUseTemplate(template)}
                type="button"
              >
                {creatingSlug === template.slug ? 'Creating...' : 'Use Template'}
              </button>
            </div>
          </article>
        ))}
      </div>

      <TemplatePreviewModal
        error={selectedTemplate ? error : ""}
        loading={creatingSlug === selectedTemplate?.slug}
        onClose={() => setSelectedTemplate(null)}
        onUseTemplate={(template) => void handleUseTemplate(template)}
        open={Boolean(selectedTemplate)}
        template={selectedTemplate}
      />
    </div>
  );
}
