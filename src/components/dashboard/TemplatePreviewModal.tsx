'use client';

import { useEffect, useState } from 'react';

import type { GalleryTemplate } from '@/lib/template-gallery';

const categoryLabels: Record<GalleryTemplate['category'], string> = {
  business: 'Business',
  education: 'Education',
  finance: 'Finance',
  freelance: 'Freelance',
  hr: 'HR',
  legal: 'Legal',
  shipping: 'Shipping',
};

type TemplatePreviewModalProps = {
  open: boolean;
  template: GalleryTemplate | null;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onUseTemplate: (template: GalleryTemplate) => void;
};

export function TemplatePreviewModal({
  open,
  template,
  loading = false,
  error = '',
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    if (!open || !template) {
      return;
    }

    let cancelled = false;

    const renderPreview = async () => {
      try {
        const { default: Handlebars } = await import('handlebars/dist/handlebars');

        if (cancelled) {
          return;
        }

        const compiled = Handlebars.compile(template.content);

        if (cancelled) {
          return;
        }

        setPreviewHtml(compiled(template.sampleData));
        setPreviewError('');
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPreviewHtml('');
        setPreviewError(error instanceof Error ? error.message : 'Preview failed.');
      }
    };

    void renderPreview();

    return () => {
      cancelled = true;
    };
  }, [open, template]);

  if (!open || !template) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 sm:px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[95dvh] sm:h-auto sm:max-h-[90vh] w-full sm:max-w-6xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-950/60"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header - compact on mobile */}
        <div className="shrink-0 border-b border-slate-700 px-4 py-3 sm:px-6 sm:py-5 md:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em] text-blue-200">
                  {categoryLabels[template.category]}
                </div>
              </div>
              <h2 className="mt-2 sm:mt-3 text-lg sm:text-2xl font-semibold text-white truncate">{template.name}</h2>
              <p className="mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-none max-w-3xl text-xs sm:text-sm leading-5 sm:leading-6 text-slate-300">
                {template.description}
              </p>
            </div>
            {/* Close button - always visible, top-right */}
            <button
              className="shrink-0 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 active:bg-slate-700"
              onClick={onClose}
              type="button"
              aria-label="Close preview"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview iframe - fills remaining space, scales content on mobile */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
          {error ? <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-rose-400">{error}</p> : null}
          {previewError ? <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-rose-400">{previewError}</p> : null}
          <div className="overflow-hidden rounded-lg sm:rounded-xl border border-slate-700 bg-white h-full min-h-[50vh] sm:min-h-0">
            <iframe
              className="h-full sm:h-[65vh] w-full"
              sandbox="allow-same-origin"
              srcDoc={
                previewHtml
                  ? `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{transform-origin:top left}@media(max-width:640px){body{transform:scale(0.55);width:182%}}</style></head><body>${previewHtml
                      .replace(/<html[^>]*>|<\/html>|<head[^>]*>.*?<\/head>/gs, '')
                      .replace(/<body[^>]*>/, '')
                      .replace(/<\/body>/, '')}</body></html>`
                  : '<html><body style="font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #64748b;">Unable to render preview.</body></html>'
              }
              title={`${template.name} preview`}
            />
          </div>
        </div>

        {/* Sticky bottom action bar on mobile */}
        <div className="shrink-0 border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4 md:px-8">
          <div className="flex gap-2 sm:gap-3">
            <button
              className="flex-1 sm:flex-none rounded-lg bg-slate-700 px-3 py-2.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-slate-200 transition hover:bg-slate-600 active:bg-slate-600"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
            <button
              className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-3 py-2.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-blue-500 active:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              onClick={() => onUseTemplate(template)}
              type="button"
            >
              {loading ? 'Creating...' : 'Use Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
