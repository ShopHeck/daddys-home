export const TEMPLATE_QUOTE = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.14);">
      <header style="background:#059669;padding:40px 48px;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:13px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.8;">Quote / Estimate</div>
              <div style="margin-top:14px;font-size:34px;font-weight:700;line-height:1.1;">{{companyName}}</div>
              <div style="margin-top:10px;font-size:15px;line-height:1.7;opacity:0.9;white-space:pre-line;">{{companyAddress}}</div>
            </td>
            <td style="width:220px;vertical-align:top;text-align:right;">
              <div style="display:inline-block;padding:14px 18px;border:1px solid rgba(255,255,255,0.28);border-radius:18px;background:rgba(255,255,255,0.08);text-align:left;min-width:176px;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.7;">Quote #</div>
                <div style="margin-top:6px;font-size:22px;font-weight:700;">{{quoteNumber}}</div>
                <div style="margin-top:14px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.7;">Issued</div>
                <div style="margin-top:6px;font-size:15px;">{{issueDate}}</div>
                <div style="margin-top:14px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.7;">Valid Until</div>
                <div style="margin-top:6px;font-size:15px;">{{validUntil}}</div>
              </div>
            </td>
          </tr>
        </table>
      </header>

      <section style="padding:40px 48px 20px 48px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0 18px;">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:12px;">
              <div style="padding:24px;border:1px solid #dbe4f0;border-radius:20px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#059669;font-weight:700;">From</div>
                <div style="margin-top:14px;font-size:18px;font-weight:700;color:#0f172a;">{{companyName}}</div>
                <div style="margin-top:8px;font-size:14px;line-height:1.8;color:#475569;white-space:pre-line;">{{companyContact}}</div>
              </div>
            </td>
            <td style="width:50%;vertical-align:top;padding-left:12px;">
              <div style="padding:24px;border:1px solid #dbe4f0;border-radius:20px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#059669;font-weight:700;">Prepared For</div>
                <div style="margin-top:14px;font-size:18px;font-weight:700;color:#0f172a;">{{clientName}}</div>
                <div style="margin-top:8px;font-size:14px;line-height:1.8;color:#475569;white-space:pre-line;">{{clientContact}}</div>
              </div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:0 48px;">
        <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#059669;font-weight:700;margin-bottom:16px;">Project Description</div>
        <div style="padding:22px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;font-size:15px;line-height:1.85;color:#334155;">{{projectDescription}}</div>
      </section>

      <section style="padding:28px 48px 16px 48px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:20px;overflow:hidden;">
          <thead>
            <tr style="background:#ecfdf5;">
              <th style="padding:18px 20px;text-align:left;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#059669;border-bottom:1px solid #dbe4f0;">Item</th>
              <th style="padding:18px 20px;text-align:center;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#059669;border-bottom:1px solid #dbe4f0;">Qty</th>
              <th style="padding:18px 20px;text-align:right;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#059669;border-bottom:1px solid #dbe4f0;">Rate</th>
              <th style="padding:18px 20px;text-align:right;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#059669;border-bottom:1px solid #dbe4f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each lineItems}}
              <tr>
                <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;font-size:15px;color:#0f172a;">{{description}}</td>
                <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;font-size:15px;text-align:center;color:#334155;">{{quantity}}</td>
                <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;font-size:15px;text-align:right;color:#334155;">{{rate}}</td>
                <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;font-size:15px;text-align:right;font-weight:700;color:#0f172a;">{{amount}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:12px 48px 48px 48px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;padding-right:24px;">
              {{#if notes}}
                <div style="padding:22px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;">
                  <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#059669;font-weight:700;">Notes</div>
                  <div style="margin-top:10px;font-size:14px;line-height:1.8;color:#475569;white-space:pre-line;">{{notes}}</div>
                </div>
              {{/if}}
            </td>
            <td style="width:260px;vertical-align:top;">
              <div style="padding:24px;border:1px solid #dbe4f0;border-radius:20px;background:#064e3b;color:#ffffff;">
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 12px 0;font-size:14px;color:#a7f3d0;">Subtotal</td>
                    <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#a7f3d0;">{{subtotal}}</td>
                  </tr>
                  {{#if discount}}
                  <tr>
                    <td style="padding:0 0 12px 0;font-size:14px;color:#a7f3d0;">Discount</td>
                    <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#a7f3d0;">-{{discount}}</td>
                  </tr>
                  {{/if}}
                  <tr>
                    <td style="padding:0 0 12px 0;font-size:14px;color:#a7f3d0;">Tax</td>
                    <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#a7f3d0;">{{tax}}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 12px 0;"><div style="height:1px;background:rgba(255,255,255,0.2);"></div></td>
                  </tr>
                  <tr>
                    <td style="padding:0;font-size:16px;font-weight:700;">Total</td>
                    <td style="padding:0;font-size:26px;font-weight:700;text-align:right;">{{total}}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </section>
    </main>
  </body>
</html>`;

export const SAMPLE_QUOTE = {
  companyName: 'Ridgeline Web Studio',
  companyAddress: '88 Pioneer Boulevard, Suite 4\nBoulder, CO 80302',
  companyContact: 'hello@ridgelineweb.co\n(303) 555-0172',
  clientName: 'Harvest Table Restaurants',
  clientContact: 'Amanda Liu, Operations Director\naliu@harvesttable.com\n(720) 555-0293',
  quoteNumber: 'QTE-2026-0331',
  issueDate: 'April 8, 2026',
  validUntil: 'May 8, 2026',
  projectDescription: 'Complete redesign and development of the Harvest Table restaurant group website, including online reservation integration, menu management CMS, location pages with maps, and mobile-first responsive implementation.',
  lineItems: [
    { description: 'UX research & wireframing', quantity: '1', rate: '$3,200', amount: '$3,200' },
    { description: 'Visual design (5 page templates)', quantity: '5', rate: '$1,400', amount: '$7,000' },
    { description: 'Front-end development', quantity: '80 hrs', rate: '$165/hr', amount: '$13,200' },
    { description: 'CMS setup & content migration', quantity: '1', rate: '$2,800', amount: '$2,800' },
    { description: 'Reservation system integration', quantity: '1', rate: '$1,600', amount: '$1,600' },
    { description: 'QA testing & launch support', quantity: '1', rate: '$1,200', amount: '$1,200' }
  ],
  subtotal: '$29,000',
  discount: '$1,450',
  tax: '$2,204',
  total: '$29,754',
  notes: 'Quote valid for 30 days. 50% deposit required to begin work.\nEstimated timeline: 8-10 weeks from project kickoff.\nIncludes 2 rounds of design revisions per page template.'
};
