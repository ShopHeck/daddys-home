import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: May 17, 2026</p>

      <h2>1. Information We Collect</h2>
      <h3>Account Information</h3>
      <ul>
        <li>Email address</li>
        <li>Name (optional)</li>
        <li>Profile image (via OAuth providers)</li>
        <li>Payment information (processed by Stripe — we do not store card numbers)</li>
      </ul>

      <h3>Usage Data</h3>
      <ul>
        <li>API request logs (endpoint, timestamp, response status, duration)</li>
        <li>Render history (template ID, file size, success/failure)</li>
        <li>IP addresses for rate limiting and security</li>
      </ul>

      <h3>Content You Provide</h3>
      <ul>
        <li>Templates (HTML/Handlebars content)</li>
        <li>Data payloads sent to the render API</li>
        <li>Generated PDF documents (stored temporarily per your plan tier)</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide and maintain the Service</li>
        <li>Process payments and manage subscriptions</li>
        <li>Send transactional emails (password resets, billing alerts, usage warnings)</li>
        <li>Enforce rate limits and prevent abuse</li>
        <li>Improve service reliability and performance</li>
      </ul>

      <h2>3. Data Retention</h2>
      <table>
        <thead>
          <tr>
            <th>Data Type</th>
            <th>Retention</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account data</td>
            <td>Until account deletion</td>
          </tr>
          <tr>
            <td>Templates</td>
            <td>Until deleted by user</td>
          </tr>
          <tr>
            <td>Generated PDFs (Free)</td>
            <td>7 days</td>
          </tr>
          <tr>
            <td>Generated PDFs (Pro)</td>
            <td>30 days</td>
          </tr>
          <tr>
            <td>Generated PDFs (Business)</td>
            <td>90 days</td>
          </tr>
          <tr>
            <td>Usage records</td>
            <td>12 months</td>
          </tr>
          <tr>
            <td>Server logs</td>
            <td>30 days</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Data Sharing</h2>
      <p>We do not sell your data. We share data only with:</p>
      <ul>
        <li>
          <strong>Stripe</strong> — payment processing
        </li>
        <li>
          <strong>Sentry</strong> — error monitoring (anonymized)
        </li>
        <li>
          <strong>Resend</strong> — transactional email delivery
        </li>
        <li>
          <strong>Cloud infrastructure providers</strong> — hosting and storage
        </li>
      </ul>

      <h2>5. Your Rights (GDPR/CCPA)</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access:</strong> Export all your data via <code>GET /api/v1/account/data-export</code>
        </li>
        <li>
          <strong>Rectification:</strong> Update your profile in the dashboard
        </li>
        <li>
          <strong>Erasure:</strong> Delete your account via <code>DELETE /api/v1/account</code> or dashboard settings
        </li>
        <li>
          <strong>Portability:</strong> Export data in JSON format
        </li>
        <li>
          <strong>Objection:</strong> Contact us to opt out of non-essential processing
        </li>
      </ul>

      <h2>6. Security</h2>
      <p>
        We implement industry-standard security measures including encryption in transit (TLS), hashed API keys
        (SHA-256), rate limiting, and access controls. See our <a href="/security">Security Policy</a> for details.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use essential cookies only (session authentication). We do not use tracking cookies or third-party analytics
        cookies.
      </p>

      <h2>8. Contact</h2>
      <p>
        Data Protection Officer: <a href="mailto:privacy@docforge.app">privacy@docforge.app</a>
      </p>
    </>
  );
}
