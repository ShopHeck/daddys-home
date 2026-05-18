/**
 * Template HTML content and sample data for the template gallery.
 * These are used by template-gallery.ts to populate pre-built templates.
 */

// --- Service Contract ---
export const TEMPLATE_SERVICE_CONTRACT = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.14);">
      <header style="background:#0f172a;padding:44px 48px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#93c5fd;">Service Contract</div>
        <div style="margin-top:16px;font-size:32px;font-weight:700;line-height:1.1;">{{contractTitle}}</div>
        <table role="presentation" style="width:100%;margin-top:22px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#cbd5e1;">Contract #{{contractNumber}}</td>
            <td style="text-align:right;font-size:15px;color:#cbd5e1;">Effective {{effectiveDate}}</td>
          </tr>
        </table>
      </header>

      <section style="padding:36px 48px 12px 48px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0 16px;">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:12px;">
              <div style="padding:22px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Service Provider</div>
                <div style="margin-top:12px;font-size:18px;font-weight:700;color:#0f172a;">{{providerName}}</div>
                <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;">{{providerAddress}}</div>
              </div>
            </td>
            <td style="width:50%;vertical-align:top;padding-left:12px;">
              <div style="padding:22px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Client</div>
                <div style="margin-top:12px;font-size:18px;font-weight:700;color:#0f172a;">{{clientName}}</div>
                <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;">{{clientAddress}}</div>
              </div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Scope of Services</div>
        <div style="margin-top:14px;font-size:15px;line-height:1.85;color:#334155;">{{scopeDescription}}</div>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Terms &amp; Conditions</div>
        <ol style="margin:14px 0 0 20px;padding:0;">
          {{#each terms}}
            <li style="margin-bottom:14px;font-size:15px;line-height:1.8;color:#334155;"><strong>{{title}}.</strong> {{description}}</li>
          {{/each}}
        </ol>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Payment Terms</div>
        <div style="margin-top:14px;padding:20px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:15px;color:#475569;">Total Contract Value</td>
              <td style="text-align:right;font-size:18px;font-weight:700;color:#0f172a;">{{totalValue}}</td>
            </tr>
            <tr>
              <td style="padding-top:10px;font-size:15px;color:#475569;">Payment Schedule</td>
              <td style="padding-top:10px;text-align:right;font-size:15px;color:#334155;">{{paymentSchedule}}</td>
            </tr>
          </table>
        </div>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Limitation of Liability</div>
        <div style="margin-top:14px;font-size:15px;line-height:1.85;color:#334155;">{{liabilityClause}}</div>
      </section>

      <footer style="padding:36px 48px 42px 48px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;padding-right:24px;vertical-align:top;">
              <div style="font-size:14px;color:#64748b;">Provider Signature</div>
              <div style="margin-top:48px;border-top:1px solid #94a3b8;padding-top:12px;font-size:16px;font-weight:700;color:#0f172a;">{{providerName}}</div>
              <div style="margin-top:4px;font-size:14px;color:#475569;">Date: _______________</div>
            </td>
            <td style="width:50%;padding-left:24px;vertical-align:top;">
              <div style="font-size:14px;color:#64748b;">Client Signature</div>
              <div style="margin-top:48px;border-top:1px solid #94a3b8;padding-top:12px;font-size:16px;font-weight:700;color:#0f172a;">{{clientName}}</div>
              <div style="margin-top:4px;font-size:14px;color:#475569;">Date: _______________</div>
            </td>
          </tr>
        </table>
      </footer>
    </main>
  </body>
</html>`;

export const SAMPLE_SERVICE_CONTRACT: Record<string, unknown> = {
  contractTitle: 'Website Development & Maintenance Agreement',
  contractNumber: 'SC-2026-0078',
  effectiveDate: 'April 15, 2026',
  providerName: 'Cascade Digital Solutions',
  providerAddress: '420 Innovation Drive, Suite 300\nAustin, TX 78701\ncontracts@cascadedigital.io',
  clientName: 'Greenleaf Organics Inc.',
  clientAddress: '1800 Farm-to-Table Lane\nPortland, OR 97205\nlegal@greenleaforganics.com',
  scopeDescription:
    'Cascade Digital Solutions will design, develop, and maintain a responsive e-commerce website for Greenleaf Organics Inc., including product catalog integration, payment processing setup, and ongoing monthly maintenance for a period of twelve months from the effective date.',
  terms: [
    {
      title: 'Term',
      description:
        'This agreement shall remain in effect for twelve (12) months from the effective date unless terminated earlier by either party with thirty (30) days written notice.',
    },
    {
      title: 'Confidentiality',
      description:
        'Both parties agree to maintain the confidentiality of proprietary information shared during the course of this engagement.',
    },
    {
      title: 'Intellectual Property',
      description:
        'All deliverables created under this contract shall become the property of the Client upon full payment.',
    },
    {
      title: 'Termination',
      description:
        'Either party may terminate this agreement for cause if the other party materially breaches any term and fails to cure within fifteen (15) days of written notice.',
    },
  ],
  totalValue: '$24,500',
  paymentSchedule: '50% upon signing, 25% at midpoint, 25% upon completion',
  liabilityClause:
    'In no event shall either party be liable for indirect, incidental, or consequential damages. The total aggregate liability of the Service Provider shall not exceed the total contract value specified herein.',
};

// --- Non-Disclosure Agreement ---
export const TEMPLATE_NDA = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.14);">
      <header style="background:#1e3a5f;padding:44px 48px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#93c5fd;">Mutual Non-Disclosure Agreement</div>
        <div style="margin-top:16px;font-size:30px;font-weight:700;line-height:1.1;">Confidentiality Agreement</div>
        <div style="margin-top:14px;font-size:15px;color:#cbd5e1;">Effective Date: {{effectiveDate}}</div>
      </header>

      <section style="padding:36px 48px 12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Parties</div>
        <table role="presentation" style="width:100%;margin-top:16px;border-collapse:separate;border-spacing:0 12px;">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:12px;">
              <div style="padding:20px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">Disclosing Party</div>
                <div style="margin-top:10px;font-size:17px;font-weight:700;color:#0f172a;">{{disclosingParty}}</div>
                <div style="margin-top:6px;font-size:14px;color:#475569;">{{disclosingAddress}}</div>
              </div>
            </td>
            <td style="width:50%;vertical-align:top;padding-left:12px;">
              <div style="padding:20px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">Receiving Party</div>
                <div style="margin-top:10px;font-size:17px;font-weight:700;color:#0f172a;">{{receivingParty}}</div>
                <div style="margin-top:6px;font-size:14px;color:#475569;">{{receivingAddress}}</div>
              </div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Definition of Confidential Information</div>
        <div style="margin-top:14px;font-size:15px;line-height:1.85;color:#334155;">{{confidentialInfoDefinition}}</div>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Exclusions</div>
        <ul style="margin:14px 0 0 20px;padding:0;">
          {{#each exclusions}}
            <li style="margin-bottom:10px;font-size:15px;line-height:1.8;color:#334155;">{{this}}</li>
          {{/each}}
        </ul>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Obligations</div>
        <div style="margin-top:14px;font-size:15px;line-height:1.85;color:#334155;">{{obligations}}</div>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Term</div>
        <div style="margin-top:14px;font-size:15px;line-height:1.85;color:#334155;">{{term}}</div>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Governing Law</div>
        <div style="margin-top:14px;font-size:15px;line-height:1.85;color:#334155;">{{governingLaw}}</div>
      </section>

      <footer style="padding:36px 48px 42px 48px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;padding-right:24px;vertical-align:top;">
              <div style="font-size:14px;color:#64748b;">Disclosing Party</div>
              <div style="margin-top:48px;border-top:1px solid #94a3b8;padding-top:12px;font-size:16px;font-weight:700;color:#0f172a;">{{disclosingParty}}</div>
              <div style="margin-top:4px;font-size:14px;color:#475569;">Date: _______________</div>
            </td>
            <td style="width:50%;padding-left:24px;vertical-align:top;">
              <div style="font-size:14px;color:#64748b;">Receiving Party</div>
              <div style="margin-top:48px;border-top:1px solid #94a3b8;padding-top:12px;font-size:16px;font-weight:700;color:#0f172a;">{{receivingParty}}</div>
              <div style="margin-top:4px;font-size:14px;color:#475569;">Date: _______________</div>
            </td>
          </tr>
        </table>
      </footer>
    </main>
  </body>
</html>`;

export const SAMPLE_NDA: Record<string, unknown> = {
  effectiveDate: 'April 10, 2026',
  disclosingParty: 'Horizon AI Labs',
  disclosingAddress: '900 Tech Park Boulevard, San Jose, CA 95110',
  receivingParty: 'Sterling Ventures Capital',
  receivingAddress: '250 Financial District, 14th Floor, New York, NY 10005',
  confidentialInfoDefinition:
    'Confidential Information includes all non-public technical, business, financial, and operational information disclosed by either party, whether in written, oral, electronic, or visual form, including but not limited to product roadmaps, algorithms, customer data, pricing strategies, and partnership details.',
  exclusions: [
    'Information that is or becomes publicly available through no fault of the receiving party.',
    'Information independently developed by the receiving party without use of confidential information.',
    'Information received from a third party without restriction and without breach of this agreement.',
    'Information that was already known to the receiving party prior to disclosure.',
  ],
  obligations:
    'The receiving party agrees to hold all Confidential Information in strict confidence, use it solely for the purpose of evaluating a potential business relationship, limit disclosure to employees and advisors with a need to know, and maintain protections no less rigorous than those used for its own confidential materials.',
  term: 'This agreement shall remain in effect for a period of two (2) years from the effective date. Obligations of confidentiality shall survive termination for an additional period of three (3) years.',
  governingLaw:
    'This agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles.',
};

// --- Quote / Estimate ---
export const TEMPLATE_QUOTE = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.14);">
      <header style="background:#1d4ed8;padding:40px 48px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.72;">Quote / Estimate</div>
        <div style="margin-top:14px;font-size:32px;font-weight:700;line-height:1.1;">{{companyName}}</div>
        <table role="presentation" style="width:100%;margin-top:20px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#dbeafe;">Quote #{{quoteNumber}}</td>
            <td style="text-align:right;font-size:15px;color:#dbeafe;">Valid until {{validUntil}}</td>
          </tr>
        </table>
      </header>

      <section style="padding:36px 48px 12px 48px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0 14px;">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:12px;">
              <div style="padding:20px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">From</div>
                <div style="margin-top:10px;font-size:17px;font-weight:700;">{{companyName}}</div>
                <div style="margin-top:6px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;">{{companyAddress}}</div>
              </div>
            </td>
            <td style="width:50%;vertical-align:top;padding-left:12px;">
              <div style="padding:20px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Prepared For</div>
                <div style="margin-top:10px;font-size:17px;font-weight:700;">{{clientName}}</div>
                <div style="margin-top:6px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;">{{clientAddress}}</div>
              </div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Project Description</div>
        <div style="margin-top:14px;font-size:15px;line-height:1.85;color:#334155;">{{projectDescription}}</div>
      </section>

      <section style="padding:12px 48px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:18px;overflow:hidden;">
          <thead>
            <tr style="background:#eff6ff;">
              <th style="padding:16px 18px;text-align:left;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Item</th>
              <th style="padding:16px 18px;text-align:center;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Qty</th>
              <th style="padding:16px 18px;text-align:right;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Rate</th>
              <th style="padding:16px 18px;text-align:right;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each lineItems}}
              <tr>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:15px;">{{description}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:15px;text-align:center;">{{quantity}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:15px;text-align:right;">{{rate}}</td>
                <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:15px;text-align:right;font-weight:700;">{{amount}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:18px 48px 42px 48px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Acceptance Terms</div>
              <div style="margin-top:12px;font-size:14px;line-height:1.8;color:#475569;">{{acceptanceTerms}}</div>
            </td>
            <td style="width:240px;vertical-align:top;padding-left:24px;">
              <div style="padding:22px;border-radius:18px;background:#0f172a;color:#ffffff;">
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  <tr><td style="font-size:14px;color:#cbd5e1;">Subtotal</td><td style="text-align:right;font-size:14px;color:#cbd5e1;">{{subtotal}}</td></tr>
                  {{#if discount}}<tr><td style="padding-top:8px;font-size:14px;color:#cbd5e1;">Discount</td><td style="padding-top:8px;text-align:right;font-size:14px;color:#4ade80;">-{{discount}}</td></tr>{{/if}}
                  <tr><td colspan="2" style="padding:12px 0;"><div style="height:1px;background:rgba(255,255,255,0.16);"></div></td></tr>
                  <tr><td style="font-size:16px;font-weight:700;">Total</td><td style="text-align:right;font-size:24px;font-weight:700;">{{total}}</td></tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </section>
    </main>
  </body>
</html>`;

export const SAMPLE_QUOTE: Record<string, unknown> = {
  companyName: 'Pixel Perfect Studios',
  companyAddress: '88 Design Avenue, Floor 3\nBrooklyn, NY 11201\nhello@pixelperfect.studio',
  clientName: 'Sunridge Wellness Center',
  clientAddress: '4200 Health Park Drive\nScottsdale, AZ 85251',
  quoteNumber: 'QT-2026-0331',
  validUntil: 'May 15, 2026',
  projectDescription:
    'Complete redesign of the Sunridge Wellness Center website including custom booking integration, mobile-first responsive design, and content migration from the existing platform.',
  lineItems: [
    { description: 'UX research & wireframing', quantity: '1', rate: '$3,200', amount: '$3,200' },
    { description: 'Visual design (homepage + 8 inner pages)', quantity: '9', rate: '$650', amount: '$5,850' },
    { description: 'Front-end development', quantity: '40 hrs', rate: '$175/hr', amount: '$7,000' },
    { description: 'Booking system integration', quantity: '1', rate: '$2,400', amount: '$2,400' },
    { description: 'Content migration & QA', quantity: '1', rate: '$1,800', amount: '$1,800' },
  ],
  subtotal: '$20,250',
  discount: '$1,250',
  total: '$19,000',
  acceptanceTerms:
    'This quote is valid for 30 days from the date of issue. A 40% deposit is required to begin work, with the balance due upon project completion and client approval.',
};

// --- Packing Slip ---
export const TEMPLATE_PACKING_SLIP = `<html>
  <body style="margin:0;padding:32px;background:#e5e7eb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.14);">
      <header style="background:#111827;padding:36px 44px;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;">Packing Slip</div>
              <div style="margin-top:12px;font-size:28px;font-weight:700;">{{companyName}}</div>
            </td>
            <td style="text-align:right;vertical-align:top;">
              <div style="font-size:14px;color:#9ca3af;">Order #{{orderNumber}}</div>
              <div style="margin-top:6px;font-size:14px;color:#9ca3af;">Date: {{date}}</div>
            </td>
          </tr>
        </table>
      </header>

      <section style="padding:32px 44px 16px 44px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0 12px;">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:12px;">
              <div style="padding:18px;border:1px solid #e5e7eb;border-radius:14px;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-weight:700;">Ship To</div>
                <div style="margin-top:10px;font-size:16px;font-weight:700;">{{shipToName}}</div>
                <div style="margin-top:6px;font-size:14px;line-height:1.7;color:#4b5563;white-space:pre-line;">{{shipToAddress}}</div>
              </div>
            </td>
            <td style="width:50%;vertical-align:top;padding-left:12px;">
              <div style="padding:18px;border:1px solid #e5e7eb;border-radius:14px;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-weight:700;">Ship From</div>
                <div style="margin-top:10px;font-size:16px;font-weight:700;">{{companyName}}</div>
                <div style="margin-top:6px;font-size:14px;line-height:1.7;color:#4b5563;white-space:pre-line;">{{shipFromAddress}}</div>
              </div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:12px 44px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#111827;font-weight:700;">Contents</div>
        <table role="presentation" style="width:100%;margin-top:14px;border-collapse:separate;border-spacing:0;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:14px 16px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb;">Item</th>
              <th style="padding:14px 16px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb;">SKU</th>
              <th style="padding:14px 16px;text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb;">Qty</th>
              <th style="padding:14px 16px;text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;border-bottom:1px solid #e5e7eb;">Weight</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f3f4f6;font-size:15px;font-weight:600;">{{name}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280;">{{sku}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f3f4f6;font-size:15px;text-align:center;">{{quantity}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:center;color:#6b7280;">{{weight}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      {{#if handlingInstructions}}
      <section style="padding:18px 44px 36px 44px;">
        <div style="padding:18px;border-radius:14px;background:#fef3c7;border:1px solid #fde68a;">
          <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#92400e;font-weight:700;">Handling Instructions</div>
          <div style="margin-top:8px;font-size:15px;line-height:1.7;color:#78350f;">{{handlingInstructions}}</div>
        </div>
      </section>
      {{/if}}
    </main>
  </body>
</html>`;

export const SAMPLE_PACKING_SLIP: Record<string, unknown> = {
  companyName: 'Alpine Gear Co.',
  orderNumber: 'ORD-90284',
  date: 'April 8, 2026',
  shipToName: 'Rachel Morrison',
  shipToAddress: '1425 Mountain View Road\nBoulder, CO 80302',
  shipFromAddress: '600 Warehouse Parkway\nReno, NV 89501',
  items: [
    { name: 'Trail Runner Pro Shoes (Size 9)', sku: 'TRP-09-BLK', quantity: '1', weight: '0.7 lb' },
    { name: 'Ultralight Rain Shell - Medium', sku: 'URS-M-NVY', quantity: '1', weight: '0.4 lb' },
    { name: 'Hydration Pack 2L', sku: 'HP-2L-GRN', quantity: '1', weight: '0.5 lb' },
    { name: 'Merino Wool Socks (3-Pack)', sku: 'MWS-3P-GRY', quantity: '2', weight: '0.3 lb' },
  ],
  handlingInstructions: 'Keep packages upright. Do not expose to extreme heat. Fragile items packed with foam inserts.',
};

// --- Pay Stub ---
export const TEMPLATE_PAY_STUB = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 16px 42px rgba(15,23,42,0.14);">
      <header style="background:#0f172a;padding:36px 44px;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#93c5fd;">Pay Stub</div>
              <div style="margin-top:10px;font-size:26px;font-weight:700;">{{companyName}}</div>
            </td>
            <td style="text-align:right;vertical-align:top;">
              <div style="font-size:14px;color:#94a3b8;">Pay Period: {{payPeriod}}</div>
              <div style="margin-top:6px;font-size:14px;color:#94a3b8;">Pay Date: {{payDate}}</div>
            </td>
          </tr>
        </table>
      </header>

      <section style="padding:28px 44px 14px 44px;">
        <div style="padding:18px;border:1px solid #dbe4f0;border-radius:14px;background:#f8fafc;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td><div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">Employee</div><div style="margin-top:6px;font-size:17px;font-weight:700;">{{employeeName}}</div></td>
              <td><div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">Employee ID</div><div style="margin-top:6px;font-size:15px;">{{employeeId}}</div></td>
              <td><div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;">Department</div><div style="margin-top:6px;font-size:15px;">{{department}}</div></td>
            </tr>
          </table>
        </div>
      </section>

      <section style="padding:14px 44px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Earnings</div>
        <table role="presentation" style="width:100%;margin-top:12px;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:14px;overflow:hidden;">
          <thead>
            <tr style="background:#eff6ff;">
              <th style="padding:12px 16px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Description</th>
              <th style="padding:12px 16px;text-align:right;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Hours</th>
              <th style="padding:12px 16px;text-align:right;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Rate</th>
              <th style="padding:12px 16px;text-align:right;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each earnings}}
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;">{{description}}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;text-align:right;">{{hours}}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;text-align:right;">{{rate}}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;text-align:right;font-weight:700;">{{amount}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:14px 44px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#dc2626;font-weight:700;">Deductions</div>
        <table role="presentation" style="width:100%;margin-top:12px;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:14px;overflow:hidden;">
          <thead>
            <tr style="background:#fef2f2;">
              <th style="padding:12px 16px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#dc2626;border-bottom:1px solid #fecaca;">Description</th>
              <th style="padding:12px 16px;text-align:right;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#dc2626;border-bottom:1px solid #fecaca;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each deductions}}
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;">{{description}}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;text-align:right;color:#dc2626;">-{{amount}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:18px 44px 36px 44px;">
        <div style="padding:22px;border-radius:18px;background:#0f172a;color:#ffffff;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:14px;color:#94a3b8;">Gross Pay</td>
              <td style="text-align:right;font-size:14px;color:#94a3b8;">{{grossPay}}</td>
              <td style="padding-left:32px;font-size:14px;color:#94a3b8;">YTD Gross</td>
              <td style="text-align:right;font-size:14px;color:#94a3b8;">{{ytdGross}}</td>
            </tr>
            <tr>
              <td style="padding-top:8px;font-size:14px;color:#94a3b8;">Total Deductions</td>
              <td style="padding-top:8px;text-align:right;font-size:14px;color:#94a3b8;">{{totalDeductions}}</td>
              <td style="padding-top:8px;padding-left:32px;font-size:14px;color:#94a3b8;">YTD Net</td>
              <td style="padding-top:8px;text-align:right;font-size:14px;color:#94a3b8;">{{ytdNet}}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:14px;"><div style="height:1px;background:rgba(255,255,255,0.15);"></div></td>
              <td colspan="2" style="padding-top:14px;"></td>
            </tr>
            <tr>
              <td style="padding-top:10px;font-size:18px;font-weight:700;">Net Pay</td>
              <td style="padding-top:10px;text-align:right;font-size:26px;font-weight:700;">{{netPay}}</td>
              <td colspan="2"></td>
            </tr>
          </table>
        </div>
      </section>
    </main>
  </body>
</html>`;

export const SAMPLE_PAY_STUB: Record<string, unknown> = {
  companyName: 'Redwood Financial Group',
  payPeriod: 'Mar 16 – Mar 31, 2026',
  payDate: 'April 4, 2026',
  employeeName: 'Samantha Torres',
  employeeId: 'EMP-4821',
  department: 'Client Services',
  earnings: [
    { description: 'Regular Hours', hours: '80', rate: '$42.50', amount: '$3,400.00' },
    { description: 'Overtime', hours: '6', rate: '$63.75', amount: '$382.50' },
    { description: 'Performance Bonus', hours: '—', rate: '—', amount: '$500.00' },
  ],
  deductions: [
    { description: 'Federal Income Tax', amount: '$642.38' },
    { description: 'State Income Tax', amount: '$214.13' },
    { description: 'Social Security (FICA)', amount: '$265.52' },
    { description: 'Medicare', amount: '$62.10' },
    { description: 'Health Insurance', amount: '$186.00' },
    { description: '401(k) Contribution (6%)', amount: '$256.95' },
  ],
  grossPay: '$4,282.50',
  totalDeductions: '$1,627.08',
  netPay: '$2,655.42',
  ytdGross: '$25,695.00',
  ytdNet: '$15,932.52',
};

// --- Project Status Report ---
export const TEMPLATE_PROJECT_STATUS = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 16px 44px rgba(15,23,42,0.14);">
      <header style="background:#1e40af;padding:40px 46px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#bfdbfe;">Project Status Report</div>
        <div style="margin-top:14px;font-size:34px;font-weight:700;line-height:1.1;">{{projectName}}</div>
        <table role="presentation" style="width:100%;margin-top:20px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#dbeafe;">Report Date: {{reportDate}}</td>
            <td style="text-align:right;font-size:15px;color:#dbeafe;">Prepared by {{preparedBy}}</td>
          </tr>
        </table>
      </header>

      <section style="padding:28px 46px 12px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Overall Status</div>
        <table role="presentation" style="width:100%;margin-top:14px;border-collapse:separate;border-spacing:12px 0;">
          <tr>
            <td style="width:33%;padding:18px;border-radius:14px;background:{{overallStatusColor}};text-align:center;">
              <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#ffffff;opacity:0.8;">Overall</div>
              <div style="margin-top:6px;font-size:20px;font-weight:700;color:#ffffff;">{{overallStatus}}</div>
            </td>
            <td style="width:33%;padding:18px;border-radius:14px;background:#f8fafc;border:1px solid #dbe4f0;text-align:center;">
              <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">Completion</div>
              <div style="margin-top:6px;font-size:20px;font-weight:700;color:#0f172a;">{{completionPercent}}</div>
            </td>
            <td style="width:33%;padding:18px;border-radius:14px;background:#f8fafc;border:1px solid #dbe4f0;text-align:center;">
              <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">Budget Used</div>
              <div style="margin-top:6px;font-size:20px;font-weight:700;color:#0f172a;">{{budgetUsed}}</div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:18px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Milestones</div>
        <table role="presentation" style="width:100%;margin-top:14px;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:14px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:14px 16px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Milestone</th>
              <th style="padding:14px 16px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Due Date</th>
              <th style="padding:14px 16px;text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Status</th>
            </tr>
          </thead>
          <tbody>
            {{#each milestones}}
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:15px;font-weight:600;">{{name}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#475569;">{{dueDate}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;text-align:center;font-weight:700;color:{{statusColor}};">{{status}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:18px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Risks &amp; Issues</div>
        {{#each risks}}
          <div style="margin-top:12px;padding:16px;border:1px solid #fde68a;border-radius:12px;background:#fffbeb;">
            <div style="font-size:14px;font-weight:700;color:#92400e;">{{title}}</div>
            <div style="margin-top:6px;font-size:14px;line-height:1.7;color:#78350f;">{{description}}</div>
          </div>
        {{/each}}
      </section>

      <section style="padding:18px 46px 36px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Upcoming Deliverables</div>
        <ul style="margin:14px 0 0 20px;padding:0;">
          {{#each upcoming}}
            <li style="margin-bottom:10px;font-size:15px;line-height:1.8;color:#334155;">{{this}}</li>
          {{/each}}
        </ul>
      </section>
    </main>
  </body>
</html>`;

export const SAMPLE_PROJECT_STATUS: Record<string, unknown> = {
  projectName: 'Customer Portal Redesign',
  reportDate: 'April 4, 2026',
  preparedBy: 'Alex Rivera',
  overallStatus: 'On Track',
  overallStatusColor: '#16a34a',
  completionPercent: '62%',
  budgetUsed: '58%',
  milestones: [
    { name: 'Discovery & Research', dueDate: 'Feb 28, 2026', status: 'Complete', statusColor: '#16a34a' },
    { name: 'Design System & Prototypes', dueDate: 'Mar 21, 2026', status: 'Complete', statusColor: '#16a34a' },
    { name: 'Front-end Development', dueDate: 'Apr 18, 2026', status: 'In Progress', statusColor: '#2563eb' },
    { name: 'Integration & QA', dueDate: 'May 9, 2026', status: 'Upcoming', statusColor: '#6b7280' },
    { name: 'Launch & Monitoring', dueDate: 'May 23, 2026', status: 'Upcoming', statusColor: '#6b7280' },
  ],
  risks: [
    {
      title: 'Third-party API latency',
      description:
        'The payment provider API has shown intermittent latency spikes during testing. Mitigation: implementing a caching layer and fallback UI states.',
    },
    {
      title: 'Design resource availability',
      description:
        'Lead designer has PTO scheduled during the final QA sprint. Mitigation: front-loading design sign-offs and establishing a backup reviewer.',
    },
  ],
  upcoming: [
    'Complete responsive component library by April 11',
    'Begin integration testing with staging environment by April 14',
    'Deliver accessibility audit findings by April 16',
    'Stakeholder demo scheduled for April 18',
  ],
};

// --- Scope of Work ---
export const TEMPLATE_SOW = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.14);">
      <header style="background:#0f172a;padding:44px 48px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#93c5fd;">Scope of Work</div>
        <div style="margin-top:16px;font-size:34px;font-weight:700;line-height:1.1;">{{projectTitle}}</div>
        <table role="presentation" style="width:100%;margin-top:20px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#cbd5e1;">{{providerName}} for {{clientName}}</td>
            <td style="text-align:right;font-size:15px;color:#cbd5e1;">{{date}}</td>
          </tr>
        </table>
      </header>

      <section style="padding:36px 48px 12px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Project Objectives</div>
        <div style="margin-top:14px;font-size:15px;line-height:1.85;color:#334155;">{{objectives}}</div>
      </section>

      <section style="padding:18px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Deliverables</div>
        <table role="presentation" style="width:100%;margin-top:14px;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:16px;overflow:hidden;">
          <thead>
            <tr style="background:#eff6ff;">
              <th style="padding:14px 18px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">#</th>
              <th style="padding:14px 18px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Deliverable</th>
              <th style="padding:14px 18px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Description</th>
            </tr>
          </thead>
          <tbody>
            {{#each deliverables}}
              <tr>
                <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:15px;font-weight:700;color:#1d4ed8;">{{number}}</td>
                <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:15px;font-weight:600;">{{title}}</td>
                <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#475569;">{{description}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:18px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Timeline</div>
        {{#each phases}}
          <div style="margin-top:12px;padding:16px 18px;border:1px solid #dbe4f0;border-radius:14px;">
            <table role="presentation" style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="font-size:16px;font-weight:700;color:#0f172a;">{{name}}</td>
                <td style="text-align:right;font-size:14px;color:#475569;">{{duration}}</td>
              </tr>
            </table>
            <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;">{{description}}</div>
          </div>
        {{/each}}
      </section>

      <section style="padding:18px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Acceptance Criteria</div>
        <ul style="margin:14px 0 0 20px;padding:0;">
          {{#each acceptanceCriteria}}
            <li style="margin-bottom:10px;font-size:15px;line-height:1.8;color:#334155;">{{this}}</li>
          {{/each}}
        </ul>
      </section>

      <section style="padding:18px 48px 36px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Assumptions</div>
        <ul style="margin:14px 0 0 20px;padding:0;">
          {{#each assumptions}}
            <li style="margin-bottom:10px;font-size:15px;line-height:1.8;color:#334155;">{{this}}</li>
          {{/each}}
        </ul>
      </section>
    </main>
  </body>
</html>`;

export const SAMPLE_SOW: Record<string, unknown> = {
  projectTitle: 'Mobile App MVP Development',
  providerName: 'Launchpad Engineering',
  clientName: 'FreshRoute Delivery',
  date: 'April 5, 2026',
  objectives:
    'Launchpad Engineering will design and develop a cross-platform mobile application for FreshRoute Delivery, enabling customers to place orders, track deliveries in real-time, and manage their accounts. The MVP will cover core ordering flow, push notifications, and driver assignment integration.',
  deliverables: [
    {
      number: '1',
      title: 'UX/UI Design Package',
      description: 'Wireframes, high-fidelity mockups, and interactive prototype for all core screens.',
    },
    {
      number: '2',
      title: 'Cross-Platform Mobile App',
      description: 'React Native application with ordering, tracking, account management, and push notifications.',
    },
    {
      number: '3',
      title: 'API Integration Layer',
      description: 'Backend integration with existing order management system and driver dispatch service.',
    },
    {
      number: '4',
      title: 'Testing & QA Report',
      description: 'Comprehensive test plan execution with device coverage matrix and bug resolution.',
    },
    {
      number: '5',
      title: 'App Store Submission',
      description: 'Prepared builds and metadata for iOS App Store and Google Play submission.',
    },
  ],
  phases: [
    {
      name: 'Discovery & Design',
      duration: 'Weeks 1–3',
      description: 'Requirements gathering, user research, wireframing, and design system creation.',
    },
    {
      name: 'Core Development',
      duration: 'Weeks 4–9',
      description: 'Feature implementation including ordering flow, real-time tracking, and notifications.',
    },
    {
      name: 'Integration & Testing',
      duration: 'Weeks 10–11',
      description: 'API integration, end-to-end testing, performance optimization, and bug fixes.',
    },
    {
      name: 'Launch Preparation',
      duration: 'Week 12',
      description: 'App store submission, documentation handoff, and post-launch monitoring setup.',
    },
  ],
  acceptanceCriteria: [
    'Application passes all functional test cases with zero critical or high-severity defects.',
    'App achieves sub-3-second load time on 4G connections across target devices.',
    'Real-time tracking updates within 5 seconds of driver location change.',
    'All screens meet WCAG 2.1 AA accessibility standards.',
    'Client sign-off on each phase deliverable before proceeding to next phase.',
  ],
  assumptions: [
    'Client will provide access to existing order management API documentation within the first week.',
    'Client designates a single point of contact for design feedback with 48-hour response SLA.',
    'Driver dispatch system exposes a webhook or polling endpoint for location updates.',
    'Scope changes beyond this SOW will be handled through a formal change request process.',
  ],
};

// --- Timesheet ---
export const TEMPLATE_TIMESHEET = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 16px 42px rgba(15,23,42,0.14);">
      <header style="background:#1e40af;padding:36px 44px;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td>
              <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#bfdbfe;">Consulting Timesheet</div>
              <div style="margin-top:10px;font-size:26px;font-weight:700;">{{consultantName}}</div>
              <div style="margin-top:6px;font-size:15px;color:#dbeafe;">{{consultantTitle}}</div>
            </td>
            <td style="text-align:right;vertical-align:top;">
              <div style="font-size:14px;color:#bfdbfe;">Week of {{weekOf}}</div>
              <div style="margin-top:6px;font-size:14px;color:#bfdbfe;">Client: {{clientName}}</div>
              <div style="margin-top:6px;font-size:14px;color:#bfdbfe;">Project: {{projectName}}</div>
            </td>
          </tr>
        </table>
      </header>

      <section style="padding:28px 44px 14px 44px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Daily Hours</div>
        <table role="presentation" style="width:100%;margin-top:14px;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:14px;overflow:hidden;">
          <thead>
            <tr style="background:#eff6ff;">
              <th style="padding:12px 14px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Day</th>
              <th style="padding:12px 14px;text-align:left;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Task / Description</th>
              <th style="padding:12px 14px;text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Hours</th>
            </tr>
          </thead>
          <tbody>
            {{#each entries}}
              <tr>
                <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;">{{day}}</td>
                <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#475569;">{{task}}</td>
                <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;text-align:center;font-weight:700;">{{hours}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:18px 44px 36px 44px;">
        <div style="padding:22px;border-radius:16px;background:#0f172a;color:#ffffff;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:14px;color:#94a3b8;">Total Hours</td>
              <td style="text-align:right;font-size:20px;font-weight:700;">{{totalHours}}</td>
              <td style="padding-left:32px;font-size:14px;color:#94a3b8;">Rate</td>
              <td style="text-align:right;font-size:14px;color:#94a3b8;">{{hourlyRate}}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:12px;"><div style="height:1px;background:rgba(255,255,255,0.15);"></div></td>
              <td colspan="2" style="padding-top:12px;"><div style="height:1px;background:rgba(255,255,255,0.15);"></div></td>
            </tr>
            <tr>
              <td style="padding-top:12px;font-size:16px;font-weight:700;">Amount Due</td>
              <td style="padding-top:12px;text-align:right;font-size:26px;font-weight:700;">{{amountDue}}</td>
              <td colspan="2"></td>
            </tr>
          </table>
        </div>
      </section>

      <footer style="padding:0 44px 36px 44px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;padding-right:24px;vertical-align:top;">
              <div style="font-size:13px;color:#64748b;">Consultant Signature</div>
              <div style="margin-top:40px;border-top:1px solid #94a3b8;padding-top:10px;font-size:15px;font-weight:700;">{{consultantName}}</div>
            </td>
            <td style="width:50%;padding-left:24px;vertical-align:top;">
              <div style="font-size:13px;color:#64748b;">Client Approval</div>
              <div style="margin-top:40px;border-top:1px solid #94a3b8;padding-top:10px;font-size:15px;font-weight:700;">{{approverName}}</div>
            </td>
          </tr>
        </table>
      </footer>
    </main>
  </body>
</html>`;

export const SAMPLE_TIMESHEET: Record<string, unknown> = {
  consultantName: 'David Park',
  consultantTitle: 'Senior Data Engineer',
  weekOf: 'March 31, 2026',
  clientName: 'Meridian Healthcare',
  projectName: 'Data Pipeline Migration',
  entries: [
    { day: 'Monday', task: 'ETL pipeline architecture review and documentation', hours: '7.5' },
    { day: 'Tuesday', task: 'Source system connector development (EHR integration)', hours: '8.0' },
    { day: 'Wednesday', task: 'Data validation framework implementation', hours: '7.0' },
    { day: 'Thursday', task: 'Performance testing and query optimization', hours: '8.0' },
    { day: 'Friday', task: 'Stakeholder demo and sprint retrospective', hours: '5.5' },
  ],
  totalHours: '36.0',
  hourlyRate: '$185/hr',
  amountDue: '$6,660.00',
  approverName: 'Karen Mitchell, VP Engineering',
};
