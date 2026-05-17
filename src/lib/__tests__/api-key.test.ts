import { describe, it, expect } from 'vitest';
import { generateApiKey, hashApiKey } from '@/lib/api-key';

describe('generateApiKey', () => {
  it('generates a key with df_live_ prefix', () => {
    const { key } = generateApiKey();
    expect(key).toMatch(/^df_live_[a-f0-9]{64}$/);
  });

  it('generates a SHA-256 hash', () => {
    const { hash } = generateApiKey();
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('generates a 16-char prefix', () => {
    const { prefix } = generateApiKey();
    expect(prefix).toHaveLength(16);
    expect(prefix).toBe('df_live_' + prefix.slice(8));
  });

  it('hash matches hashApiKey(key)', () => {
    const { key, hash } = generateApiKey();
    expect(hashApiKey(key)).toBe(hash);
  });

  it('generates unique keys', () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateApiKey().key));
    expect(keys.size).toBe(100);
  });
});

describe('hashApiKey', () => {
  it('returns consistent SHA-256 hashes', () => {
    const key = 'df_live_abc123';
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces different hashes for different keys', () => {
    const hash1 = hashApiKey('df_live_key1');
    const hash2 = hashApiKey('df_live_key2');
    expect(hash1).not.toBe(hash2);
  });
});
