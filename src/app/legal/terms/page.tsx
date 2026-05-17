import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500">Last updated: May 17, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using DocForge (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If
        you do not agree, do not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        DocForge provides a document generation API that converts HTML and Handlebars templates into PDF documents. The
        Service includes template management, PDF rendering, team collaboration, and usage analytics.
      </p>

      <h2>3. Account Registration</h2>
      <p>
        You must provide accurate information when creating an account. You are responsible for maintaining the security
        of your account credentials and API keys. Notify us immediately of any unauthorized use.
      </p>

      <h2>4. Subscription Plans and Billing</h2>
      <ul>
        <li>
          <strong>Free:</strong> 50 renders/month, 1 webhook endpoint
        </li>
        <li>
          <strong>Pro ($29/mo):</strong> 5,000 renders/month, 5 webhook endpoints
        </li>
        <li>
          <strong>Business ($99/mo):</strong> 50,000 renders/month, 20 webhook endpoints
        </li>
      </ul>
      <p>
        Subscriptions renew automatically. You may cancel at any time via the billing dashboard. No refunds for partial
        billing periods.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>
        You agree not to use the Service to generate documents containing illegal content, malware, or material that
        infringes intellectual property rights. See our <a href="/legal/acceptable-use">Acceptable Use Policy</a> for
        details.
      </p>

      <h2>6. API Usage and Rate Limits</h2>
      <p>
        API requests are subject to rate limits based on your subscription tier. Exceeding limits results in 429
        responses. Systematic abuse may result in account suspension.
      </p>

      <h2>7. Data Ownership</h2>
      <p>
        You retain all rights to your templates, data, and generated documents. DocForge does not claim ownership of any
        content you create or process through the Service.
      </p>

      <h2>8. Service Availability</h2>
      <p>
        We target 99.9% uptime for Pro and Business plans. We do not guarantee uninterrupted service. Scheduled
        maintenance will be communicated in advance when possible.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        DocForge is provided &quot;as is&quot; without warranties of any kind. Our total liability is limited to the
        amount paid by you in the 12 months preceding the claim.
      </p>

      <h2>10. Termination</h2>
      <p>
        Either party may terminate at any time. Upon termination, your data will be retained for 30 days before
        permanent deletion, unless you request immediate deletion.
      </p>

      <h2>11. Changes to Terms</h2>
      <p>
        We may update these terms with 30 days notice via email. Continued use after changes constitutes acceptance of
        the updated terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these terms? Contact us at <a href="mailto:legal@docforge.app">legal@docforge.app</a>.
      </p>
    </>
  );
}
