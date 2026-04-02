export function passwordResetEmail(params: { name: string; resetUrl: string }): string {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px;">
        <div style="max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px;">Reset your password</h1>
          <p style="margin: 0 0 8px;">Hi ${params.name || 'there'},</p>
          <p style="margin: 0 0 24px;">We received a request to reset your DocForge password. Click the button below to choose a new password.</p>
          <a href="${params.resetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
          <p style="margin: 24px 0 0; font-size: 14px; color: #94a3b8;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;
}
