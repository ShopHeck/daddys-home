import Handlebars from 'handlebars/dist/cjs/handlebars';

import {
  extractVariablesFromAst,
  mergeSchemas,
  type TemplateVariable,
  type VariableSchema,
  type VariableType
} from '@/lib/template-variables-core';

export type { TemplateVariable, VariableSchema, VariableType };

export type ValidationWarning = {
  path: string;
  message: string;
  severity: 'warning';
};

function getValueAtPath(data: Record<string, unknown>, path: string[]) {
  let current: unknown = data;

  for (const segment of path) {
    if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
      return { exists: false, value: undefined as unknown };
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return { exists: true, value: current };
}

export function extractVariables(templateContent: string): VariableSchema {
  return extractVariablesFromAst(Handlebars.parse(templateContent));
}

export { mergeSchemas };

export function validateDataAgainstSchema(data: Record<string, unknown>, schema: VariableSchema): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const variable of schema.variables) {
    if (!variable.required) {
      continue;
    }

    const result = getValueAtPath(data, variable.path);

    if (!result.exists || result.value === undefined || result.value === null) {
      warnings.push({
        path: variable.name,
        message: `Missing required variable "${variable.name}"`,
        severity: 'warning'
      });
      continue;
    }

    if (variable.type === 'array') {
      if (!Array.isArray(result.value)) {
        warnings.push({
          path: variable.name,
          message: `"${variable.name}" should be an array`,
          severity: 'warning'
        });
        continue;
      }

      if (!variable.children?.length) {
        continue;
      }

      const items = result.value as unknown[];

      variable.children.forEach((child) => {
        if (!child.required) {
          return;
        }

        items.forEach((item, index) => {
          if (!item || typeof item !== 'object' || Array.isArray(item)) {
            warnings.push({
              path: `${variable.name}[${index}]`,
              message: `${variable.name}[${index}] should be an object`,
              severity: 'warning'
            });
            return;
          }

          const childResult = getValueAtPath(item as Record<string, unknown>, child.path);

          if (!childResult.exists || childResult.value === undefined || childResult.value === null) {
            warnings.push({
              path: `${variable.name}[${index}].${child.name}`,
              message: `Missing "${child.name}" in ${variable.name}[${index}]`,
              severity: 'warning'
            });
          }
        });
      });
    }
  }

  return warnings;
}
