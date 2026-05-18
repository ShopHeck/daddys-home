export const TEMPLATE_PAY_STUB = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 44px rgba(15,23,42,0.14);">
      <header style="background:#7c3aed;padding:36px 44px;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.75;">Earnings Statement</div>
              <div style="margin-top:12px;font-size:30px;font-weight:700;">{{companyName}}</div>
              <div style="margin-top:8px;font-size:14px;opacity:0.85;">{{companyAddress}}</div>
            </td>
            <td style="width:200px;text-align:right;vertical-align:top;">
              <div style="display:inline-block;padding:14px 18px;border:1px solid rgba(255,255,255,0.25);border-radius:16px;background:rgba(255,255,255,0.08);text-align:left;">
                <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.7;">Pay Period</div>
                <div style="margin-top:6px;font-size:14px;">{{payPeriod}}</div>
                <div style="margin-top:12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.7;">Pay Date</div>
                <div style="margin-top:6px;font-size:14px;font-weight:700;">{{payDate}}</div>
              </div>
            </td>
          </tr>
        </table>
      </header>

      <section style="padding:28px 44px 16px 44px;">
        <div style="padding:20px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="vertical-align:top;">
                <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-weight:700;">Employee</div>
                <div style="margin-top:8px;font-size:18px;font-weight:700;color:#0f172a;">{{employeeName}}</div>
                <div style="margin-top:4px;font-size:13px;color:#475569;">{{employeeTitle}}</div>
              </td>
              <td style="vertical-align:top;text-align:center;">
                <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-weight:700;">Employee ID</div>
                <div style="margin-top:8px;font-size:15px;font-weight:700;color:#0f172a;">{{employeeId}}</div>
              </td>
              <td style="vertical-align:top;text-align:right;">
                <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-weight:700;">Department</div>
                <div style="margin-top:8px;font-size:15px;font-weight:700;color:#0f172a;">{{department}}</div>
              </td>
            </tr>
          </table>
        </div>
      </section>

      <section style="padding:12px 44px;">
        <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7c3aed;font-weight:700;margin-bottom:14px;">Earnings</div>
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:16px;overflow:hidden;">
          <thead>
            <tr style="background:#faf5ff;">
              <th style="padding:14px 16px;text-align:left;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #dbe4f0;">Description</th>
              <th style="padding:14px 16px;text-align:center;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #dbe4f0;">Hours</th>
              <th style="padding:14px 16px;text-align:right;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #dbe4f0;">Rate</th>
              <th style="padding:14px 16px;text-align:right;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #dbe4f0;">Current</th>
              <th style="padding:14px 16px;text-align:right;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #dbe4f0;">YTD</th>
            </tr>
          </thead>
          <tbody>
            {{#each earnings}}
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;">{{description}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:center;color:#475569;">{{hours}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;color:#475569;">{{rate}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;font-weight:700;color:#0f172a;">{{current}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;color:#475569;">{{ytd}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:20px 44px;">
        <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7c3aed;font-weight:700;margin-bottom:14px;">Deductions</div>
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:16px;overflow:hidden;">
          <thead>
            <tr style="background:#faf5ff;">
              <th style="padding:14px 16px;text-align:left;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #dbe4f0;">Description</th>
              <th style="padding:14px 16px;text-align:right;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #dbe4f0;">Current</th>
              <th style="padding:14px 16px;text-align:right;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #dbe4f0;">YTD</th>
            </tr>
          </thead>
          <tbody>
            {{#each deductions}}
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;">{{description}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;font-weight:700;color:#dc2626;">-{{current}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;color:#475569;">{{ytd}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:16px 44px 40px 44px;">
        <div style="padding:24px;border-radius:18px;background:#0f172a;color:#ffffff;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 12px 0;font-size:14px;color:#94a3b8;">Gross Pay</td>
              <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#e2e8f0;">{{grossPay}}</td>
              <td style="padding:0 0 12px 0;font-size:14px;color:#94a3b8;padding-left:32px;">YTD Gross</td>
              <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#e2e8f0;">{{ytdGross}}</td>
            </tr>
            <tr>
              <td style="padding:0 0 12px 0;font-size:14px;color:#94a3b8;">Total Deductions</td>
              <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#e2e8f0;">{{totalDeductions}}</td>
              <td style="padding:0 0 12px 0;font-size:14px;color:#94a3b8;padding-left:32px;">YTD Deductions</td>
              <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#e2e8f0;">{{ytdDeductions}}</td>
            </tr>
            <tr>
              <td colspan="4" style="padding:12px 0;"><div style="height:1px;background:rgba(255,255,255,0.15);"></div></td>
            </tr>
            <tr>
              <td style="padding:0;font-size:16px;font-weight:700;">Net Pay</td>
              <td style="padding:0;font-size:28px;font-weight:700;text-align:right;">{{netPay}}</td>
              <td style="padding:0;font-size:14px;color:#94a3b8;padding-left:32px;">YTD Net</td>
              <td style="padding:0;font-size:16px;font-weight:700;text-align:right;color:#a78bfa;">{{ytdNet}}</td>
            </tr>
          </table>
        </div>
      </section>
    </main>
  </body>
</html>`;

export const SAMPLE_PAY_STUB = {
  companyName: 'Pinnacle Software Inc.',
  companyAddress: '5500 Technology Drive, San Jose, CA 95134',
  payPeriod: 'Apr 1 - Apr 15, 2026',
  payDate: 'April 18, 2026',
  employeeName: 'James Okafor',
  employeeTitle: 'Senior Backend Engineer',
  employeeId: 'EMP-4821',
  department: 'Engineering',
  earnings: [
    { description: 'Regular Salary', hours: '80', rate: '$72.12/hr', current: '$5,769.23', ytd: '$34,615.38' },
    { description: 'Overtime', hours: '6', rate: '$108.17/hr', current: '$649.04', ytd: '$2,596.15' },
    { description: 'On-call Bonus', hours: '-', rate: 'Flat', current: '$250.00', ytd: '$1,500.00' }
  ],
  deductions: [
    { description: 'Federal Income Tax', current: '$1,198.07', ytd: '$7,188.42' },
    { description: 'State Income Tax (CA)', current: '$486.21', ytd: '$2,917.26' },
    { description: 'Social Security (OASDI)', current: '$413.15', ytd: '$2,478.90' },
    { description: 'Medicare', current: '$96.59', ytd: '$579.54' },
    { description: 'Health Insurance (PPO)', current: '$187.50', ytd: '$1,125.00' },
    { description: '401(k) Contribution (8%)', current: '$533.06', ytd: '$3,198.38' }
  ],
  grossPay: '$6,668.27',
  ytdGross: '$38,711.53',
  totalDeductions: '$2,914.58',
  ytdDeductions: '$17,487.50',
  netPay: '$3,753.69',
  ytdNet: '$21,224.03'
};
