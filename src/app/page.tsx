export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-10 shadow-2xl shadow-slate-950/40">
        <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
          DocForge API
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">Document Generation API backend is ready.</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Upload Handlebars-powered HTML templates, render PDFs over API, and track usage by plan tier. Dashboard screens can now be layered on top of this backend foundation.
        </p>
      </div>
    </main>
  );
}
