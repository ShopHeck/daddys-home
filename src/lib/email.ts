import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.EMAIL_FROM || 'DocForge <noreply@docforge.dev>';

  const { error } = await getResend().emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}
