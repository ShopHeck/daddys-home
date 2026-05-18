export const TEMPLATE_NDA = `<html>
  <body style="margin:0;padding:36px;background:#f1f5f9;font-family:Georgia,'Times New Roman',serif;color:#1e293b;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;padding:56px 64px;border-radius:18px;box-shadow:0 18px 44px rgba(15,23,42,0.12);">
      <header style="text-align:center;padding-bottom:32px;border-bottom:2px solid #1e293b;">
        <div style="font-size:13px;letter-spacing:0.28em;text-transform:uppercase;color:#64748b;">Mutual</div>
        <div style="margin-top:8px;font-size:36px;font-weight:700;color:#0f172a;">Non-Disclosure Agreement</div>
        <div style="margin-top:14px;font-size:15px;color:#475569;">Effective as of <strong>{{effectiveDate}}</strong></div>
      </header>

      <section style="margin-top:32px;">
        <div style="font-size:15px;line-height:1.9;color:#334155;">
          <p style="margin:0 0 18px 0;">This Mutual Non-Disclosure Agreement (&ldquo;Agreement&rdquo;) is entered into by and between:</p>
        </div>
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:16px 0;margin-top:8px;">
          <tr>
            <td style="width:50%;vertical-align:top;padding:22px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;font-weight:700;">Disclosing Party</div>
              <div style="margin-top:12px;font-size:18px;font-weight:700;color:#0f172a;">{{partyAName}}</div>
              <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;">{{partyAAddress}}</div>
            </td>
            <td style="width:50%;vertical-align:top;padding:22px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;font-weight:700;">Receiving Party</div>
              <div style="margin-top:12px;font-size:18px;font-weight:700;color:#0f172a;">{{partyBName}}</div>
              <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;white-space:pre-line;">{{partyBAddress}}</div>
            </td>
          </tr>
        </table>
      </section>

      <section style="margin-top:36px;">
        {{#each sections}}
          <div style="margin-bottom:26px;">
            <div style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:10px;">{{number}}. {{title}}</div>
            <div style="font-size:15px;line-height:1.9;color:#334155;padding-left:24px;border-left:3px solid #e2e8f0;">{{body}}</div>
          </div>
        {{/each}}
      </section>

      <section style="margin-top:36px;padding:24px;border-radius:16px;background:#0f172a;color:#e2e8f0;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#93c5fd;font-weight:700;">Term</div>
        <div style="margin-top:10px;font-size:16px;line-height:1.8;">This Agreement shall remain in effect for a period of <strong style="color:#ffffff;">{{term}}</strong> from the Effective Date. Obligations of confidentiality shall survive termination for <strong style="color:#ffffff;">{{survivalPeriod}}</strong>.</div>
      </section>

      <section style="margin-top:36px;padding:24px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;font-weight:700;">Governing Law</div>
        <div style="margin-top:10px;font-size:15px;line-height:1.8;color:#334155;">This Agreement shall be governed by the laws of the State of <strong>{{governingState}}</strong> without regard to conflict of law principles.</div>
      </section>

      <footer style="margin-top:52px;">
        <div style="font-size:15px;line-height:1.8;color:#334155;margin-bottom:32px;">IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.</div>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;padding-right:32px;vertical-align:top;">
              <div style="font-size:14px;color:#64748b;">{{partyAName}}</div>
              <div style="margin-top:56px;border-top:1px solid #94a3b8;padding-top:12px;">
                <div style="font-size:17px;font-weight:700;color:#0f172a;">{{partyASignatory}}</div>
                <div style="margin-top:4px;font-size:14px;color:#475569;">{{partyATitle}}</div>
                <div style="margin-top:4px;font-size:14px;color:#64748b;">Date: _______________</div>
              </div>
            </td>
            <td style="width:50%;padding-left:32px;vertical-align:top;">
              <div style="font-size:14px;color:#64748b;">{{partyBName}}</div>
              <div style="margin-top:56px;border-top:1px solid #94a3b8;padding-top:12px;">
                <div style="font-size:17px;font-weight:700;color:#0f172a;">{{partyBSignatory}}</div>
                <div style="margin-top:4px;font-size:14px;color:#475569;">{{partyBTitle}}</div>
                <div style="margin-top:4px;font-size:14px;color:#64748b;">Date: _______________</div>
              </div>
            </td>
          </tr>
        </table>
      </footer>
    </main>
  </body>
</html>`;

export const SAMPLE_NDA = {
  effectiveDate: 'May 5, 2026',
  partyAName: 'Helix Ventures Inc.',
  partyAAddress: '900 Third Avenue, Floor 22\nNew York, NY 10022',
  partyBName: 'Arcwright Engineering Ltd.',
  partyBAddress: '4100 Westheimer Road, Suite 310\nHouston, TX 77027',
  sections: [
    { number: '1', title: 'Definition of Confidential Information', body: 'Confidential Information means all non-public information disclosed by either party, whether in writing, orally, or by inspection, including but not limited to business plans, financial data, technical specifications, customer lists, trade secrets, and proprietary software.' },
    { number: '2', title: 'Exclusions', body: 'Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was known to the Receiving Party prior to disclosure; (c) is independently developed without use of the Confidential Information; or (d) is disclosed pursuant to a legal requirement, provided reasonable notice is given.' },
    { number: '3', title: 'Obligations of the Receiving Party', body: 'The Receiving Party shall: (a) use the Confidential Information solely for the purpose of evaluating a potential business relationship; (b) restrict disclosure to employees and advisors with a need to know; (c) protect the information with at least the same degree of care used for its own confidential materials.' },
    { number: '4', title: 'Return of Materials', body: 'Upon termination or at the Disclosing Party\'s written request, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof, and certify such destruction in writing.' },
    { number: '5', title: 'No License Granted', body: 'Nothing in this Agreement grants any license or right to use the Confidential Information beyond the limited evaluation purpose described herein. No intellectual property rights are transferred.' },
    { number: '6', title: 'Remedies', body: 'Both parties acknowledge that a breach may cause irreparable harm for which monetary damages would be insufficient. The Disclosing Party shall be entitled to seek equitable relief, including injunction, in addition to any other available remedies.' }
  ],
  term: 'two (2) years',
  survivalPeriod: 'three (3) additional years',
  governingState: 'New York',
  partyASignatory: 'Michael Torres',
  partyATitle: 'General Counsel',
  partyBSignatory: 'Rachel Kim',
  partyBTitle: 'Chief Operating Officer'
};
