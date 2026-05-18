export const TEMPLATE_SOW = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.16);">
      <header style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:48px 52px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#94a3b8;">Scope of Work</div>
        <div style="margin-top:16px;font-size:38px;font-weight:700;line-height:1.1;">{{projectTitle}}</div>
        <table role="presentation" style="width:100%;margin-top:24px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#cbd5e1;">{{providerName}} &rarr; {{clientName}}</td>
            <td style="text-align:right;font-size:15px;color:#cbd5e1;">{{date}}</td>
          </tr>
        </table>
      </header>

      <section style="padding:36px 52px 16px 52px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Project Overview</div>
        <div style="margin-top:14px;padding:24px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;font-size:15px;line-height:1.9;color:#334155;">{{overview}}</div>
      </section>

      <section style="padding:18px 52px 16px 52px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Objectives</div>
        <div style="margin-top:14px;padding:20px 24px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;">
          <ul style="margin:0;padding:0 0 0 20px;font-size:15px;line-height:2;color:#334155;">
            {{#each objectives}}
              <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
      </section>

      <section style="padding:18px 52px 16px 52px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:16px;">Deliverables</div>
        {{#each deliverables}}
          <div style="margin-bottom:14px;padding:20px 24px;border:1px solid #dbe4f0;border-radius:16px;background:#ffffff;">
            <table role="presentation" style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="vertical-align:top;">
                  <div style="font-size:17px;font-weight:700;color:#0f172a;">{{title}}</div>
                  <div style="margin-top:8px;font-size:14px;line-height:1.8;color:#475569;">{{description}}</div>
                </td>
                <td style="width:100px;text-align:right;vertical-align:top;">
                  <div style="display:inline-block;padding:8px 14px;border-radius:12px;background:#eff6ff;font-size:13px;font-weight:700;color:#1d4ed8;">{{dueWeek}}</div>
                </td>
              </tr>
            </table>
          </div>
        {{/each}}
      </section>

      <section style="padding:18px 52px 16px 52px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:16px;">Timeline</div>
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:16px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:14px 18px;text-align:left;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Phase</th>
              <th style="padding:14px 18px;text-align:left;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Duration</th>
              <th style="padding:14px 18px;text-align:left;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Activities</th>
            </tr>
          </thead>
          <tbody>
            {{#each timeline}}
              <tr>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:700;color:#0f172a;">{{phase}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;">{{duration}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;">{{activities}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:18px 52px 16px 52px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Acceptance Criteria</div>
        <div style="margin-top:14px;padding:20px 24px;border:1px solid #dbe4f0;border-radius:18px;background:#f0fdf4;">
          <ul style="margin:0;padding:0 0 0 20px;font-size:14px;line-height:2;color:#166534;">
            {{#each acceptanceCriteria}}
              <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
      </section>

      <section style="padding:18px 52px 16px 52px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Assumptions &amp; Exclusions</div>
        <table role="presentation" style="width:100%;margin-top:14px;border-collapse:separate;border-spacing:16px 0;">
          <tr>
            <td style="width:50%;vertical-align:top;padding:18px;border:1px solid #dbe4f0;border-radius:14px;background:#f8fafc;">
              <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:10px;">Assumptions</div>
              <ul style="margin:0;padding:0 0 0 18px;font-size:13px;line-height:1.9;color:#475569;">
                {{#each assumptions}}
                  <li>{{this}}</li>
                {{/each}}
              </ul>
            </td>
            <td style="width:50%;vertical-align:top;padding:18px;border:1px solid #dbe4f0;border-radius:14px;background:#f8fafc;">
              <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:10px;">Exclusions</div>
              <ul style="margin:0;padding:0 0 0 18px;font-size:13px;line-height:1.9;color:#475569;">
                {{#each exclusions}}
                  <li>{{this}}</li>
                {{/each}}
              </ul>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:18px 52px 44px 52px;">
        <div style="padding:24px;border-radius:18px;background:#0f172a;color:#e2e8f0;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#93c5fd;font-weight:700;">Total Investment</td>
              <td style="text-align:right;font-size:28px;font-weight:700;color:#ffffff;">{{totalBudget}}</td>
            </tr>
            <tr>
              <td style="padding-top:12px;font-size:14px;color:#94a3b8;">Payment: {{paymentTerms}}</td>
              <td style="padding-top:12px;text-align:right;font-size:14px;color:#94a3b8;">Duration: {{totalDuration}}</td>
            </tr>
          </table>
        </div>
      </section>
    </main>
  </body>
</html>`;

export const SAMPLE_SOW = {
  projectTitle: 'E-Commerce Platform Migration',
  providerName: 'Lighthouse Development Co.',
  clientName: 'Coastal Living Brands',
  date: 'April 14, 2026',
  overview: 'Lighthouse Development will migrate the existing Coastal Living Brands e-commerce storefront from a legacy Magento 1 installation to a modern headless commerce architecture using Shopify Plus as the backend and Next.js for the customer-facing storefront. The project includes data migration, design refresh, checkout optimization, and performance tuning.',
  objectives: [
    'Migrate all product data, customer accounts, and order history without downtime',
    'Achieve sub-2-second page load times on mobile devices',
    'Increase mobile conversion rate by at least 15% within 90 days post-launch',
    'Implement headless checkout with Apple Pay and Google Pay support',
    'Deliver a CMS-driven content layer for marketing team self-service'
  ],
  deliverables: [
    { title: 'Technical Architecture Document', description: 'System design including API contracts, data flow diagrams, infrastructure topology, and technology justification.', dueWeek: 'Week 2' },
    { title: 'Data Migration Scripts & Validation', description: 'Automated scripts for product catalog, customer, and order history migration with validation reports.', dueWeek: 'Week 4' },
    { title: 'Storefront UI Kit & Page Templates', description: 'Responsive component library and 8 page templates (PDP, PLP, cart, checkout, account, home, category, search).', dueWeek: 'Week 6' },
    { title: 'Checkout & Payment Integration', description: 'Shopify checkout with custom UI, multi-currency, and digital wallet support.', dueWeek: 'Week 8' },
    { title: 'Performance Optimization & Launch', description: 'Lighthouse audits, CDN configuration, redirect mapping, and monitored go-live cutover.', dueWeek: 'Week 10' }
  ],
  timeline: [
    { phase: 'Discovery & Planning', duration: 'Weeks 1-2', activities: 'Requirements gathering, architecture design, project kickoff, environment setup' },
    { phase: 'Data Migration', duration: 'Weeks 3-4', activities: 'Schema mapping, migration scripting, test runs, data validation' },
    { phase: 'Design & Development', duration: 'Weeks 5-7', activities: 'UI implementation, API integration, CMS setup, iterative reviews' },
    { phase: 'Integration & Testing', duration: 'Weeks 8-9', activities: 'Payment testing, load testing, UAT, accessibility audit' },
    { phase: 'Launch & Stabilization', duration: 'Week 10', activities: 'DNS cutover, monitoring, hotfix support, knowledge transfer' }
  ],
  acceptanceCriteria: [
    'All existing product URLs return 200 or redirect correctly (zero 404 errors on indexed pages)',
    'Lighthouse performance score of 90+ on mobile for all primary page templates',
    'Checkout flow completes in 3 steps or fewer with payment processing under 4 seconds',
    'All historical orders and customer accounts accessible in new admin interface',
    'Zero critical or high-severity bugs at time of go-live sign-off'
  ],
  assumptions: [
    'Client will provide staging access to current Magento instance within 5 business days',
    'Product imagery and marketing copy are final and will not change during development',
    'Client designates one decision-maker with authority to approve deliverables within 48 hours',
    'Third-party integrations (ERP, shipping) provide documented APIs'
  ],
  exclusions: [
    'Custom ERP integration development (quoted separately if needed)',
    'Ongoing content creation, copywriting, or photography',
    'Native mobile app development',
    'SEO strategy and content marketing beyond technical redirect mapping'
  ],
  totalBudget: '$87,500',
  paymentTerms: '30% deposit, 40% at midpoint, 30% at launch',
  totalDuration: '10 weeks'
};
