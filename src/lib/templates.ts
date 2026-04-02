import Handlebars from 'handlebars/dist/cjs/handlebars';

export function compileTemplate(template: string, data: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template, {
    noEscape: false,
    strict: false
  });

  return compiled(data);
}
