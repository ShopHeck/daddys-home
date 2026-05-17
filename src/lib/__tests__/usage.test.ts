import { describe, it, expect } from 'vitest';
import { getCurrentUsagePeriod, TIER_LIMITS, TIER_BATCH_LIMITS } from '@/lib/usage';

describe('TIER_LIMITS', () => {
  it('defines correct limits per tier', () => {
    expect(TIER_LIMITS.FREE).toBe(50);
    expect(TIER_LIMITS.PRO).toBe(5000);
    expect(TIER_LIMITS.BUSINESS).toBe(50000);
  });
});

describe('TIER_BATCH_LIMITS', () => {
  it('defines correct batch limits per tier', () => {
    expect(TIER_BATCH_LIMITS.FREE).toBe(5);
    expect(TIER_BATCH_LIMITS.PRO).toBe(50);
    expect(TIER_BATCH_LIMITS.BUSINESS).toBe(200);
  });
});

describe('getCurrentUsagePeriod', () => {
  it('returns period start at first day of current month UTC', () => {
    const date = new Date('2026-03-15T12:00:00Z');
    const { periodStart } = getCurrentUsagePeriod(date);
    expect(periodStart.toISOString()).toBe('2026-03-01T00:00:00.000Z');
  });

  it('returns period end at last day of current month UTC', () => {
    const date = new Date('2026-03-15T12:00:00Z');
    const { periodEnd } = getCurrentUsagePeriod(date);
    // March has 31 days
    expect(periodEnd.toISOString()).toBe('2026-03-31T23:59:59.999Z');
  });

  it('handles February correctly', () => {
    const date = new Date('2026-02-10T12:00:00Z');
    const { periodStart, periodEnd } = getCurrentUsagePeriod(date);
    expect(periodStart.toISOString()).toBe('2026-02-01T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-02-28T23:59:59.999Z');
  });

  it('handles leap year February', () => {
    const date = new Date('2028-02-10T12:00:00Z');
    const { periodEnd } = getCurrentUsagePeriod(date);
    expect(periodEnd.toISOString()).toBe('2028-02-29T23:59:59.999Z');
  });

  it('handles year boundary (December → January)', () => {
    const date = new Date('2026-12-25T12:00:00Z');
    const { periodStart, periodEnd } = getCurrentUsagePeriod(date);
    expect(periodStart.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(periodEnd.toISOString()).toBe('2026-12-31T23:59:59.999Z');
  });

  it('uses current date when no argument provided', () => {
    const { periodStart, periodEnd } = getCurrentUsagePeriod();
    const now = new Date();
    expect(periodStart.getUTCMonth()).toBe(now.getUTCMonth());
    expect(periodStart.getUTCFullYear()).toBe(now.getUTCFullYear());
    expect(periodEnd.getUTCMonth()).toBe(now.getUTCMonth());
  });
});
