export const TEMPLATE_SERVICE_CONTRACT = `<html>
  <body style="margin:0;padding:36px;background:#f1f5f9;font-family:Georgia,'Times New Roman',serif;color:#1e293b;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;padding:56px 64px;border-radius:18px;box-shadow:0 18px 44px rgba(15,23,42,0.12);">
      <header style="border-bottom:2px solid #1e293b;padding-bottom:28px;">
        <div style="font-size:13px;letter-spacing:0.24em;text-transform:uppercase;color:#64748b;">Service Agreement</div>
        <div style="margin-top:12px;font-size:32px;font-weight:700;color:#0f172a;">{{contractTitle}}</div>
        <table role="presentation" style="width:100%;margin-top:18px;border-collapse:collapse;">
          <tr>
            <td style="font-size:15px;color:#475569;">Effective Date: <strong>{{effectiveDate}}</strong></td>
            <td style="text-align:right;font-size:15px;color:#475569;">Contract #{{contractNumber}}</td>
          </tr>
        </table>
      </header>

      <section style="margin-top:32px;">
        <div style="font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:18px;">Parties</div>
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:16px 0;">
          <tr>
            <td style="width:50%;vertical-align:top;padding:22px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;font-weight:700;">Service Provider</div>
              <div style="margin-top:12px;font-size:18px;font-weight:700;color:#0f172a;">{{providerName}}</div>
              <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;">{{providerAddress}}</div>
            </td>
            <td style="width:50%;vertical-align:top;padding:22px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;font-weight:700;">Client</div>
              <div style="margin-top:12px;font-size:18px;font-weight:700;color:#0f172a;">{{clientName}}</div>
              <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;">{{clientAddress}}</div>
            </td>
          </tr>
        </table>
      </section>

      <section style="margin-top:36px;">
        <div style="font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:18px;">Terms &amp; Conditions</div>
        {{#each clauses}}
          <div style="margin-bottom:22px;padding:20px 24px;border-left:4px solid #1d4ed8;background:#f8fafc;border-radius:0 14px 14px 0;">
            <div style="font-size:16px;font-weight:700;color:#0f172a;">{{number}}. {{title}}</div>
            <div style="margin-top:10px;font-size:15px;line-height:1.85;color:#334155;">{{body}}</div>
          </div>
        {{/each}}
      </section>

      <section style="margin-top:36px;">
        <div style="font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:18px;">Payment Terms</div>
        <div style="padding:24px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 14px 0;font-size:15px;color:#475569;">Total Contract Value</td>
              <td style="padding:0 0 14px 0;font-size:15px;text-align:right;font-weight:700;color:#0f172a;">{{totalValue}}</td>
            </tr>
            <tr>
              <td style="padding:0 0 14px 0;font-size:15px;color:#475569;">Payment Schedule</td>
              <td style="padding:0 0 14px 0;font-size:15px;text-align:right;color:#334155;">{{paymentSchedule}}</td>
            </tr>
            <tr>
              <td style="padding:0;font-size:15px;color:#475569;">Payment Terms</td>
              <td style="padding:0;font-size:15px;text-align:right;color:#334155;">{{paymentTerms}}</td>
            </tr>
          </table>
        </div>
      </section>

      <footer style="margin-top:52px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;padding-right:32px;vertical-align:top;">
              <div style="font-size:14px;color:#64748b;">Service Provider</div>
              <div style="margin-top:56px;border-top:1px solid #94a3b8;padding-top:12px;">
                <div style="font-size:17px;font-weight:700;color:#0f172a;">{{providerSignatory}}</div>
                <div style="margin-top:4px;font-size:14px;color:#475569;">{{providerTitle}}</div>
                <div style="margin-top:4px;font-size:14px;color:#64748b;">Date: _______________</div>
              </div>
            </td>
            <td style="width:50%;padding-left:32px;vertical-align:top;">
              <div style="font-size:14px;color:#64748b;">Client</div>
              <div style="margin-top:56px;border-top:1px solid #94a3b8;padding-top:12px;">
                <div style="font-size:17px;font-weight:700;color:#0f172a;">{{clientSignatory}}</div>
                <div style="margin-top:4px;font-size:14px;color:#475569;">{{clientTitle}}</div>
                <div style="margin-top:4px;font-size:14px;color:#64748b;">Date: _______________</div>
              </div>
            </td>
          </tr>
        </table>
      </footer>
    </main>
  </body>
</html>`;

export const SAMPLE_SERVICE_CONTRACT = {
  contractTitle: 'Website Redesign & Development Services',
  effectiveDate: 'May 1, 2026',
  contractNumber: 'SA-2026-0847',
  providerName: 'Clearpath Digital LLC',
  providerAddress: '340 Innovation Drive, Suite 200\nAustin, TX 78701\nhello@clearpath.dev',
  clientName: 'Greenfield Organics Inc.',
  clientAddress: '1200 Commerce Way\nPortland, OR 97204\noperations@greenfieldorganics.com',
  clauses: [
    { number: '1', title: 'Scope of Services', body: 'Provider shall deliver a complete website redesign including UX research, responsive design, front-end development, CMS integration, and post-launch support as detailed in the attached Statement of Work (Exhibit A).' },
    { number: '2', title: 'Term', body: 'This agreement shall commence on the Effective Date and continue for a period of twelve (12) weeks unless terminated earlier in accordance with Section 5 of this agreement.' },
    { number: '3', title: 'Intellectual Property', body: 'Upon full payment, all deliverables and work product created under this agreement shall become the exclusive property of the Client, except for pre-existing tools, libraries, and frameworks owned by Provider.' },
    { number: '4', title: 'Confidentiality', body: 'Both parties agree to maintain strict confidentiality of all proprietary information shared during the engagement. This obligation survives termination for a period of two (2) years.' },
    { number: '5', title: 'Termination', body: 'Either party may terminate this agreement with thirty (30) days written notice. In the event of termination, Client shall pay for all work completed through the termination date.' },
    { number: '6', title: 'Limitation of Liability', body: 'Provider\'s total liability shall not exceed the total contract value. Neither party shall be liable for indirect, incidental, or consequential damages arising from this agreement.' }
  ],
  totalValue: '$42,000',
  paymentSchedule: '3 milestone payments',
  paymentTerms: 'Net 15 from invoice date',
  providerSignatory: 'Daniel Reeves',
  providerTitle: 'Managing Partner, Clearpath Digital',
  clientSignatory: 'Sarah Nakamura',
  clientTitle: 'CEO, Greenfield Organics'
};
