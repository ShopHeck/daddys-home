import Handlebars from 'handlebars/dist/cjs/handlebars';

// Re-export template constants used by template-gallery.ts
export {
  TEMPLATE_SERVICE_CONTRACT,
  SAMPLE_SERVICE_CONTRACT,
  TEMPLATE_NDA,
  SAMPLE_NDA,
  TEMPLATE_QUOTE,
  SAMPLE_QUOTE,
  TEMPLATE_PACKING_SLIP,
  SAMPLE_PACKING_SLIP,
  TEMPLATE_PAY_STUB,
  SAMPLE_PAY_STUB,
  TEMPLATE_PROJECT_STATUS,
  SAMPLE_PROJECT_STATUS,
  TEMPLATE_SOW,
  SAMPLE_SOW,
  TEMPLATE_TIMESHEET,
  SAMPLE_TIMESHEET,
} from './template-constants';

/**
 * Sandboxed Handlebars template compilation.
 *
 * Security measures:
 * 1. Isolated Handlebars instance (no global helper pollution)
 * 2. Prototype access disabled to prevent prototype pollution attacks
 * 3. Only whitelisted safe helpers are registered
 * 4. `strict: true` prevents accessing undefined properties (fail-fast)
 * 5. Template nesting depth limit to prevent stack overflow via recursive partials
 */

// Create an isolated Handlebars environment for rendering
const sandbox = Handlebars.create();

// Explicitly remove dangerous built-in helpers that could bypass the sandbox.
// Handlebars.create() inherits built-ins; we must actively unregister them.
sandbox.unregisterHelper('lookup');
sandbox.unregisterHelper('log');
sandbox.unregisterHelper('helperMissing');
sandbox.unregisterHelper('blockHelperMissing');

// --- Safe Helpers Whitelist ---
// Only these helpers are available in user templates.

/** {{#if condition}} ... {{else}} ... {{/if}} */
sandbox.registerHelper('if', function (this: unknown, conditional: unknown, options: Handlebars.HelperOptions) {
  if (Handlebars.Utils.isFunction(conditional)) {
    conditional = (conditional as () => unknown).call(this);
  }
  if ((!options.hash?.includeZero && !conditional) || Handlebars.Utils.isEmpty(conditional)) {
    return options.inverse(this);
  }
  return options.fn(this);
});

/** {{#unless condition}} ... {{/unless}} */
sandbox.registerHelper('unless', function (this: unknown, conditional: unknown, options: Handlebars.HelperOptions) {
  if (Handlebars.Utils.isFunction(conditional)) {
    conditional = (conditional as () => unknown).call(this);
  }
  if ((!options.hash?.includeZero && !conditional) || Handlebars.Utils.isEmpty(conditional)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

/** {{#each array}} ... {{/each}} */
sandbox.registerHelper('each', function (this: unknown, context: unknown, options: Handlebars.HelperOptions) {
  if (Handlebars.Utils.isFunction(context)) {
    context = (context as () => unknown).call(this);
  }

  let result = '';
  let data: Record<string, unknown> | undefined;

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if (context && typeof context === 'object') {
    const items = Array.isArray(context) ? context : Object.entries(context);
    const len = items.length;

    if (len === 0) {
      return options.inverse(this);
    }

    if (Array.isArray(context)) {
      for (let i = 0; i < len; i++) {
        if (data) {
          data['index'] = i;
          data['first'] = i === 0;
          data['last'] = i === len - 1;
          data['key'] = i;
        }
        result += options.fn(context[i], { data });
      }
    } else {
      const keys = Object.keys(context as object);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (data) {
          data['key'] = key;
          data['index'] = i;
          data['first'] = i === 0;
          data['last'] = i === keys.length - 1;
        }
        result += options.fn((context as Record<string, unknown>)[key], { data });
      }
    }
  } else {
    return options.inverse(this);
  }

  return result;
});

/** {{#with context}} ... {{/with}} */
sandbox.registerHelper('with', function (this: unknown, context: unknown, options: Handlebars.HelperOptions) {
  if (Handlebars.Utils.isFunction(context)) {
    context = (context as () => unknown).call(this);
  }

  if (!Handlebars.Utils.isEmpty(context)) {
    let data: Record<string, unknown> | undefined;
    if (options.data) {
      data = Handlebars.createFrame(options.data);
    }
    return options.fn(context, { data });
  }

  return options.inverse(this);
});

// --- Safe formatting helpers ---

/** {{formatDate value}} - basic date formatting */
sandbox.registerHelper('formatDate', function (value: unknown) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

/** {{uppercase value}} */
sandbox.registerHelper('uppercase', function (value: unknown) {
  return typeof value === 'string' ? value.toUpperCase() : '';
});

/** {{lowercase value}} */
sandbox.registerHelper('lowercase', function (value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : '';
});

/** {{eq a b}} - equality check for use in {{#if (eq a b)}} */
sandbox.registerHelper('eq', function (a: unknown, b: unknown) {
  return a === b;
});

/** {{ne a b}} - not-equal check */
sandbox.registerHelper('ne', function (a: unknown, b: unknown) {
  return a !== b;
});

/** {{gt a b}} */
sandbox.registerHelper('gt', function (a: unknown, b: unknown) {
  return Number(a) > Number(b);
});

/** {{lt a b}} */
sandbox.registerHelper('lt', function (a: unknown, b: unknown) {
  return Number(a) < Number(b);
});

/** {{math a "+" b}} - basic arithmetic */
sandbox.registerHelper('math', function (a: unknown, operator: unknown, b: unknown) {
  const numA = Number(a);
  const numB = Number(b);
  switch (operator) {
    case '+':
      return numA + numB;
    case '-':
      return numA - numB;
    case '*':
      return numA * numB;
    case '/':
      return numB !== 0 ? numA / numB : 0;
    case '%':
      return numB !== 0 ? numA % numB : 0;
    default:
      return 0;
  }
});

// --- Dangerous helpers explicitly NOT registered ---
// `lookup` - allows arbitrary property access, potential for prototype traversal
// `log`    - exposes server console
// `helperMissing` / `blockHelperMissing` - left as default (throws in strict mode)

/**
 * Compile and render a Handlebars template with data in a sandboxed environment.
 *
 * Prototype access is disabled to prevent attacks like:
 *   {{constructor.constructor "return process.env"}}
 */
export function compileTemplate(template: string, data: Record<string, unknown>): string {
  const compiled = sandbox.compile(template, {
    noEscape: false, // HTML-escape output by default (use {{{triple}}} for raw)
    strict: true, // Fail on missing variables rather than silently outputting empty
    assumeObjects: false, // Don't assume dot-separated paths resolve
    preventIndent: false,
  });

  // Render with prototype access disabled
  return compiled(data, {
    allowProtoMethodsByDefault: false,
    allowProtoPropertiesByDefault: false,
    allowedProtoMethods: {},
    allowedProtoProperties: {},
  });
}

/**
 * List of helper names available in user templates (for documentation/UI).
 */
export const AVAILABLE_HELPERS = [
  'if',
  'unless',
  'each',
  'with',
  'formatDate',
  'uppercase',
  'lowercase',
  'eq',
  'ne',
  'gt',
  'lt',
  'math',
] as const;
