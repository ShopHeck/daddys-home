"use client";

import Handlebars from 'handlebars/dist/handlebars';
import { useEffect, useState } from 'react';

import type { GalleryTemplate } from '@/lib/template-gallery';

const categoryLabels: Record<GalleryTemplate['category'], string> = {
  business: 'Business',
  education: 'Education',
  finance: 'Finance',
  hr: 'HR',
  shipping: 'Shipping'
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
  onUseTemplate
}: TemplatePreviewModalProps) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    if (!open || !template) {
      return;
    }

    try {
      const compiled = Handlebars.compile(template.content);
      setPreviewHtml(compiled(template.sampleData));
      setPreviewError('');
    } catch (error) {
      setPreviewHtml('');
      setPreviewError(error instanceof Error ? error.message : 'Preview failed.');
    }
  }, [open, template]);

  if (!open || !template) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-950/60"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-700 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-blue-200">
                {categoryLabels[template.category]}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white">{template.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{template.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
                onClick={onClose}
                type="button"
              >
                Close
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                onClick={() => onUseTemplate(template)}
                type="button"
              >
                {loading ? 'Creating...' : 'Use Template'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {error ? <p className="mb-4 text-sm text-rose-400">{error}</p> : null}
          {previewError ? <p className="mb-4 text-sm text-rose-400">{previewError}</p> : null}
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-white">
            <iframe
              className="h-[70vh] w-full"
              sandbox="allow-same-origin"
              srcDoc={
                previewHtml ||
                '<html><body style="font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #64748b;">Unable to render preview.</body></html>'
              }
              title={`${template.name} preview`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
