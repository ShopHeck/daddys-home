import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <nav className="mb-12 flex items-center gap-6 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/legal/terms" className="text-slate-400 hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/legal/privacy" className="text-slate-400 hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/legal/acceptable-use" className="text-slate-400 hover:text-white transition-colors">
            Acceptable Use
          </Link>
        </nav>
        <article className="prose prose-invert prose-slate max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-xl prose-p:text-slate-400 prose-li:text-slate-400 prose-a:text-blue-400">
          {children}
        </article>
      </div>
    </main>
  );
}
