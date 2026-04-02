import Link from 'next/link';

const endpoints = [
  {
    id: 'create-template',
    method: 'POST',
    path: '/api/v1/templates',
    description: 'Create a new stored template for the authenticated API key owner.',
    headers: ['Content-Type: application/json', 'X-API-Key: df_live_...'],
    request: `interface CreateTemplateRequest {
  name: string;
  description?: string;
  content: string;
}`,
    response: `{
  "id": "clx123",
  "name": "Invoice",
  "description": "Monthly invoice template",
  "createdAt": "2026-04-02T10:00:00.000Z"
}`,
    curl: `curl -X POST http://localhost:3000/api/v1/templates \
  -H "Content-Type: application/json" \
  -H "X-API-Key: df_live_your_key" \
  -d '{
    "name": "Invoice",
    "description": "Monthly invoice template",
    "content": "<h1>Invoice {{invoiceNumber}}</h1>"
  }'`
  },
  {
    id: 'list-templates',
    method: 'GET',
    path: '/api/v1/templates',
    description: 'List all templates available to the authenticated user.',
    headers: ['X-API-Key: df_live_...'],
    request: 'No request body',
    response: `[
  {
    "id": "clx123",
    "name": "Invoice",
    "description": "Monthly invoice template",
    "createdAt": "2026-04-02T10:00:00.000Z",
    "updatedAt": "2026-04-02T10:00:00.000Z"
  }
]`,
    curl: `curl http://localhost:3000/api/v1/templates \
  -H "X-API-Key: df_live_your_key"`
  },
  {
    id: 'get-template',
    method: 'GET',
    path: '/api/v1/templates/:id',
    description: 'Fetch one template, including full content, by ID.',
    headers: ['X-API-Key: df_live_...'],
    request: 'No request body',
    response: `{
  "id": "clx123",
  "name": "Invoice",
  "description": "Monthly invoice template",
  "content": "<h1>Invoice {{invoiceNumber}}</h1>",
  "createdAt": "2026-04-02T10:00:00.000Z",
  "updatedAt": "2026-04-02T10:00:00.000Z"
}`,
    curl: `curl http://localhost:3000/api/v1/templates/clx123 \
  -H "X-API-Key: df_live_your_key"`
  },
  {
    id: 'delete-template',
    method: 'DELETE',
    path: '/api/v1/templates/:id',
    description: 'Delete a stored template by ID.',
    headers: ['X-API-Key: df_live_...'],
    request: 'No request body',
    response: `{
  "success": true
}`,
    curl: `curl -X DELETE http://localhost:3000/api/v1/templates/clx123 \
  -H "X-API-Key: df_live_your_key"`
  },
  {
    id: 'render-template',
    method: 'POST',
    path: '/api/v1/render',
    description: 'Render a stored template with JSON data and return a PDF binary.',
    headers: ['Content-Type: application/json', 'X-API-Key: df_live_...'],
    request: `interface RenderRequest {
  templateId: string;
  data: Record<string, unknown>;
  options?: {
    format?: 'A4' | 'Letter';
    landscape?: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  };
}`,
    response: `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"`,
    curl: `curl -X POST http://localhost:3000/api/v1/render \
  -H "Content-Type: application/json" \
  -H "X-API-Key: df_live_your_key" \
  -d '{
    "templateId": "clx123",
    "data": {
      "customer": "Acme Inc.",
      "invoiceNumber": "INV-2026-042"
    }
  }' \
  --output document.pdf`
  },
  {
    id: 'usage',
    method: 'GET',
    path: '/api/v1/usage',
    description: 'Fetch current monthly usage totals and plan limits for the key owner.',
    headers: ['X-API-Key: df_live_...'],
    request: 'No request body',
    response: `{
  "tier": "FREE",
  "limit": 50,
  "used": 12,
  "remaining": 38,
  "periodStart": "2026-04-01T00:00:00.000Z",
  "periodEnd": "2026-04-30T23:59:59.999Z"
}`,
    curl: `curl http://localhost:3000/api/v1/usage \
  -H "X-API-Key: df_live_your_key"`
  }
];

const tiers = [
  ['Free', '50 docs / month', 'Handlebars templating, PDF rendering, API access, usage analytics'],
  ['Pro', '5,000 docs / month', 'Everything in Free plus priority rendering and email support'],
  ['Business', '50,000 docs / month', 'Everything in Pro plus custom templates, dedicated support, and SLA']
];

const errors = [
  ['400', 'Invalid body, template data, or malformed payload'],
  ['401', 'Missing or invalid API key'],
  ['402', 'Usage limit exceeded for current billing period'],
  ['404', 'Requested template resource not found'],
  ['500', 'Unexpected render or server failure']
];

const templateExample = `<html>
  <body>
    <h1>Invoice {{invoiceNumber}}</h1>
    <p>Customer: {'{{customer.name}}'}</p>
    <ul>
      {{#each items}}
        <li>{{name}} — {{quantity}} × {{price}}</li>
      {{/each}}
    </ul>
    {{#if notes}}
      <p>Notes: {{notes}}</p>
    {{/if}}
  </body>
</html>`;

export default function DocsPage() {
  return (
    <main className="mx-auto flex max-w-7xl gap-10 px-6 py-12 lg:py-16">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 rounded-lg border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm font-medium text-white">On this page</p>
          <nav className="mt-4 space-y-3 text-sm text-slate-300">
            <a className="block hover:text-white" href="#getting-started">Getting Started</a>
            <a className="block hover:text-white" href="#authentication">Authentication</a>
            <a className="block hover:text-white" href="#endpoints">Endpoints</a>
            <a className="block hover:text-white" href="#template-guide">Template Guide</a>
            <a className="block hover:text-white" href="#tiers">Rate Limits & Tiers</a>
            <a className="block hover:text-white" href="#errors">Error Codes</a>
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-12">
        <section id="getting-started">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">API documentation</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Build PDFs from stored templates</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Sign up, create a template in your dashboard, generate an API key, and start rendering PDFs with one authenticated request.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500" href="/auth/signup">
              Create account
            </Link>
            <Link className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/dashboard/api-keys">
              Open dashboard
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6" id="authentication">
          <h2 className="text-2xl font-semibold text-white">Authentication</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Every public API request must include your DocForge key in the <code className="rounded bg-slate-950 px-2 py-1 font-mono text-slate-100">X-API-Key</code> header.
            Generate keys from the dashboard after signing up. Keys are only shown in full once, so store them securely in your secrets manager.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">X-API-Key: df_live_your_generated_key</pre>
        </section>

        <section className="space-y-8" id="endpoints">
          <div>
            <h2 className="text-2xl font-semibold text-white">Endpoints</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">All routes below are available under the same base URL as your DocForge app.</p>
          </div>
          {endpoints.map((endpoint) => (
            <article key={endpoint.id} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-400">{endpoint.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-sm text-white">{endpoint.path}</code>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Headers</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {endpoint.headers.map((header) => (
                      <li key={header} className="rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-slate-300">
                        {header}
                      </li>
                    ))}
                  </ul>
                  <h3 className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Request</h3>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">{endpoint.request}</pre>
                </div>
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Response</h3>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">{endpoint.response}</pre>
                  <h3 className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">cURL</h3>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">{endpoint.curl}</pre>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6" id="template-guide">
          <h2 className="text-2xl font-semibold text-white">Template Guide</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Templates are HTML documents rendered with Handlebars. Use variable interpolation, conditionals, and loops to generate invoices, contracts, reports, and custom branded output.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li>• Variables: <code className="rounded bg-slate-950 px-2 py-1 font-mono text-slate-100">{'{{customer.name}}'}</code></li>
            <li>• Conditionals: <code className="rounded bg-slate-950 px-2 py-1 font-mono text-slate-100">{'{{#if notes}}...{{/if}}'}</code></li>
            <li>• Loops: <code className="rounded bg-slate-950 px-2 py-1 font-mono text-slate-100">{'{{#each items}}...{{/each}}'}</code></li>
          </ul>
          <pre className="mt-6 overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">{templateExample}</pre>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6" id="tiers">
          <h2 className="text-2xl font-semibold text-white">Rate Limits & Tiers</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
              <thead className="text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Monthly limit</th>
                  <th className="px-4 py-3 font-medium">Included features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-slate-300">
                {tiers.map(([name, limit, features]) => (
                  <tr key={name}>
                    <td className="px-4 py-3 font-medium text-white">{name}</td>
                    <td className="px-4 py-3">{limit}</td>
                    <td className="px-4 py-3">{features}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6" id="errors">
          <h2 className="text-2xl font-semibold text-white">Error Codes</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
              <thead className="text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-slate-300">
                {errors.map(([code, meaning]) => (
                  <tr key={code}>
                    <td className="px-4 py-3 font-mono text-white">{code}</td>
                    <td className="px-4 py-3">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
