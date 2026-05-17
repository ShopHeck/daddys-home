import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
};

export default function AcceptableUsePage() {
  return (
    <>
      <h1>Acceptable Use Policy</h1>
      <p className="text-sm text-slate-500">Last updated: May 17, 2026</p>

      <h2>Permitted Use</h2>
      <p>
        DocForge is designed for legitimate document generation including invoices, contracts, reports, certificates,
        receipts, and other business documents.
      </p>

      <h2>Prohibited Content</h2>
      <p>You may not use DocForge to generate documents that contain:</p>
      <ul>
        <li>Illegal content or content that facilitates illegal activity</li>
        <li>Malware, phishing content, or deceptive material</li>
        <li>Content that infringes intellectual property rights</li>
        <li>Harassment, hate speech, or threats</li>
        <li>Sexually explicit material involving minors</li>
        <li>Fraudulent documents (fake IDs, forged certificates, counterfeit currency)</li>
        <li>Spam or bulk unsolicited communications</li>
      </ul>

      <h2>Prohibited Behavior</h2>
      <ul>
        <li>Attempting to bypass rate limits or usage quotas</li>
        <li>Sharing API keys publicly or with unauthorized parties</li>
        <li>Reverse engineering the Service</li>
        <li>Using the Service to benchmark competing products</li>
        <li>Automated scraping of the marketplace or documentation</li>
        <li>Attempting to access other users&apos; data or templates</li>
      </ul>

      <h2>Template Security</h2>
      <p>
        Templates are rendered in a sandboxed environment. Attempting to escape the sandbox, access server resources, or
        execute arbitrary code is strictly prohibited and may result in immediate account termination.
      </p>

      <h2>Enforcement</h2>
      <p>Violations may result in:</p>
      <ol>
        <li>Warning notification</li>
        <li>Temporary API key suspension</li>
        <li>Account termination</li>
        <li>Reporting to law enforcement (for illegal content)</li>
      </ol>

      <h2>Reporting</h2>
      <p>
        Report violations to <a href="mailto:abuse@docforge.app">abuse@docforge.app</a>.
      </p>
    </>
  );
}
