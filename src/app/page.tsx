import Link from 'next/link';

const howItWorks = [
  {
    step: '01',
    title: 'Upload template',
    description: 'Store HTML and Handlebars templates once, then reuse them across invoices, contracts, and reports.'
  },
  {
    step: '02',
    title: 'Send data via API',
    description: 'POST structured JSON payloads with your template ID and render options from any backend or job queue.'
  },
  {
    step: '03',
    title: 'Get PDF back',
    description: 'Receive production-ready PDFs in seconds with predictable limits, analytics, and usage controls.'
  }
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    docs: '50 docs/month',
    features: ['Handlebars templating', 'PDF rendering', 'API access', 'Usage analytics']
  },
  {
    name: 'Pro',
    price: '$29/mo',
    docs: '5,000 docs/month',
    features: ['Handlebars templating', 'PDF rendering', 'API access', 'Usage analytics', 'Priority rendering', 'Email support'],
    featured: true
  },
  {
    name: 'Business',
    price: '$99/mo',
    docs: '50,000 docs/month',
    features: ['Handlebars templating', 'PDF rendering', 'API access', 'Usage analytics', 'Priority rendering', 'Custom templates', 'Dedicated support', 'SLA']
  }
];

const codeExample = `curl -X POST https://api.docforge.app/api/v1/render \
  -H "Content-Type: application/json" \
  -H "X-API-Key: df_live_your_key" \
  -d '{
    "templateId": "tmpl_invoice_01",
    "data": {
      "customer": "Acme Inc.",
      "invoiceNumber": "INV-2026-042",
      "amount": "$1,250.00"
    }
  }' \
  --output invoice.pdf`;

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_45%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-blue-300">
              Document generation API
            </span>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Generate PDFs from HTML templates via API
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              DocForge gives your product team a fast, reliable document pipeline for invoices, proposals, and branded PDFs without managing rendering infrastructure.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500" href="/auth/signup">
                Start free
              </Link>
              <Link className="rounded-lg bg-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/docs">
                Read docs
              </Link>
            </div>
          </div>

          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-sm font-medium text-white">Render request</p>
                <p className="text-xs text-slate-400">One endpoint. One payload. One PDF.</p>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                POST /api/v1/render
              </span>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">{codeExample}</pre>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">From template to PDF in three steps</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {howItWorks.map((item) => (
            <div key={item.step} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <span className="text-sm font-medium text-blue-300">{item.step}</span>
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Developer-first</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ship document workflows without owning PDF infrastructure</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Use a stored template ID, pass in structured JSON, and let DocForge handle rendering, tier enforcement, and analytics.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-slate-950/30">
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">{`await fetch('/api/v1/render', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.DOCFORGE_API_KEY
  },
  body: JSON.stringify({
    templateId: 'tmpl_contract_02',
    data: {
      company: 'Northwind',
      signer: 'Avery Stone'
    }
  })
});`}</pre>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-20" id="pricing">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Pricing</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Predictable plans for every stage</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={[
                'rounded-lg border p-6',
                tier.featured ? 'border-blue-500 bg-slate-800 shadow-xl shadow-blue-950/20' : 'border-slate-700 bg-slate-800'
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{tier.docs}</p>
                </div>
                {tier.featured ? (
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-8 text-4xl font-semibold text-white">{tier.price}</p>
              <ul className="mt-8 space-y-3 text-sm text-slate-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link className="mt-8 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500" href="/auth/signup">
                Choose {tier.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 DocForge. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <Link className="transition hover:text-white" href="/docs">
              Docs
            </Link>
            <Link className="transition hover:text-white" href="/dashboard">
              Dashboard
            </Link>
            <a className="transition hover:text-white" href="https://github.com/ShopHeck/daddys-home" rel="noreferrer" target="_blank">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
