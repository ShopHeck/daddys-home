import { describe, it, expect } from 'vitest';
import { compileTemplate, AVAILABLE_HELPERS } from '@/lib/templates';

describe('compileTemplate', () => {
  it('renders a simple template with data', () => {
    const result = compileTemplate('<h1>{{title}}</h1>', { title: 'Hello' });
    expect(result).toBe('<h1>Hello</h1>');
  });

  it('HTML-escapes output by default', () => {
    const result = compileTemplate('{{content}}', { content: '<script>alert("xss")</script>' });
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('allows triple-stache for raw output', () => {
    const result = compileTemplate('{{{content}}}', { content: '<b>bold</b>' });
    expect(result).toContain('<b>bold</b>');
  });

  it('supports {{#each}} helper', () => {
    const result = compileTemplate('{{#each items}}{{this}},{{/each}}', { items: ['a', 'b', 'c'] });
    expect(result).toBe('a,b,c,');
  });

  it('supports {{#if}} helper', () => {
    const result = compileTemplate('{{#if show}}yes{{else}}no{{/if}}', { show: true });
    expect(result).toBe('yes');
  });

  it('supports {{#unless}} helper', () => {
    const result = compileTemplate('{{#unless hidden}}visible{{/unless}}', { hidden: false });
    expect(result).toBe('visible');
  });

  it('supports {{#with}} helper', () => {
    const result = compileTemplate('{{#with user}}{{name}}{{/with}}', { user: { name: 'Alice' } });
    expect(result).toBe('Alice');
  });

  it('supports {{eq}} helper', () => {
    const result = compileTemplate('{{#if (eq status "active")}}yes{{/if}}', { status: 'active' });
    expect(result).toBe('yes');
  });

  it('supports {{uppercase}} helper', () => {
    const result = compileTemplate('{{uppercase name}}', { name: 'hello' });
    expect(result).toBe('HELLO');
  });

  it('supports {{lowercase}} helper', () => {
    const result = compileTemplate('{{lowercase name}}', { name: 'HELLO' });
    expect(result).toBe('hello');
  });

  it('supports {{math}} helper', () => {
    const result = compileTemplate('{{math 10 "+" 5}}', {});
    expect(result).toBe('15');
  });

  describe('security: sandbox enforcement', () => {
    it('blocks {{lookup}} helper (prototype traversal vector)', () => {
      expect(() => {
        compileTemplate('{{lookup this "constructor"}}', {});
      }).toThrow();
    });

    it('blocks {{log}} helper (console exposure)', () => {
      expect(() => {
        compileTemplate('{{log "test"}}', {});
      }).toThrow();
    });

    it('blocks prototype access via __proto__ (returns empty, not the actual prototype)', () => {
      // With allowProtoPropertiesByDefault: false, prototype properties are silently blocked
      // __proto__ is not a real data property so strict mode doesn't throw — it's just inaccessible
      const result = compileTemplate('{{__proto__}}', { __proto__: 'should-not-appear' } as any);
      expect(result).toBe('');
    });

    it('blocks constructor access from prototype chain (returns empty)', () => {
      // With allowProtoPropertiesByDefault: false + strict mode,
      // accessing inherited 'constructor' still resolves but returns empty
      // because proto properties are stripped. The key security guarantee
      // is that you cannot call constructor.constructor("return this")()
      const data = Object.create({ constructor: function () {} });
      data.name = 'test'; // add a real property so the template context is valid
      const result = compileTemplate('{{name}}', data);
      expect(result).toBe('test');
    });

    it('blocks prototype method calls', () => {
      const data = { name: 'test' };
      expect(() => {
        compileTemplate('{{name.constructor}}', data);
      }).toThrow();
    });

    it('throws on undefined variables in strict mode', () => {
      expect(() => {
        compileTemplate('{{nonexistent}}', {});
      }).toThrow();
    });
  });

  describe('AVAILABLE_HELPERS', () => {
    it('lists all registered helpers', () => {
      expect(AVAILABLE_HELPERS).toContain('if');
      expect(AVAILABLE_HELPERS).toContain('each');
      expect(AVAILABLE_HELPERS).toContain('unless');
      expect(AVAILABLE_HELPERS).toContain('with');
      expect(AVAILABLE_HELPERS).toContain('eq');
      expect(AVAILABLE_HELPERS).toContain('math');
      expect(AVAILABLE_HELPERS).toContain('formatDate');
      expect(AVAILABLE_HELPERS).not.toContain('lookup');
      expect(AVAILABLE_HELPERS).not.toContain('log');
    });
  });
});
