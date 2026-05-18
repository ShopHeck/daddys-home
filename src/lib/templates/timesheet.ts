export const TEMPLATE_TIMESHEET = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 44px rgba(15,23,42,0.14);">
      <header style="background:#0369a1;padding:36px 44px;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.75;">Consulting Timesheet</div>
              <div style="margin-top:12px;font-size:28px;font-weight:700;">{{consultantName}}</div>
              <div style="margin-top:6px;font-size:14px;opacity:0.85;">{{consultantCompany}}</div>
            </td>
            <td style="width:200px;text-align:right;vertical-align:top;">
              <div style="display:inline-block;padding:14px 18px;border:1px solid rgba(255,255,255,0.25);border-radius:16px;background:rgba(255,255,255,0.08);text-align:left;">
                <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.7;">Week of</div>
                <div style="margin-top:6px;font-size:15px;font-weight:700;">{{weekOf}}</div>
                <div style="margin-top:12px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.7;">Invoice #</div>
                <div style="margin-top:6px;font-size:15px;">{{invoiceNumber}}</div>
              </div>
            </td>
          </tr>
        </table>
      </header>

      <section style="padding:28px 44px 12px 44px;">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:16px 0;">
          <tr>
            <td style="width:50%;vertical-align:top;padding:18px;border:1px solid #dbe4f0;border-radius:14px;background:#f8fafc;">
              <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-weight:700;">Client</div>
              <div style="margin-top:8px;font-size:16px;font-weight:700;color:#0f172a;">{{clientName}}</div>
              <div style="margin-top:4px;font-size:13px;color:#475569;">{{clientContact}}</div>
            </td>
            <td style="width:50%;vertical-align:top;padding:18px;border:1px solid #dbe4f0;border-radius:14px;background:#f8fafc;">
              <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;font-weight:700;">Project</div>
              <div style="margin-top:8px;font-size:16px;font-weight:700;color:#0f172a;">{{projectName}}</div>
              <div style="margin-top:4px;font-size:13px;color:#475569;">Rate: {{hourlyRate}}</div>
            </td>
          </tr>
        </table>
      </section>

      <section style="padding:20px 44px;">
        <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0369a1;font-weight:700;margin-bottom:14px;">Time Entries</div>
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:16px;overflow:hidden;">
          <thead>
            <tr style="background:#f0f9ff;">
              <th style="padding:14px 16px;text-align:left;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#0369a1;border-bottom:1px solid #dbe4f0;">Day</th>
              <th style="padding:14px 16px;text-align:left;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#0369a1;border-bottom:1px solid #dbe4f0;">Task / Description</th>
              <th style="padding:14px 16px;text-align:center;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#0369a1;border-bottom:1px solid #dbe4f0;">Hours</th>
            </tr>
          </thead>
          <tbody>
            {{#each entries}}
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;white-space:nowrap;">{{day}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;">{{task}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:center;font-weight:700;color:#0f172a;">{{hours}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:16px 44px 36px 44px;">
        <div style="padding:24px;border-radius:18px;background:#0f172a;color:#ffffff;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 12px 0;font-size:14px;color:#94a3b8;">Total Hours</td>
              <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#e2e8f0;font-weight:700;">{{totalHours}}</td>
            </tr>
            <tr>
              <td style="padding:0 0 12px 0;font-size:14px;color:#94a3b8;">Hourly Rate</td>
              <td style="padding:0 0 12px 0;font-size:14px;text-align:right;color:#e2e8f0;">{{hourlyRate}}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px 0;"><div style="height:1px;background:rgba(255,255,255,0.15);"></div></td>
            </tr>
            <tr>
              <td style="padding:0;font-size:16px;font-weight:700;">Amount Due</td>
              <td style="padding:0;font-size:26px;font-weight:700;text-align:right;">{{amountDue}}</td>
            </tr>
          </table>
        </div>
      </section>

      <footer style="padding:0 44px 36px 44px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50%;padding-right:24px;vertical-align:top;">
              <div style="font-size:13px;color:#64748b;">Submitted by</div>
              <div style="margin-top:44px;border-top:1px solid #94a3b8;padding-top:10px;">
                <div style="font-size:16px;font-weight:700;color:#0f172a;">{{consultantName}}</div>
                <div style="margin-top:4px;font-size:13px;color:#64748b;">Date: _______________</div>
              </div>
            </td>
            <td style="width:50%;padding-left:24px;vertical-align:top;">
              <div style="font-size:13px;color:#64748b;">Approved by</div>
              <div style="margin-top:44px;border-top:1px solid #94a3b8;padding-top:10px;">
                <div style="font-size:16px;font-weight:700;color:#0f172a;">{{approverName}}</div>
                <div style="margin-top:4px;font-size:13px;color:#64748b;">Date: _______________</div>
              </div>
            </td>
          </tr>
        </table>
      </footer>
    </main>
  </body>
</html>`;

export const SAMPLE_TIMESHEET = {
  consultantName: 'Alex Rivera',
  consultantCompany: 'Rivera Consulting Group',
  weekOf: 'April 7 - April 11, 2026',
  invoiceNumber: 'TS-2026-0415',
  clientName: 'Meridian Financial Services',
  clientContact: 'Lisa Park, VP of Technology',
  projectName: 'Data Pipeline Modernization',
  hourlyRate: '$185/hr',
  entries: [
    { day: 'Monday', task: 'Architecture review and Kafka topic design for real-time event streaming', hours: '8.0' },
    { day: 'Tuesday', task: 'Implemented CDC connectors for PostgreSQL source databases', hours: '7.5' },
    { day: 'Wednesday', task: 'Schema registry setup and Avro schema definition for 12 event types', hours: '8.0' },
    { day: 'Wednesday', task: 'Team sync and technical decision review with platform lead', hours: '1.0' },
    { day: 'Thursday', task: 'Built dead-letter-queue handler with retry logic and alerting', hours: '7.0' },
    { day: 'Thursday', task: 'Code review for junior engineer\'s consumer service PR', hours: '1.5' },
    { day: 'Friday', task: 'Load testing pipeline at 10x expected throughput, performance tuning', hours: '6.0' },
    { day: 'Friday', task: 'Weekly status report and documentation updates', hours: '1.5' }
  ],
  totalHours: '40.5',
  amountDue: '$7,492.50',
  approverName: 'Lisa Park'
};
