export type GalleryTemplate = {
  slug: string;
  name: string;
  description: string;
  category: 'business' | 'finance' | 'hr' | 'education' | 'shipping';
  content: string;
  sampleData: Record<string, unknown>;
};

export const templateGallery: GalleryTemplate[] = [
  {
    slug: 'invoice',
    name: 'Professional Invoice',
    description: 'A polished A4 invoice with branded header, billing blocks, line-item table, totals summary, and optional notes footer.',
    category: 'finance',
    content: `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,0.14);">
      <header style="background:#1d4ed8;padding:40px 48px;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:13px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.72;">Invoice</div>
              <div style="margin-top:14px;font-size:34px;font-weight:700;line-height:1.1;">{{companyName}}</div>
              <div style="margin-top:10px;font-size:15px;line-height:1.7;opacity:0.92;white-space:pre-line;">{{companyAddress}}</div>
            </td>
            <td style="width:220px;vertical-align:top;text-align:right;">
              <div style="display:inline-block;padding:12px 18px;border:1px solid rgba(255,255,255,0.28);border-radius:18px;background:rgba(255,255,255,0.08);text-align:left;min-width:176px;">
                <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.7;">Invoice #</div>
                <div style="margin-top:6px;font-size:22px;font-weight:700;">{{invoiceNumber}}</div>
                <div style="margin-top:18px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.7;">Issued</div>
                <div style="margin-top:6px;font-size:15px;">{{date}}</div>
                <div style="margin-top:14px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.7;">Due</div>
                <div style="margin-top:6px;font-size:15px;">{{dueDate}}</div>
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
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">From</div>
                <div style="margin-top:14px;font-size:20px;font-weight:700;color:#0f172a;">{{companyName}}</div>
                <div style="margin-top:8px;font-size:15px;line-height:1.8;color:#475569;white-space:pre-line;">{{companyAddress}}</div>
              </div>
            </td>
            <td style="width:50%;vertical-align:top;padding-left:12px;">
              <div style="padding:24px;border:1px solid #dbe4f0;border-radius:20px;background:#f8fafc;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Bill To</div>
                <div style="margin-top:14px;font-size:20px;font-weight:700;color:#0f172a;">{{clientName}}</div>
                <div style="margin-top:8px;font-size:15px;line-height:1.8;color:#475569;white-space:pre-line;">{{clientAddress}}</div>
              </div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:0 48px 16px 48px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:20px;overflow:hidden;">
          <thead>
            <tr style="background:#eff6ff;">
              <th style="padding:18px 20px;text-align:left;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Description</th>
              <th style="padding:18px 20px;text-align:center;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Qty</th>
              <th style="padding:18px 20px;text-align:right;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Unit Price</th>
              <th style="padding:18px 20px;text-align:right;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #dbe4f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each lineItems}}
              <tr>
                <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;background:#ffffff;font-size:15px;color:#0f172a;">{{description}}</td>
                <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:15px;text-align:center;color:#334155;">{{quantity}}</td>
                <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;background:#ffffff;font-size:15px;text-align:right;color:#334155;">{{unitPrice}}</td>
                <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:15px;text-align:right;font-weight:700;color:#0f172a;">{{total}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:8px 48px 48px 48px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;padding-right:24px;">
              {{#if notes}}
                <div style="padding:24px;border:1px solid #dbe4f0;border-radius:20px;background:#f8fafc;">
                  <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Notes</div>
                  <div style="margin-top:12px;font-size:15px;line-height:1.8;color:#475569;white-space:pre-line;">{{notes}}</div>
                </div>
              {{/if}}
            </td>
            <td style="width:280px;vertical-align:top;">
              <div style="padding:24px;border:1px solid #dbe4f0;border-radius:20px;background:#0f172a;">
                <table role="presentation" style="width:100%;border-collapse:collapse;color:#e2e8f0;">
                  <tr>
                    <td style="padding:0 0 14px 0;font-size:14px;">Subtotal</td>
                    <td style="padding:0 0 14px 0;font-size:14px;text-align:right;">{{subtotal}}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 14px 0;font-size:14px;">Tax</td>
                    <td style="padding:0 0 14px 0;font-size:14px;text-align:right;">{{tax}}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 14px 0;"><div style="height:1px;background:rgba(255,255,255,0.16);"></div></td>
                  </tr>
                  <tr>
                    <td style="padding:0;font-size:16px;font-weight:700;color:#ffffff;">Total Due</td>
                    <td style="padding:0;font-size:28px;font-weight:700;text-align:right;color:#ffffff;">{{total}}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </section>
    </main>
  </body>
</html>`,
    sampleData: {
      companyName: 'Northstar Creative Studio',
      companyAddress: '1450 Market Street, Suite 820\nSan Francisco, CA 94103\nhello@northstar.studio\n(415) 555-0188',
      clientName: 'Summit Health Partners',
      clientAddress: '2600 Wilshire Boulevard, Floor 5\nLos Angeles, CA 90057\naccounts@summithealth.co',
      invoiceNumber: 'INV-2026-0412',
      date: 'April 2, 2026',
      dueDate: 'April 16, 2026',
      lineItems: [
        { description: 'Brand messaging workshop', quantity: '1', unitPrice: '$1,200.00', total: '$1,200.00' },
        { description: 'Landing page design system', quantity: '12', unitPrice: '$165.00', total: '$1,980.00' },
        { description: 'Email automation implementation', quantity: '6', unitPrice: '$140.00', total: '$840.00' }
      ],
      subtotal: '$4,020.00',
      tax: '$321.60',
      total: '$4,341.60',
      notes: 'Thank you for the opportunity to support the Summit Health rebrand. Please remit payment via ACH within 14 days.'
    }
  },
  {
    slug: 'receipt',
    name: 'Receipt',
    description: 'A compact receipt-style layout with dashed separators, monospace details, item summary, and payment confirmation footer.',
    category: 'finance',
    content: `<html>
  <body style="margin:0;padding:24px;background:#e5e7eb;font-family:'Courier New',Courier,monospace;color:#111827;">
    <main style="width:320px;margin:0 auto;background:#ffffff;padding:24px 22px;border-radius:18px;box-shadow:0 14px 38px rgba(15,23,42,0.18);">
      <header style="text-align:center;">
        <div style="font-size:28px;font-weight:700;letter-spacing:0.04em;">{{storeName}}</div>
        <div style="margin-top:8px;font-size:13px;line-height:1.7;white-space:pre-line;color:#4b5563;">{{storeAddress}}</div>
      </header>

      <div style="margin:20px 0;border-top:2px dashed #94a3b8;"></div>

      <section>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:0 0 6px 0;color:#6b7280;">Receipt #</td>
            <td style="padding:0 0 6px 0;text-align:right;font-weight:700;">{{receiptNumber}}</td>
          </tr>
          <tr>
            <td style="padding:0;color:#6b7280;">Date</td>
            <td style="padding:0;text-align:right;">{{date}}</td>
          </tr>
        </table>
      </section>

      <div style="margin:20px 0;border-top:2px dashed #94a3b8;"></div>

      <section>
        {{#each items}}
          <div style="padding:10px 0;border-bottom:1px dashed #cbd5e1;">
            <table role="presentation" style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="font-size:14px;font-weight:700;">{{name}}</td>
                <td style="font-size:14px;text-align:right;font-weight:700;">{{price}}</td>
              </tr>
              <tr>
                <td style="padding-top:4px;font-size:12px;color:#6b7280;">Qty {{quantity}}</td>
                <td style="padding-top:4px;font-size:12px;text-align:right;color:#6b7280;">Item total</td>
              </tr>
            </table>
          </div>
        {{/each}}
      </section>

      <div style="margin:20px 0;border-top:2px dashed #94a3b8;"></div>

      <section>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:0 0 8px 0;color:#6b7280;">Subtotal</td>
            <td style="padding:0 0 8px 0;text-align:right;">{{subtotal}}</td>
          </tr>
          <tr>
            <td style="padding:0 0 8px 0;color:#6b7280;">Tax</td>
            <td style="padding:0 0 8px 0;text-align:right;">{{tax}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0 0 0;font-size:18px;font-weight:700;">Total</td>
            <td style="padding:8px 0 0 0;text-align:right;font-size:18px;font-weight:700;">{{total}}</td>
          </tr>
        </table>
      </section>

      <div style="margin:20px 0;border-top:2px dashed #94a3b8;"></div>

      <footer style="text-align:center;">
        <div style="font-size:13px;">Paid with {{paymentMethod}}</div>
        {{#if cardLast4}}
          <div style="margin-top:6px;font-size:12px;color:#6b7280;">Card ending in {{cardLast4}}</div>
        {{/if}}
        <div style="margin-top:18px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;">Thank you for your purchase</div>
      </footer>
    </main>
  </body>
</html>`,
    sampleData: {
      storeName: 'Harbor Coffee Co.',
      storeAddress: '82 Front Street\nSeattle, WA 98104\n(206) 555-0119',
      receiptNumber: 'RCPT-903184',
      date: 'April 2, 2026 8:14 AM',
      items: [
        { name: 'Cappuccino', quantity: '2', price: '$9.50' },
        { name: 'Almond croissant', quantity: '1', price: '$4.75' },
        { name: 'Cold brew beans, 12 oz', quantity: '1', price: '$16.00' }
      ],
      subtotal: '$30.25',
      tax: '$2.72',
      total: '$32.97',
      paymentMethod: 'Visa',
      cardLast4: '4821'
    }
  },
  {
    slug: 'proposal',
    name: 'Business Proposal',
    description: 'A spacious client proposal with executive summary, scope of work, delivery timeline, pricing breakdown, and validity notice.',
    category: 'business',
    content: `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:26px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.16);">
      <header style="background:#0f172a;padding:54px 54px 46px 54px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#93c5fd;">Business Proposal</div>
        <div style="margin-top:18px;font-size:18px;color:#cbd5e1;">Prepared by {{companyName}}</div>
        <div style="margin-top:28px;font-size:44px;font-weight:700;line-height:1.08;">{{projectTitle}}</div>
        <table role="presentation" style="width:100%;margin-top:28px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#cbd5e1;">Prepared for <span style="font-weight:700;color:#ffffff;">{{clientName}}</span></td>
            <td style="text-align:right;font-size:15px;color:#cbd5e1;">{{date}}</td>
          </tr>
        </table>
      </header>

      <section style="padding:40px 54px 20px 54px;">
        <div style="padding:28px;border:1px solid #dbe4f0;border-radius:22px;background:#f8fafc;">
          <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Executive Summary</div>
          <p style="margin:14px 0 0 0;font-size:16px;line-height:1.85;color:#334155;">{{summary}}</p>
        </div>
      </section>

      <section style="padding:12px 54px 0 54px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Scope of Work</div>
        <ol style="margin:18px 0 0 20px;padding:0;">
          {{#each scope}}
            <li style="margin:0 0 16px 0;padding:18px 22px;border:1px solid #dbe4f0;border-radius:18px;background:#ffffff;">
              <div style="font-size:18px;font-weight:700;color:#0f172a;">{{title}}</div>
              <div style="margin-top:8px;font-size:15px;line-height:1.8;color:#475569;">{{description}}</div>
            </li>
          {{/each}}
        </ol>
      </section>

      <section style="padding:28px 54px 0 54px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Timeline</div>
        <table role="presentation" style="width:100%;margin-top:18px;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:18px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:16px 18px;text-align:left;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Phase</th>
              <th style="padding:16px 18px;text-align:left;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Duration</th>
              <th style="padding:16px 18px;text-align:left;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Description</th>
            </tr>
          </thead>
          <tbody>
            {{#each timeline}}
              <tr>
                <td style="padding:18px;border-bottom:1px solid #e2e8f0;font-size:15px;font-weight:700;">{{phase}}</td>
                <td style="padding:18px;border-bottom:1px solid #e2e8f0;font-size:15px;color:#334155;">{{duration}}</td>
                <td style="padding:18px;border-bottom:1px solid #e2e8f0;font-size:15px;color:#475569;">{{description}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:28px 54px 42px 54px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;padding-right:18px;">
              <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Pricing</div>
              <table role="presentation" style="width:100%;margin-top:18px;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:18px;overflow:hidden;">
                <tbody>
                  {{#each pricing}}
                    <tr>
                      <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:15px;color:#334155;">{{item}}</td>
                      <td style="padding:16px 18px;border-bottom:1px solid #e2e8f0;font-size:15px;text-align:right;font-weight:700;color:#0f172a;">{{price}}</td>
                    </tr>
                  {{/each}}
                </tbody>
              </table>
            </td>
            <td style="width:250px;vertical-align:top;padding-left:18px;">
              <div style="padding:28px;border-radius:22px;background:#0f172a;color:#ffffff;">
                <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#93c5fd;font-weight:700;">Investment</div>
                <div style="margin-top:14px;font-size:34px;font-weight:700;">{{totalPrice}}</div>
                <div style="margin-top:24px;font-size:14px;line-height:1.8;color:#cbd5e1;">This proposal is valid through {{validUntil}} and includes all deliverables outlined above.</div>
              </div>
            </td>
          </tr>
        </table>
      </section>
    </main>
  </body>
</html>`,
    sampleData: {
      companyName: 'Atlas Advisory Group',
      clientName: 'Brightline Robotics',
      projectTitle: 'Go-to-Market Expansion Initiative',
      date: 'April 2, 2026',
      summary: 'Atlas Advisory Group will support Brightline Robotics with positioning, demand generation planning, and launch execution for its upcoming industrial automation platform. The engagement is designed to align sales, marketing, and operations around a single growth roadmap.',
      scope: [
        { title: 'Market positioning workshop', description: 'Facilitated stakeholder sessions to sharpen messaging, refine target segments, and map a differentiated category narrative.' },
        { title: 'Launch plan development', description: 'Build a phased launch program covering campaign sequencing, sales enablement, channel priorities, and reporting structure.' },
        { title: 'Execution support', description: 'Weekly advisory reviews, asset feedback, and performance reporting during the first six weeks of launch activity.' }
      ],
      timeline: [
        { phase: 'Discovery', duration: 'Week 1', description: 'Stakeholder interviews, materials review, and baseline performance analysis.' },
        { phase: 'Strategy', duration: 'Weeks 2-3', description: 'Messaging framework, priority segments, and launch plan approval.' },
        { phase: 'Activation', duration: 'Weeks 4-6', description: 'Campaign rollout, enablement delivery, and KPI tracking.' }
      ],
      pricing: [
        { item: 'Strategy workshop and research', price: '$4,500' },
        { item: 'Launch planning and narrative development', price: '$6,800' },
        { item: 'Six-week advisory retainer', price: '$5,700' }
      ],
      totalPrice: '$17,000',
      validUntil: 'April 20, 2026'
    }
  },
  {
    slug: 'offer-letter',
    name: 'Employment Offer Letter',
    description: 'A formal letterhead offer letter with company header, role details, benefits summary, and signature block ready for HR workflows.',
    category: 'hr',
    content: `<html>
  <body style="margin:0;padding:36px;background:#f1f5f9;font-family:Georgia,'Times New Roman',serif;color:#1e293b;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;padding:56px 64px;border-radius:18px;box-shadow:0 18px 44px rgba(15,23,42,0.12);">
      <header style="border-bottom:2px solid #cbd5e1;padding-bottom:24px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:middle;">
              <div style="font-size:31px;font-weight:700;color:#0f172a;">{{companyName}}</div>
              <div style="margin-top:8px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;">Official Employment Offer</div>
            </td>
            <td style="width:120px;text-align:right;vertical-align:middle;">
              {{#if companyLogo}}
                <img alt="{{companyName}} logo" src="{{companyLogo}}" style="max-width:90px;max-height:70px;object-fit:contain;" />
              {{/if}}
            </td>
          </tr>
        </table>
      </header>

      <section style="margin-top:28px;font-size:16px;line-height:1.95;">
        <div style="margin-bottom:18px;color:#475569;">{{date}}</div>
        <div style="margin-bottom:22px;font-size:20px;font-weight:700;color:#0f172a;">Dear {{candidateName}},</div>
        <p style="margin:0 0 18px 0;">We are pleased to extend this formal offer of employment for the position of <strong>{{position}}</strong> within the <strong>{{department}}</strong> team at <strong>{{companyName}}</strong>.</p>
        <p style="margin:0 0 18px 0;">Your anticipated start date will be <strong>{{startDate}}</strong>. In this role, you will report to <strong>{{managerName}}</strong>, <strong>{{managerTitle}}</strong>, and you will play an important role in advancing our team and customer commitments.</p>
        <p style="margin:0;">Your base salary will be <strong>{{salary}}</strong>, paid in accordance with our standard payroll practices and subject to applicable withholdings.</p>
      </section>

      <section style="margin-top:32px;padding:24px 28px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;">
        <div style="font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#475569;">Benefits Summary</div>
        <ul style="margin:18px 0 0 22px;padding:0;font-size:16px;line-height:1.9;color:#334155;">
          {{#each benefits}}
            <li style="margin-bottom:10px;">{{this}}</li>
          {{/each}}
        </ul>
      </section>

      <section style="margin-top:32px;font-size:16px;line-height:1.95;color:#334155;">
        <p style="margin:0 0 18px 0;">This offer is contingent upon successful completion of any required background checks and verification steps. Your employment with {{companyName}} will remain at-will, meaning either you or the company may end the employment relationship at any time, with or without cause or notice, subject to applicable law.</p>
        <p style="margin:0;">If you accept this offer, we look forward to welcoming you to the team and supporting your success from day one.</p>
      </section>

      <footer style="margin-top:48px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;padding-right:24px;vertical-align:top;">
              <div style="font-size:15px;color:#64748b;">Sincerely,</div>
              <div style="margin-top:52px;border-top:1px solid #94a3b8;padding-top:12px;font-size:18px;font-weight:700;color:#0f172a;">{{managerName}}</div>
              <div style="margin-top:4px;font-size:15px;color:#475569;">{{managerTitle}}</div>
            </td>
            <td style="width:50%;padding-left:24px;vertical-align:top;">
              <div style="font-size:15px;color:#64748b;">Accepted by:</div>
              <div style="margin-top:52px;border-top:1px solid #94a3b8;padding-top:12px;font-size:18px;font-weight:700;color:#0f172a;">{{candidateName}}</div>
              <div style="margin-top:4px;font-size:15px;color:#475569;">Signature and date</div>
            </td>
          </tr>
        </table>
      </footer>
    </main>
  </body>
</html>`,
    sampleData: {
      companyName: 'Maple Ridge Technologies',
      companyLogo: 'https://dummyimage.com/220x120/0f172a/ffffff.png&text=MR',
      candidateName: 'Jordan Alvarez',
      position: 'Senior Product Designer',
      department: 'Product Design',
      startDate: 'May 4, 2026',
      salary: '$138,000 annually',
      benefits: [
        'Comprehensive medical, dental, and vision coverage beginning on your first day of employment.',
        '401(k) plan with company match up to 4% of eligible compensation.',
        'Flexible paid time off, quarterly wellness stipend, and home office reimbursement.'
      ],
      managerName: 'Olivia Bennett',
      managerTitle: 'VP, Product Experience',
      date: 'April 2, 2026'
    }
  },
  {
    slug: 'certificate',
    name: 'Certificate of Completion',
    description: 'An elegant landscape certificate with decorative border, gold and navy accents, and centered signature area for formal presentation.',
    category: 'education',
    content: `<html>
  <body style="margin:0;padding:24px;background:#e2e8f0;font-family:Georgia,'Times New Roman',serif;color:#0f172a;">
    <main style="max-width:1123px;min-height:794px;margin:0 auto;background:#fdf8ef;border-radius:20px;padding:28px;box-shadow:0 20px 56px rgba(15,23,42,0.16);">
      <div style="height:100%;min-height:738px;border:3px solid #b68b2d;border-radius:14px;padding:18px;">
        <div style="height:100%;min-height:694px;border:1px solid #1e3a5f;border-radius:12px;padding:40px 52px;text-align:center;background:#fffdf8;">
          <div style="font-size:15px;letter-spacing:0.34em;text-transform:uppercase;color:#1e3a5f;">Certificate of Completion</div>
          <div style="margin:22px auto 0 auto;width:140px;height:2px;background:#b68b2d;"></div>
          <p style="margin:52px 0 0 0;font-size:24px;line-height:1.8;color:#475569;">This certifies that</p>
          <div style="margin-top:22px;font-size:56px;font-weight:700;line-height:1.1;color:#0f172a;">{{recipientName}}</div>
          <div style="margin:26px auto 0 auto;width:180px;height:1px;background:#cbd5e1;"></div>
          <p style="margin:34px auto 0 auto;max-width:760px;font-size:24px;line-height:1.8;color:#334155;">has successfully completed <strong>{{courseName}}</strong> and demonstrated the dedication, mastery, and commitment recognized by this award.</p>
          <div style="margin-top:56px;font-size:18px;letter-spacing:0.22em;text-transform:uppercase;color:#b68b2d;">Presented on {{date}}</div>

          <table role="presentation" style="width:100%;margin-top:88px;border-collapse:collapse;">
            <tr>
              <td style="width:33.33%;vertical-align:bottom;text-align:left;">
                <div style="font-size:14px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;">Certificate ID</div>
                <div style="margin-top:12px;font-size:18px;font-weight:700;color:#1e3a5f;">{{certificateId}}</div>
              </td>
              <td style="width:33.33%;vertical-align:bottom;text-align:center;">
                <div style="display:inline-block;width:220px;border-top:1px solid #1e3a5f;padding-top:12px;">
                  <div style="font-size:20px;font-weight:700;color:#0f172a;">{{issuerName}}</div>
                  <div style="margin-top:6px;font-size:15px;color:#475569;">{{issuerTitle}}</div>
                </div>
              </td>
              <td style="width:33.33%;vertical-align:bottom;text-align:right;">
                <div style="font-size:14px;letter-spacing:0.22em;text-transform:uppercase;color:#64748b;">Issued by</div>
                <div style="margin-top:12px;font-size:18px;font-weight:700;color:#1e3a5f;">{{issuerName}}</div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </main>
  </body>
</html>`,
    sampleData: {
      recipientName: 'Avery Thompson',
      courseName: 'Advanced Financial Modeling & Forecasting',
      issuerName: 'Pinecrest Learning Institute',
      issuerTitle: 'Director of Executive Education',
      date: 'April 2, 2026',
      certificateId: 'CERT-2026-44019'
    }
  },
  {
    slug: 'shipping-label',
    name: 'Shipping Label',
    description: 'A dense 4×6-style shipping label with bold sender and recipient blocks, service badge, and oversized tracking section for quick scanning.',
    category: 'shipping',
    content: `<html>
  <body style="margin:0;padding:18px;background:#e5e7eb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <main style="width:384px;min-height:576px;margin:0 auto;background:#ffffff;border:3px solid #111827;border-radius:14px;padding:18px;box-sizing:border-box;box-shadow:0 14px 30px rgba(15,23,42,0.16);">
      <table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;">
            <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;font-weight:700;">Service</div>
            <div style="margin-top:8px;display:inline-block;padding:8px 14px;border-radius:999px;background:#111827;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.04em;">{{service}}</div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;font-weight:700;">Weight</div>
            <div style="margin-top:8px;font-size:22px;font-weight:700;">{{weight}}</div>
          </td>
        </tr>
      </table>

      <section style="margin-top:18px;padding:16px;border:2px solid #111827;border-radius:12px;background:#f8fafc;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6b7280;font-weight:700;">From</div>
        <div style="margin-top:10px;font-size:20px;font-weight:700;line-height:1.2;">{{fromName}}</div>
        <div style="margin-top:8px;font-size:15px;line-height:1.65;color:#374151;">{{fromAddress}}<br />{{fromCity}}, {{fromState}} {{fromZip}}</div>
      </section>

      <section style="margin-top:16px;padding:18px;border:3px solid #111827;border-radius:12px;">
        <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#111827;font-weight:700;">Ship To</div>
        <div style="margin-top:12px;font-size:28px;font-weight:700;line-height:1.15;color:#111827;">{{toName}}</div>
        <div style="margin-top:10px;font-size:18px;line-height:1.55;color:#111827;">{{toAddress}}<br />{{toCity}}, {{toState}} {{toZip}}</div>
      </section>

      <section style="margin-top:18px;padding:18px;border-radius:12px;background:#111827;color:#ffffff;text-align:center;">
        <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#cbd5e1;">Tracking Number</div>
        <div style="margin-top:14px;font-size:30px;font-weight:700;letter-spacing:0.08em;">{{trackingNumber}}</div>
        <div style="margin-top:16px;padding:14px 10px;border-radius:10px;background:#ffffff;color:#111827;font-size:26px;letter-spacing:0.2em;font-family:'Courier New',Courier,monospace;font-weight:700;">|||| |||| ||| |||| ||||</div>
      </section>

      <footer style="margin-top:18px;border-top:2px dashed #9ca3af;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-weight:700;">Route</div>
          <div style="margin-top:6px;font-size:16px;font-weight:700;">Hub 03</div>
        </div>
        <div style="font-size:44px;font-weight:700;line-height:1;color:#111827;">Z4</div>
      </footer>
    </main>
  </body>
</html>`,
    sampleData: {
      fromName: 'Northwind Distribution',
      fromAddress: '1200 Cargo Way',
      fromCity: 'Denver',
      fromState: 'CO',
      fromZip: '80216',
      toName: 'Maya Chen',
      toAddress: '875 King Street, Apt 5B',
      toCity: 'Alexandria',
      toState: 'VA',
      toZip: '22314',
      trackingNumber: '1Z84X7A0293814',
      weight: '2.8 lb',
      service: 'Express'
    }
  },
  {
    slug: 'meeting-minutes',
    name: 'Meeting Minutes',
    description: 'A structured meeting notes template with attendee list, agenda sections, decision summaries, action-item highlights, and next meeting footer.',
    category: 'business',
    content: `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 16px 44px rgba(15,23,42,0.14);">
      <header style="background:#1e40af;padding:42px 48px;color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#bfdbfe;">Meeting Minutes</div>
        <div style="margin-top:14px;font-size:36px;font-weight:700;line-height:1.12;">{{meetingTitle}}</div>
        <table role="presentation" style="width:100%;margin-top:24px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#dbeafe;">{{date}} · {{time}}</td>
            <td style="text-align:right;font-size:15px;color:#dbeafe;">{{location}}</td>
          </tr>
        </table>
      </header>

      <section style="padding:30px 48px 8px 48px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Attendees</div>
        <table role="presentation" style="width:100%;margin-top:16px;border-collapse:separate;border-spacing:0 12px;">
          <tr>
            {{#each attendees}}
              <td style="width:50%;padding-right:12px;vertical-align:top;">
                <div style="padding:16px 18px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
                  <div style="font-size:16px;font-weight:700;color:#0f172a;">{{name}}</div>
                  <div style="margin-top:4px;font-size:14px;color:#475569;">{{role}}</div>
                </div>
              </td>
            {{/each}}
          </tr>
        </table>
      </section>

      <section style="padding:12px 48px 40px 48px;">
        {{#each agendaItems}}
          <article style="margin-top:18px;border:1px solid #dbe4f0;border-radius:18px;overflow:hidden;">
            <div style="padding:18px 22px;background:#eff6ff;border-bottom:1px solid #dbe4f0;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Agenda Topic</div>
              <div style="margin-top:8px;font-size:22px;font-weight:700;color:#0f172a;">{{topic}}</div>
            </div>
            <div style="padding:22px;">
              <div style="margin-bottom:18px;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;font-weight:700;">Discussion</div>
                <div style="margin-top:8px;font-size:15px;line-height:1.85;color:#334155;">{{discussion}}</div>
              </div>
              <div style="margin-bottom:18px;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;font-weight:700;">Decision</div>
                <div style="margin-top:8px;font-size:15px;line-height:1.85;color:#334155;">{{decision}}</div>
              </div>
              <div style="padding:16px 18px;border-radius:14px;background:#f1f5f9;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Action Item</div>
                <div style="margin-top:8px;font-size:15px;line-height:1.8;color:#0f172a;"><strong>{{actionItem}}</strong></div>
                <div style="margin-top:8px;font-size:14px;color:#475569;">Owner: {{owner}}</div>
              </div>
            </div>
          </article>
        {{/each}}
      </section>

      <footer style="padding:0 48px 40px 48px;">
        <div style="padding:22px;border-radius:18px;background:#0f172a;color:#e2e8f0;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#93c5fd;font-weight:700;">Next Meeting</div>
          <div style="margin-top:10px;font-size:18px;font-weight:700;color:#ffffff;">{{nextMeeting}}</div>
        </div>
      </footer>
    </main>
  </body>
</html>`,
    sampleData: {
      meetingTitle: 'Q2 Product Steering Committee',
      date: 'April 2, 2026',
      time: '10:00 AM – 11:30 AM',
      location: 'Board Room + Zoom',
      attendees: [
        { name: 'Priya Shah', role: 'Chief Product Officer' },
        { name: 'Marcus Lee', role: 'VP, Engineering' }
      ],
      agendaItems: [
        {
          topic: 'Mobile onboarding drop-off',
          discussion: 'The team reviewed March funnel data and identified a 14% drop between account creation and verification on Android devices. Engineering confirmed the latest instrumentation is complete and marketing requested faster experiment turnaround.',
          decision: 'Prioritize the verification experience redesign and ship the simplified flow behind a feature flag before the end of the sprint.',
          actionItem: 'Finalize updated Android verification screens and QA checklist.',
          owner: 'Marcus Lee'
        },
        {
          topic: 'Enterprise reporting roadmap',
          discussion: 'Customer success shared feedback from three expansion accounts requesting self-serve exports, scheduled report delivery, and executive summary dashboards for monthly reviews.',
          decision: 'Package exports and scheduled delivery in the June release, while deferring advanced dashboard customization to the following quarter.',
          actionItem: 'Draft customer-facing launch messaging and prioritized requirement list.',
          owner: 'Priya Shah'
        }
      ],
      nextMeeting: 'April 30, 2026 at 10:00 AM'
    }
  },
  {
    slug: 'monthly-report',
    name: 'Monthly Report',
    description: 'A dashboard-inspired monthly report with KPI highlight cards, narrative sections, and recommendation list for operational updates.',
    category: 'business',
    content: `<html>
  <body style="margin:0;padding:32px;background:#dbe4f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.16);">
      <header style="padding:40px 46px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#bfdbfe;">{{companyName}}</div>
        <div style="margin-top:14px;font-size:38px;font-weight:700;line-height:1.1;">{{reportTitle}}</div>
        <table role="presentation" style="width:100%;margin-top:22px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#dbeafe;">Period: {{period}}</td>
            <td style="text-align:right;font-size:15px;color:#dbeafe;">Prepared by {{preparedBy}} · {{date}}</td>
          </tr>
        </table>
      </header>

      <section style="padding:28px 46px 12px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Highlights</div>
        <table role="presentation" style="width:100%;margin-top:16px;border-collapse:separate;border-spacing:12px 0;">
          <tr>
            {{#each highlights}}
              <td style="width:33.33%;padding:0;vertical-align:top;">
                <div style="padding:20px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;min-height:120px;">
                  <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;font-weight:700;">{{metric}}</div>
                  <div style="margin-top:14px;font-size:28px;font-weight:700;color:#0f172a;">{{value}}</div>
                  <div style="margin-top:10px;font-size:14px;color:#1d4ed8;font-weight:700;">{{change}}</div>
                </div>
              </td>
            {{/each}}
          </tr>
        </table>
      </section>

      <section style="padding:18px 46px 0 46px;">
        {{#each sections}}
          <article style="margin-top:18px;padding:24px;border:1px solid #dbe4f0;border-radius:18px;background:#ffffff;">
            <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Section</div>
            <div style="margin-top:10px;font-size:24px;font-weight:700;color:#0f172a;">{{title}}</div>
            <p style="margin:14px 0 0 0;font-size:15px;line-height:1.9;color:#475569;">{{content}}</p>
          </article>
        {{/each}}
      </section>

      <section style="padding:28px 46px 42px 46px;">
        <div style="padding:26px;border-radius:20px;background:#0f172a;color:#e2e8f0;">
          <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#93c5fd;font-weight:700;">Recommendations</div>
          <ul style="margin:16px 0 0 22px;padding:0;font-size:15px;line-height:1.85;">
            {{#each recommendations}}
              <li style="margin-bottom:10px;">{{this}}</li>
            {{/each}}
          </ul>
        </div>
      </section>
    </main>
  </body>
</html>`,
    sampleData: {
      companyName: 'Oak & Pine Logistics',
      reportTitle: 'Monthly Operations Report',
      period: 'March 2026',
      preparedBy: 'Danielle Brooks',
      date: 'April 2, 2026',
      highlights: [
        { metric: 'On-time delivery', value: '98.4%', change: '+1.6 pts vs prior month' },
        { metric: 'Average order value', value: '$428', change: '+8.1% month over month' },
        { metric: 'Support tickets', value: '214', change: '-12% month over month' }
      ],
      sections: [
        {
          title: 'Executive summary',
          content: 'March performance improved across fulfillment speed and customer retention. The west region distribution center achieved its highest on-time rate of the quarter, offsetting minor delays tied to weather disruptions in the northeast lane.'
        },
        {
          title: 'Operational trends',
          content: 'Warehouse utilization remained stable while average pick time declined after the new handheld scanner rollout. Support demand also decreased as self-service tracking adoption increased among mid-market accounts.'
        },
        {
          title: 'Risks and watch items',
          content: 'Fuel costs continue to trend upward and could compress margins if negotiated carrier rate increases continue into May. Inventory accuracy at the Dallas site remains below target following a late-month product launch spike.'
        }
      ],
      recommendations: [
        'Expand the handheld scanner deployment to the remaining two warehouses before mid-May.',
        'Approve a temporary cycle-counting task force for the Dallas site to restore inventory accuracy above 99%.',
        'Review carrier contract options to mitigate projected fuel surcharge increases in Q2.'
      ]
    }
  }
];
