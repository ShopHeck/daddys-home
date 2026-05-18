export const TEMPLATE_PROJECT_STATUS = `<html>
  <body style="margin:0;padding:32px;background:#e2e8f0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <main style="max-width:794px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 44px rgba(15,23,42,0.14);">
      <header style="background:#0f172a;padding:40px 46px;color:#ffffff;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#94a3b8;">Project Status Report</div>
              <div style="margin-top:14px;font-size:32px;font-weight:700;line-height:1.15;">{{projectName}}</div>
              <div style="margin-top:10px;font-size:15px;color:#cbd5e1;">{{reportDate}} &middot; Week {{weekNumber}}</div>
            </td>
            <td style="width:140px;text-align:right;vertical-align:top;">
              <div style="display:inline-block;padding:16px 20px;border-radius:18px;background:{{statusColor}};text-align:center;">
                <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.8);">Status</div>
                <div style="margin-top:6px;font-size:22px;font-weight:700;color:#ffffff;">{{overallStatus}}</div>
              </div>
            </td>
          </tr>
        </table>
      </header>

      <section style="padding:28px 46px 12px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">Summary</div>
        <div style="margin-top:14px;padding:22px;border:1px solid #dbe4f0;border-radius:16px;background:#f8fafc;font-size:15px;line-height:1.85;color:#334155;">{{summary}}</div>
      </section>

      <section style="padding:18px 46px 12px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:14px;">Milestones</div>
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dbe4f0;border-radius:16px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:14px 16px;text-align:left;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Milestone</th>
              <th style="padding:14px 16px;text-align:center;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Due</th>
              <th style="padding:14px 16px;text-align:center;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Status</th>
              <th style="padding:14px 16px;text-align:right;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#475569;border-bottom:1px solid #dbe4f0;">Progress</th>
            </tr>
          </thead>
          <tbody>
            {{#each milestones}}
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;color:#0f172a;">{{name}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:center;color:#475569;">{{dueDate}}</td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;text-align:center;"><span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;background:{{statusBg}};color:{{statusText}};">{{status}}</span></td>
                <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;font-weight:700;color:#0f172a;">{{progress}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </section>

      <section style="padding:18px 46px 12px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:14px;">Completed This Week</div>
        <div style="padding:18px 20px;border:1px solid #dbe4f0;border-radius:14px;background:#f0fdf4;">
          <ul style="margin:0;padding:0 0 0 20px;font-size:14px;line-height:2;color:#166534;">
            {{#each completedItems}}
              <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
      </section>

      <section style="padding:18px 46px 12px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:14px;">Planned Next Week</div>
        <div style="padding:18px 20px;border:1px solid #dbe4f0;border-radius:14px;background:#eff6ff;">
          <ul style="margin:0;padding:0 0 0 20px;font-size:14px;line-height:2;color:#1e40af;">
            {{#each plannedItems}}
              <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
      </section>

      <section style="padding:18px 46px 36px 46px;">
        <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#dc2626;font-weight:700;margin-bottom:14px;">Risks &amp; Blockers</div>
        {{#each risks}}
          <div style="margin-bottom:12px;padding:16px 18px;border-left:4px solid {{severityColor}};background:#fef2f2;border-radius:0 12px 12px 0;">
            <div style="font-size:14px;font-weight:700;color:#0f172a;">{{title}}</div>
            <div style="margin-top:6px;font-size:13px;line-height:1.7;color:#475569;">{{description}}</div>
            <div style="margin-top:6px;font-size:12px;color:#6b7280;">Mitigation: {{mitigation}}</div>
          </div>
        {{/each}}
      </section>
    </main>
  </body>
</html>`;

export const SAMPLE_PROJECT_STATUS = {
  projectName: 'Customer Portal v2.0',
  reportDate: 'April 11, 2026',
  weekNumber: '6',
  overallStatus: 'On Track',
  statusColor: '#16a34a',
  summary: 'Sprint 3 completed on schedule. The authentication module passed all acceptance criteria, and the dashboard redesign received stakeholder approval. The team is now beginning API integration work for the billing module, with delivery expected mid-next-week.',
  milestones: [
    { name: 'Authentication & SSO', dueDate: 'Apr 4', status: 'Complete', progress: '100%', statusBg: '#dcfce7', statusText: '#166534' },
    { name: 'Dashboard Redesign', dueDate: 'Apr 11', status: 'Complete', progress: '100%', statusBg: '#dcfce7', statusText: '#166534' },
    { name: 'Billing Integration', dueDate: 'Apr 25', status: 'In Progress', progress: '35%', statusBg: '#dbeafe', statusText: '#1e40af' },
    { name: 'Reporting Module', dueDate: 'May 9', status: 'Not Started', progress: '0%', statusBg: '#f1f5f9', statusText: '#475569' },
    { name: 'User Acceptance Testing', dueDate: 'May 16', status: 'Not Started', progress: '0%', statusBg: '#f1f5f9', statusText: '#475569' }
  ],
  completedItems: [
    'Implemented role-based access control with three permission tiers',
    'Completed dashboard card components with real-time data binding',
    'Resolved 8 QA tickets from Sprint 2 regression testing',
    'Delivered stakeholder demo and received sign-off on dashboard UX'
  ],
  plannedItems: [
    'Begin Stripe billing API integration for subscription management',
    'Build invoice history view with PDF download capability',
    'Start reporting module database schema design',
    'Schedule mid-sprint review with product owner'
  ],
  risks: [
    { title: 'Third-party API rate limits', description: 'Stripe sandbox has stricter rate limits than production, slowing integration testing.', mitigation: 'Implement request queuing and mock server for unit tests.', severityColor: '#f59e0b' },
    { title: 'Design resource availability', description: 'Lead designer on PTO next week, which may delay reporting module mockups.', mitigation: 'Pull mockup work forward to this week and get async feedback.', severityColor: '#ef4444' }
  ]
};
