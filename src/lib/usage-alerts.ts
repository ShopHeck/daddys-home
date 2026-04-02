import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { usageWarningEmail, usageLimitEmail } from '@/lib/email-templates'
import type { Tier } from '@/types'

export async function checkAndSendUsageAlerts(params: {
  userId: string
  used: number
  limit: number
  tier: Tier
  userEmail: string
  userName: string | null
}) {
  const { userId, used, limit, tier, userEmail, userName } = params

  if (limit <= 0) {
    return
  }

  const period = new Date().toISOString().slice(0, 7)
  const percent = (used / limit) * 100
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const billingUrl = `${baseUrl}/dashboard/billing`
  const usageUrl = `${baseUrl}/dashboard/usage`
  const name = userName || 'there'
  const thresholds = [80, 100] as const

  for (const threshold of thresholds) {
    if (percent < threshold) {
      continue
    }

    try {
      await prisma.usageAlert.create({
        data: {
          userId,
          threshold,
          period
        }
      })
    } catch (error) {
      const duplicateError =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code?: unknown }).code === 'string' &&
        (error as { code?: string }).code === 'P2002'

      if (duplicateError) {
        continue
      }

      throw error
    }

    const html =
      threshold === 80
        ? usageWarningEmail({
            name,
            used,
            limit,
            tier,
            billingUrl: tier === 'BUSINESS' ? usageUrl : billingUrl
          })
        : usageLimitEmail({
            name,
            limit,
            tier,
            billingUrl
          })

    sendEmail({
      to: userEmail,
      subject:
        threshold === 80
          ? "You've used 80% of your monthly documents"
          : "You've reached your monthly document limit",
      html
    }).catch((error) => {
      console.error(`Usage alert email (${threshold}%) failed:`, error)
    })
  }
}
