import Link from 'next/link';

import { PricingPlanButton } from '@/components/landing/PricingPlanButton';

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

const features = [
  {
    icon: '⚡',
    title: 'Sub-second rendering',
    description: 'Chromium-powered PDF generation with optimized pooling delivers documents in under 2 seconds.',
  },
  {
    icon: '🔄',
    title: 'Template versioning',
    description: 'Track every change to your templates with full version history. Roll back anytime without breaking live integrations.',
  },
  {
    icon: '📦',
    title: 'Batch rendering',
    description: 'Generate up to 50 PDFs in a single API call. Perfect for monthly invoices, reports, and bulk document runs.',
  },
  {
    icon: '🎨',
    title: 'Custom CSS & fonts',
    description: 'Upload custom stylesheets and load web fonts. Full control over typography, layout, and branding.',
  },
  {
    icon: '🔗',
    title: 'Webhooks & storage',
    description: 'Get notified when renders complete. Auto-store PDFs in S3-compatible storage with signed download links.',
  },
  {
    icon: '👥',
    title: 'Team workspaces',
    description: 'Collaborate with role-based access control. Manage templates, API keys, and billing across your organization.',
  },
];

const comparisonRows = [
  { feature: 'HTML + Handlebars templates', docforge: true, wkhtmltopdf: false, puppeteerDiy: true, docraptor: true },
  { feature: 'Custom CSS & web fonts', docforge: true, wkhtmltopdf: false, puppeteerDiy: true, docraptor: true },
  { feature: 'Batch rendering (50+ docs)', docforge: true, wkhtmltopdf: false, puppeteerDiy: false, docraptor: false },
  { feature: 'Template versioning', docforge: true, wkhtmltopdf: false, puppeteerDiy: false, docraptor: false },
  { feature: 'Team workspaces & RBAC', docforge: true, wkhtmltopdf: false, puppeteerDiy: false, docraptor: false },
  { feature: 'Webhook notifications', docforge: true, wkhtmltopdf: false, puppeteerDiy: false, docraptor: true },
  { feature: 'S3 storage & download links', docforge: true, wkhtmltopdf: false, puppeteerDiy: false, docraptor: false },
  { feature: 'Usage analytics dashboard', docforge: true, wkhtmltopdf: false, puppeteerDiy: false, docraptor: false },
  { feature: 'No infrastructure to manage', docforge: true, wkhtmltopdf: false, puppeteerDiy: false, docraptor: true },
  { feature: 'Free tier available', docforge: true, wkhtmltopdf: true, puppeteerDiy: true, docraptor: false },
];

const testimonials = [
  {
    quote: "We replaced our entire PDF generation pipeline with DocForge in an afternoon. Our invoicing system went from flaky wkhtmltopdf crashes to rock-solid renders.",
    author: 'Sarah Chen',
    role: 'CTO',
    company: 'Meridian Billing',
  },
  {
    quote: "The template versioning alone sold us. We can iterate on document layouts without worrying about breaking production. Batch rendering 10k invoices monthly just works.",
    author: 'Marcus Rivera',
    role: 'Lead Engineer',
    company: 'NorthPeak Finance',
  },
  {
    quote: "Our team was spending 20 hours a month maintaining Puppeteer infrastructure. DocForge gave us that time back and the PDFs actually look better.",
    author: 'Jamie Okafor',
    role: 'Engineering Manager',
    company: 'Clearpath Legal',
  },
];

const tiers = [
  {
    name: 'Free' as const,
    price: '$0',
    docs: '50 docs/month',
    features: ['Handlebars templating', 'PDF rendering', 'API access', 'Usage analytics']
  },
  {
    name: 'Pro' as const,
    price: '$29/mo',
    docs: '5,000 docs/month',
    features: ['Handlebars templating', 'PDF rendering', 'API access', 'Usage analytics', 'Priority rendering', 'Email support'],
    featured: true
  },
  {
    name: 'Business' as const,
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

      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 sm:grid-cols-4">
          {[
            { value: '2M+', label: 'PDFs generated' },
            { value: '500+', label: 'Teams using DocForge' },
            { value: '99.9%', label: 'API uptime' },
            { value: '<2s', label: 'Avg render time' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
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
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Features</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need for document automation
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
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

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Compare</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Why teams choose DocForge
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Stop wrestling with headless browser infrastructure or limited PDF libraries.
          </p>
        </div>
        <div className="mt-12 overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-700 bg-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-300">Feature</th>
                <th className="px-6 py-4 font-semibold text-blue-300">DocForge</th>
                <th className="px-6 py-4 font-medium text-slate-400">wkhtmltopdf</th>
                <th className="px-6 py-4 font-medium text-slate-400">Puppeteer DIY</th>
                <th className="px-6 py-4 font-medium text-slate-400">DocRaptor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="bg-slate-900/50">
                  <td className="px-6 py-4 text-slate-300">{row.feature}</td>
                  <td className="px-6 py-4 text-green-400 font-medium">{row.docforge ? '✓' : '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{row.wkhtmltopdf ? '✓' : '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{row.puppeteerDiy ? '✓' : '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{row.docraptor ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Testimonials</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Trusted by engineering teams
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <span className="text-2xl text-slate-600">&ldquo;</span>
              <p className="text-sm leading-7 text-slate-300">{testimonial.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-600/20 flex items-center justify-center text-sm font-medium text-blue-300">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{testimonial.author}</p>
                  <p className="text-xs text-slate-400">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
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
              <PricingPlanButton tierName={tier.name} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-600/10 to-slate-900 p-10 text-center sm:p-16">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start generating PDFs in 5 minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Create a free account, upload your first template, and render your first PDF — no credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500" href="/auth/signup">
              Create free account
            </Link>
            <Link className="rounded-lg bg-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/docs">
              View API docs
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-sm font-semibold text-blue-300">
                DF
              </span>
              <span className="text-sm font-semibold text-white">DocForge</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Premium document generation API for teams that need reliable PDF rendering at scale.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Product</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li><Link className="transition hover:text-white" href="/#pricing">Pricing</Link></li>
              <li><Link className="transition hover:text-white" href="/docs">API Docs</Link></li>
              <li><Link className="transition hover:text-white" href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Developers</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li><Link className="transition hover:text-white" href="/docs#getting-started">Getting Started</Link></li>
              <li><Link className="transition hover:text-white" href="/docs#endpoints">API Reference</Link></li>
              <li><Link className="transition hover:text-white" href="/docs#template-guide">Template Guide</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Company</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li><a className="transition hover:text-white" href="https://github.com/ShopHeck/daddys-home" rel="noreferrer" target="_blank">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-8 text-sm text-slate-500">
          © 2026 DocForge. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
