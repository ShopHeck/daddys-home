import Handlebars from 'handlebars/dist/handlebars';

import {
  extractVariablesFromAst,
  mergeSchemas,
  type TemplateVariable,
  type VariableSchema,
  type VariableType
} from '@/lib/template-variables-core';

export type { TemplateVariable, VariableSchema, VariableType };
export { mergeSchemas };

export function extractVariables(templateContent: string): VariableSchema {
  return extractVariablesFromAst(Handlebars.parse(templateContent));
}
