const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

const requiredForBilling = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_BUSINESS_PRICE_ID',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Stripe vars are only required if payments are enabled (warn, don't error)
  const missingStripe: string[] = [];
  for (const key of requiredForBilling) {
    if (!process.env[key]) {
      missingStripe.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ MISSING REQUIRED ENVIRONMENT VARIABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${missing.map(k => `  • ${k}`).join('\n')}

The application cannot start without these variables.
Check your .env file or deployment environment configuration.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    process.exit(1);
  }

  if (missingStripe.length > 0) {
    console.warn(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  STRIPE CONFIGURATION INCOMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Missing: ${missingStripe.join(', ')}

Billing features (Pro/Business plans) will be unavailable.
This is fine for local development, but fix before production.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  }
}
