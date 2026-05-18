'use client';

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
  freelance: 'Freelance',
  hr: 'HR',
  legal: 'Legal',
  shipping: 'Shipping',
};

const categoryBadgeStyles: Record<GalleryTemplate['category'], string> = {
  business: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  education: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  finance: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  freelance: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  hr: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200',
  legal: 'border-slate-400/30 bg-slate-400/10 text-slate-200',
  shipping: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
};

const filters: CategoryFilter[] = ['all', 'business', 'finance', 'freelance', 'legal', 'hr', 'education', 'shipping'];

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
        content: template.content,
      }),
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
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-blue-300">Templates</p>
          <h1 className="mt-2 sm:mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Template Gallery
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400">
            Start with a professionally designed template.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            className="rounded-lg bg-slate-700 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-200 transition hover:bg-slate-600 active:bg-slate-600"
            href="/dashboard/templates"
          >
            Back to Templates
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 sm:p-4 text-xs sm:text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Filter chips - horizontally scrollable on mobile */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-none">
          {filters.map((filter) => {
            const isActive = filter === activeFilter;

            return (
              <button
                key={filter}
                className={[
                  'shrink-0 rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition active:scale-95',
                  isActive
                    ? 'border-blue-500/40 bg-blue-500/15 text-blue-100'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700',
                ].join(' ')}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {categoryLabels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => (
          <article
            key={template.slug}
            className="flex h-full flex-col rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-6 transition-colors active:border-slate-600 sm:hover:border-slate-600"
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <div
                  className={`inline-flex rounded-full border px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] ${categoryBadgeStyles[template.category]}`}
                >
                  {categoryLabels[template.category]}
                </div>
                <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold text-white truncate">{template.name}</h2>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-xs sm:text-sm font-semibold text-blue-200">
                {template.name
                  .split(' ')
                  .slice(0, 2)
                  .map((segment) => segment[0])
                  .join('')}
              </div>
            </div>

            <p className="mt-3 sm:mt-4 line-clamp-3 flex-1 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-300">
              {template.description}
            </p>

            <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
              <button
                className="flex-1 sm:flex-none rounded-lg bg-slate-700 px-3 py-2.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-slate-200 transition hover:bg-slate-600 active:bg-slate-600"
                onClick={() => setSelectedTemplate(template)}
                type="button"
              >
                Preview
              </button>
              <button
                className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-3 py-2.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-blue-500 active:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
        error={selectedTemplate ? error : ''}
        loading={creatingSlug === selectedTemplate?.slug}
        onClose={() => setSelectedTemplate(null)}
        onUseTemplate={(template) => void handleUseTemplate(template)}
        open={Boolean(selectedTemplate)}
        template={selectedTemplate}
      />
    </div>
  );
}
