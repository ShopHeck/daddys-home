import type { Metadata } from 'next';
import Link from 'next/link';

import { PricingPlanButton } from '@/components/landing/PricingPlanButton';
import { RevealGrid } from '@/components/landing/RevealGrid';

export const metadata: Metadata = {
  title: 'DocForge — Generate PDFs from HTML Templates via API',
  description: 'DocForge gives your product team a fast, reliable document pipeline for invoices, proposals, and branded PDFs without managing rendering infrastructure.',
};

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
    title: 'Sub-second rendering',
    description: 'Chromium-powered PDF generation with optimized pooling delivers documents in under 2 seconds.',
  },
  {
    title: 'Template versioning',
    description: 'Track every change to your templates with full version history. Roll back anytime without breaking live integrations.',
  },
  {
    title: 'Batch rendering',
    description: 'Generate up to 50 PDFs in a single API call. Perfect for monthly invoices, reports, and bulk document runs.',
  },
  {
    title: 'Custom CSS & fonts',
    description: 'Upload custom stylesheets and load web fonts. Full control over typography, layout, and branding.',
  },
  {
    title: 'Webhooks & storage',
    description: 'Get notified when renders complete. Auto-store PDFs in S3-compatible storage with signed download links.',
  },
  {
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DocForge',
    applicationCategory: 'DeveloperApplication',
    description: 'Premium document generation API for HTML and Handlebars templates.',
    url: 'https://docforge.app',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '29',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
      },
      {
        '@type': 'Offer',
        name: 'Business',
        price: '99',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
      },
    ],
  };

  return (
    <main style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }}>
      <style>{`
        .font-display {
          font-family: 'Prata', Georgia, serif;
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative px-6 pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="relative mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
            <div className="lg:col-span-7">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 mb-8">
                Document generation API
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-white">
                Generate<br />
                <span style={{ color: 'oklch(0.65 0.15 250)' }}>PDFs</span> from<br />
                HTML templates
              </h1>
              <p className="mt-10 max-w-xl text-lg font-normal leading-relaxed text-slate-400">
                DocForge gives your product team a fast, reliable document pipeline for invoices, proposals, and branded PDFs — without managing rendering infrastructure.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/signup" 
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-950 bg-white hover:bg-slate-100 transition-colors"
                >
                  Start free
                </Link>
                <Link 
                  href="/docs" 
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white border border-slate-700 hover:border-slate-500 transition-colors"
                >
                  Read documentation
                </Link>
              </div>
            </div>

            <div className="mt-16 lg:mt-0 lg:col-span-5 lg:col-start-8">
              <div className="bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">POST /api/v1/render</span>
                  <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: 'oklch(0.65 0.18 145)' }} />
                </div>
                <pre className="p-4 overflow-x-auto text-sm text-slate-300 font-mono" style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>{codeExample}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:py-28 border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">How it works</p>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-white">
              From template<br />to PDF
            </h2>
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-3">
            {howItWorks.map((item, index) => (
              <div key={item.step} className={index === 1 ? 'lg:mt-12' : ''}>
                <span className="font-display text-5xl text-slate-700 italic">{item.step}</span>
                <h3 className="mt-6 text-xl font-medium text-white">{item.title}</h3>
                <p className="mt-3 text-base text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">Features</p>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-white">
                Everything for document automation
              </h2>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-8">
              <RevealGrid className="grid gap-px bg-slate-800 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="bg-slate-950 p-6 lg:p-8">
                    <h3 className="text-base font-medium text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </RevealGrid>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:py-28 border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">Developer-first</p>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-white">
                Ship without infrastructure
              </h2>
              <p className="mt-6 text-base text-slate-400 leading-relaxed max-w-md">
                Use a stored template ID, pass in structured JSON, and let DocForge handle rendering, tier enforcement, and analytics.
              </p>
            </div>
            <div className="mt-10 lg:mt-0 lg:col-span-6 lg:col-start-7">
              <div className="bg-slate-900 border border-slate-800">
                <pre className="p-5 overflow-x-auto text-sm text-slate-300 font-mono" style={{ fontSize: '0.8125rem', lineHeight: 1.7 }}>{`await fetch('/api/v1/render', {
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
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">Compare</p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-white max-w-xl">
            Why teams choose DocForge
          </h2>

          <div className="mt-16 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-4 text-xs font-medium uppercase tracking-wide text-slate-500">Feature</th>
                  <th className="pb-4 text-xs font-medium uppercase tracking-wide text-white text-center w-32">DocForge</th>
                  <th className="pb-4 text-xs font-medium uppercase tracking-wide text-slate-500 text-center w-32">wkhtmltopdf</th>
                  <th className="pb-4 text-xs font-medium uppercase tracking-wide text-slate-500 text-center w-32">Puppeteer DIY</th>
                  <th className="pb-4 text-xs font-medium uppercase tracking-wide text-slate-500 text-center w-32">DocRaptor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-6 py-4 text-sm text-slate-300">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={row.docforge ? 'font-medium' : 'text-slate-700'} style={{ color: row.docforge ? 'oklch(0.65 0.18 145)' : undefined }}>
                        {row.docforge ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={row.wkhtmltopdf ? 'text-slate-300' : 'text-slate-700'}>
                        {row.wkhtmltopdf ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={row.puppeteerDiy ? 'text-slate-300' : 'text-slate-700'}>
                        {row.puppeteerDiy ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={row.docraptor ? 'text-slate-300' : 'text-slate-700'}>
                        {row.docraptor ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:py-28 border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">Testimonials</p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-white">
            Trusted by engineering teams
          </h2>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="flex flex-col">
                <blockquote className="text-lg text-slate-300 leading-relaxed font-display">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-8 flex items-center gap-3">
                  <div 
                    className="h-10 w-10 flex items-center justify-center text-sm font-medium text-white"
                    style={{ backgroundColor: 'oklch(0.35 0.05 250)' }}
                  >
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{testimonial.author}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-4">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-white">
            Predictable plans
          </h2>

          <div className="mt-16 lg:grid lg:grid-cols-12 lg:gap-6">
            {tiers.map((tier, index) => (
              <div 
                key={tier.name} 
                className={`${index === 1 ? 'lg:col-span-5' : 'lg:col-span-3'} ${index === 0 ? 'lg:col-start-1' : index === 1 ? 'lg:col-start-5' : 'lg:col-start-10'} mb-6 lg:mb-0`}
              >
                <div className={`border h-full flex flex-col ${tier.featured ? 'border-slate-600 bg-slate-900' : 'border-slate-800 bg-slate-950'}`}>
                  <div className="p-6">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{tier.name}</span>
                      {tier.featured && (
                        <span className="text-xs text-slate-400">Popular</span>
                      )}
                    </div>
                    <p className="mt-4 font-display text-4xl text-white">{tier.price}</p>
                    <p className="mt-1 text-sm text-slate-500">{tier.docs}</p>
                  </div>
                  <div className="px-6 pb-6 flex-1">
                    <ul className="space-y-2">
                      {tier.features.map((feature) => (
                        <li key={feature} className="text-sm text-slate-400">{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="px-6 pb-6">
                    <PricingPlanButton tierName={tier.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:py-28 border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-white">
                Start generating PDFs<br />
                in five minutes
              </h2>
              <p className="mt-6 text-base text-slate-400 leading-relaxed max-w-lg">
                Create a free account, upload your first template, and render your first PDF — no credit card required.
              </p>
            </div>
            <div className="mt-10 lg:mt-0 lg:col-span-4 lg:col-start-9">
              <div className="flex flex-col gap-4">
                <Link 
                  href="/auth/signup" 
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-950 bg-white hover:bg-slate-100 transition-colors"
                >
                  Create free account
                </Link>
                <Link 
                  href="/docs" 
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white border border-slate-700 hover:border-slate-500 transition-colors"
                >
                  View API docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 py-16 border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg tracking-tight text-white">Doc</span>
                <span style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }} className="text-[0.6rem] font-medium uppercase tracking-[0.25em] text-slate-500">Forge</span>
              </div>
              <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                Premium document generation API for teams that need reliable PDF rendering at scale.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Product</p>
              <ul className="mt-4 space-y-2">
                <li><Link className="text-sm text-slate-400 hover:text-white transition-colors" href="/#pricing">Pricing</Link></li>
                <li><Link className="text-sm text-slate-400 hover:text-white transition-colors" href="/docs">API Docs</Link></li>
                <li><Link className="text-sm text-slate-400 hover:text-white transition-colors" href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Developers</p>
              <ul className="mt-4 space-y-2">
                <li><Link className="text-sm text-slate-400 hover:text-white transition-colors" href="/docs#getting-started">Getting Started</Link></li>
                <li><Link className="text-sm text-slate-400 hover:text-white transition-colors" href="/docs#endpoints">API Reference</Link></li>
                <li><Link className="text-sm text-slate-400 hover:text-white transition-colors" href="/docs#template-guide">Template Guide</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Company</p>
              <ul className="mt-4 space-y-2">
                <li><a className="text-sm text-slate-400 hover:text-white transition-colors" href="https://github.com/ShopHeck/daddys-home" rel="noreferrer" target="_blank">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-800/60">
            <p className="text-xs text-slate-600">© 2026 DocForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
