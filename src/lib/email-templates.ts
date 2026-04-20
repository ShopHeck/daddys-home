const brandColors = {
  background: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  text: '#e2e8f0',
  muted: '#94a3b8',
  accent: '#2563eb',
  accentText: '#ffffff'
} as const

function createEmailShell(params: {
  preview: string
  title: string
  body: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  footerNote?: string
}) {
  const { preview, title, body, primaryCta, secondaryCta, footerNote } = params

  return `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 24px 12px; background: ${brandColors.background}; color: ${brandColors.text}; font-family: Arial, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">${preview}</div>
        <div style="max-width: 500px; margin: 0 auto; background: ${brandColors.card}; border: 1px solid ${brandColors.border}; border-radius: 16px; padding: 32px 24px; box-sizing: border-box;">
          <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${brandColors.accent}; margin: 0 0 16px;">DocForge</div>
          <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2; color: ${brandColors.accentText};">${title}</h1>
          <div style="font-size: 16px; line-height: 1.65; color: ${brandColors.text};">${body}</div>
          ${
            primaryCta
              ? `<div style="margin: 28px 0 0;"><a href="${primaryCta.href}" style="display: inline-block; background: ${brandColors.accent}; color: ${brandColors.accentText}; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-size: 15px; font-weight: 700;">${primaryCta.label}</a></div>`
              : ''
          }
          ${
            secondaryCta
              ? `<div style="margin: 18px 0 0;"><a href="${secondaryCta.href}" style="color: ${brandColors.accent}; text-decoration: none; font-size: 15px; font-weight: 600;">${secondaryCta.label}</a></div>`
              : ''
          }
          ${
            footerNote
              ? `<p style="margin: 28px 0 0; font-size: 14px; line-height: 1.6; color: ${brandColors.muted};">${footerNote}</p>`
              : ''
          }
        </div>
        <p style="max-width: 500px; margin: 16px auto 0; padding: 0 4px; font-size: 12px; line-height: 1.5; color: ${brandColors.muted}; text-align: center;">You received this because you have a DocForge account.</p>
      </body>
    </html>
  `
}

export function passwordResetEmail(params: { name: string; resetUrl: string }): string {
  return createEmailShell({
    preview: 'Reset your DocForge password.',
    title: 'Reset your password',
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 12px;">We received a request to reset your DocForge password. Click the button below to choose a new password.</p>
    `,
    primaryCta: {
      label: 'Reset Password',
      href: params.resetUrl
    },
    footerNote: "This link expires in 1 hour. If you didn't request this, you can safely ignore this email."
  })
}

export function welcomeEmail(params: { name: string; dashboardUrl: string; docsUrl: string }): string {
  return createEmailShell({
    preview: 'Welcome to DocForge. Start generating PDFs from HTML templates.',
    title: 'Welcome to DocForge!',
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 20px;">You can now generate PDFs from HTML templates via our API.</p>
      <div style="margin: 0 0 20px; padding: 16px; background: rgba(15, 23, 42, 0.55); border: 1px solid ${brandColors.border}; border-radius: 12px;">
        <p style="margin: 0 0 12px; font-weight: 700; color: ${brandColors.accentText};">Quick start</p>
        <ol style="margin: 0; padding-left: 20px;">
          <li style="margin: 0 0 8px;">Create an API key in your dashboard</li>
          <li style="margin: 0 0 8px;">Upload an HTML or Handlebars template</li>
          <li style="margin: 0;">Send data to the render endpoint and get a PDF back</li>
        </ol>
      </div>
    `,
    primaryCta: {
      label: 'Go to Dashboard',
      href: params.dashboardUrl
    },
    secondaryCta: {
      label: 'Read the docs',
      href: params.docsUrl
    },
    footerNote: "You're on the Free plan (50 docs/month). Upgrade anytime."
  })
}

export function usageWarningEmail(params: {
  name: string
  used: number
  limit: number
  tier: string
  billingUrl: string
}): string {
  const canUpgrade = params.tier === 'FREE' || params.tier === 'PRO'

  return createEmailShell({
    preview: "You've used 80% of your monthly DocForge documents.",
    title: "You've used 80% of your monthly documents",
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 12px;">${params.used} of ${params.limit} documents used this month on the ${params.tier} plan.</p>
      <p style="margin: 0;">${canUpgrade ? 'Consider upgrading to avoid hitting your limit.' : 'Review your current usage to stay ahead of your monthly limit.'}</p>
    `,
    primaryCta: {
      label: canUpgrade ? 'Upgrade Plan' : 'View Usage',
      href: params.billingUrl
    }
  })
}

export function usageLimitEmail(params: {
  name: string
  limit: number
  tier: string
  billingUrl: string
}): string {
  const canUpgrade = params.tier === 'FREE' || params.tier === 'PRO'

  return createEmailShell({
    preview: "You've reached your monthly DocForge document limit.",
    title: "You've reached your monthly document limit",
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 12px;">You've used all ${params.limit} documents on the ${params.tier} plan this month.</p>
      <p style="margin: 0 0 12px;">${canUpgrade ? 'Upgrade your plan to continue generating documents.' : 'Your team is already on our highest plan. Contact support if you need a higher document volume.'}</p>
      <p style="margin: 0;">Your limit resets on the 1st of next month.</p>
    `,
    primaryCta: canUpgrade
      ? {
          label: 'Upgrade Now',
          href: params.billingUrl
        }
      : undefined
  })
}

export function paymentConfirmationEmail(params: {
  name: string
  planName: string
  amount: string
  dashboardUrl: string
}): string {
  return createEmailShell({
    preview: 'Your DocForge subscription is active.',
    title: 'Your DocForge subscription is active!',
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 12px;">You're now on the ${params.planName} plan.</p>
      <p style="margin: 0 0 12px;">Amount: ${params.amount}/month</p>
      <p style="margin: 0;">Your account is ready to generate more documents right away.</p>
    `,
    primaryCta: {
      label: 'Go to Dashboard',
      href: params.dashboardUrl
    }
  })
}

export function teamInviteEmail(params: {
  inviterName: string;
  teamName: string;
  role: string;
  acceptUrl: string;
}): string {
  return createEmailShell({
    preview: `You've been invited to join ${params.teamName} on DocForge.`,
    title: `Join ${params.teamName}`,
    body: `
      <p style="margin: 0 0 12px;">Hi there,</p>
      <p style="margin: 0 0 12px;">${params.inviterName} invited you to join <strong>${params.teamName}</strong> as a ${params.role.toLowerCase()} on DocForge.</p>
      <p style="margin: 0;">Click below to accept the invitation.</p>
    `,
    primaryCta: {
      label: 'Accept Invitation',
      href: params.acceptUrl
    },
    footerNote: 'This invitation expires in 7 days. If you don\'t have a DocForge account yet, you\'ll need to sign up first.'
  })
}

type DunningEmailParams = {
  name: string;
  planName: string;
  amount: string;
  updatePaymentUrl: string;
};

export function paymentFailedEmail(params: {
  name: string;
  planName: string;
  amount: string;
  updatePaymentUrl: string;
}): string {
  return createEmailShell({
    preview: 'Your DocForge payment failed — update your payment method to keep your plan active.',
    title: 'Payment failed',
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 12px;">We couldn't process your payment of <strong>${params.amount}/month</strong> for the ${params.planName} plan.</p>
      <p style="margin: 0 0 12px;">Please update your payment method to avoid losing access to your plan. Stripe will automatically retry the charge after you update.</p>
      <p style="margin: 0;">If you have any questions, reply to this email.</p>
    `,
    primaryCta: {
      label: 'Update Payment Method',
      href: params.updatePaymentUrl,
    },
    footerNote: "If you believe this is an error, contact your bank or reply to this email.",
  });
}

export function dunningFirstAttemptEmail(params: DunningEmailParams): string {
  return createEmailShell({
    preview: 'We had trouble processing your DocForge payment. Update your payment method and Stripe will retry automatically.',
    title: 'Payment failed',
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 12px;">We couldn't process your payment of <strong>${params.amount}/month</strong> for the ${params.planName} plan.</p>
      <p style="margin: 0 0 12px;">Cards expire, banks flag things, and billing details change — it happens. Please update your payment method and Stripe will retry the charge automatically.</p>
      <p style="margin: 0;">If you have any questions, reply to this email.</p>
    `,
    primaryCta: {
      label: 'Update Payment Method',
      href: params.updatePaymentUrl,
    },
    footerNote: "If you believe this is an error, contact your bank or reply to this email.",
  });
}

export function dunningSecondAttemptEmail(params: DunningEmailParams): string {
  return createEmailShell({
    preview: 'Second notice: your DocForge payment is still failing. Update your payment method to keep your plan active.',
    title: 'Your payment is still failing',
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 12px;">Our second attempt to process your payment for the <strong>${params.planName}</strong> plan also failed.</p>
      <p style="margin: 0 0 12px;">Your ${params.planName} plan (${params.amount}/month) is at risk, and your plan features may be affected soon if payment isn't resolved.</p>
      <p style="margin: 0;">Please update your payment method now to keep your features active.</p>
    `,
    primaryCta: {
      label: 'Update Payment Method Now',
      href: params.updatePaymentUrl,
    },
    footerNote: "If you've already updated your payment info, Stripe will retry automatically.",
  });
}

export function dunningFinalAttemptEmail(params: DunningEmailParams): string {
  return createEmailShell({
    preview: 'Final notice: your DocForge subscription is at risk. Update your payment method immediately to avoid cancellation.',
    title: 'Final notice — subscription at risk',
    body: `
      <p style="margin: 0 0 12px;">Hi ${params.name || 'there'},</p>
      <p style="margin: 0 0 12px;">Multiple payment attempts for your <strong>${params.planName}</strong> plan have failed.</p>
      <p style="margin: 0 0 12px;">If this isn't resolved, your subscription will be canceled and you'll lose access to ${params.planName} features like higher document limits, priority rendering, and other paid plan benefits.</p>
      <p style="margin: 0;">Please update your payment method immediately to avoid interruption.</p>
    `,
    primaryCta: {
      label: 'Update Payment Method',
      href: params.updatePaymentUrl,
    },
    secondaryCta: {
      label: 'Contact Support',
      href: 'mailto:support@docforge.dev',
    },
    footerNote: "After cancellation, you'll be moved to the Free plan (50 docs/month).",
  });
}
