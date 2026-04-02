export type VariableType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';

export type TemplateVariable = {
  name: string;
  path: string[];
  type: VariableType;
  required: boolean;
  description: string;
  children?: TemplateVariable[];
};

export type VariableSchema = {
  variables: TemplateVariable[];
  extractedAt: string;
};

type AstNode = {
  type?: string;
  [key: string]: unknown;
};

type AstProgram = AstNode & {
  body?: AstStatement[];
};

type AstStatement = AstNode;
type AstExpression = AstNode;

type AstPathExpression = AstNode & {
  original?: string;
  parts?: string[];
  data?: boolean;
  depth?: number;
};

type AstBlockStatement = AstNode & {
  path?: AstNode;
  params?: AstExpression[];
  program?: AstProgram | null;
  inverse?: AstProgram | null;
};

type AstMustacheStatement = AstNode & {
  path?: AstNode;
  params?: AstExpression[];
};

function isPathExpression(node: unknown): node is AstPathExpression {
  return typeof node === 'object' && node !== null && (node as AstNode).type === 'PathExpression';
}

function combineTypes(existing: VariableType, next: VariableType): VariableType {
  if (existing === next) {
    return existing;
  }

  if (existing === 'array' || next === 'array') {
    return 'array';
  }

  if (existing === 'object' || next === 'object') {
    return 'object';
  }

  if (existing === 'any' || next === 'any') {
    return 'any';
  }

  return existing;
}

export function extractVariablesFromAst(ast: unknown): VariableSchema {
  const program = ast as AstProgram;
  const variableMap = new Map<string, TemplateVariable>();

  function registerTopLevelVariable(fullPath: string[], inferredType: VariableType) {
    const key = fullPath.join('.');

    if (!key) {
      return;
    }

    if (fullPath.length > 1) {
      const parentKey = fullPath[0];
      const existingParent = variableMap.get(parentKey);

      if (existingParent) {
        existingParent.type = combineTypes(existingParent.type, 'object');
      } else {
        variableMap.set(parentKey, {
          name: parentKey,
          path: [parentKey],
          type: 'object',
          required: true,
          description: ''
        });
      }
    }

    const existing = variableMap.get(key);

    if (existing) {
      existing.type = combineTypes(existing.type, inferredType);
      return;
    }

    variableMap.set(key, {
      name: key,
      path: fullPath,
      type: inferredType,
      required: true,
      description: ''
    });
  }

  function registerArrayChild(parentKey: string, childPath: string[], inferredType: VariableType) {
    if (childPath.length === 0) {
      return;
    }

    const parent = variableMap.get(parentKey);

    if (!parent || parent.type !== 'array') {
      return;
    }

    const childName = childPath.join('.');
    const existingChild = parent.children?.find((child) => child.name === childName);

    if (existingChild) {
      existingChild.type = combineTypes(existingChild.type, inferredType);
      return;
    }

    parent.children = parent.children ?? [];
    parent.children.push({
      name: childName,
      path: childPath,
      type: inferredType,
      required: true,
      description: ''
    });
  }

  function registerVariable(pathExpr: AstPathExpression, context: string[], inferredType: VariableType) {
    if (pathExpr.data) {
      return;
    }

    const parts = [...(pathExpr.parts ?? [])];

    if (parts.length === 0) {
      return;
    }

    if (parts.length === 1 && parts[0] === 'this') {
      return;
    }

    const effectiveParts = parts[0] === 'this' ? parts.slice(1) : parts;

    if (effectiveParts.length === 0) {
      return;
    }

    if (context.length > 0) {
      const looksRelative = parts[0] === 'this' || (pathExpr.depth ?? 0) === 0;
      const couldBeKnownRoot = variableMap.has(effectiveParts[0]);

      if (looksRelative && !couldBeKnownRoot) {
        registerArrayChild(context.join('.'), effectiveParts, inferredType);
        return;
      }
    }

    registerTopLevelVariable(effectiveParts, inferredType);
  }

  function walkExpression(expression: AstExpression, context: string[], inferredType: VariableType) {
    if (isPathExpression(expression)) {
      registerVariable(expression, context, inferredType);
    }
  }

  function walkProgramNode(nextProgram: AstProgram | null | undefined, context: string[]) {
    if (!nextProgram?.body) {
      return;
    }

    for (const statement of nextProgram.body) {
      walkStatement(statement, context);
    }
  }

  function walkStatement(statement: AstStatement, context: string[]) {
    switch (statement.type) {
      case 'MustacheStatement': {
        const node = statement as AstMustacheStatement;
        const params = node.params ?? [];

        if (isPathExpression(node.path) && params.length === 0) {
          registerVariable(node.path, context, 'string');
        }

        for (const param of params) {
          walkExpression(param, context, 'any');
        }
        break;
      }
      case 'BlockStatement': {
        const node = statement as AstBlockStatement;
        const params = node.params ?? [];

        if (!isPathExpression(node.path)) {
          walkProgramNode(node.program, context);
          walkProgramNode(node.inverse, context);
          break;
        }

        const helperName = node.path.original ?? '';

        if (helperName === 'each' && params.length > 0 && isPathExpression(params[0])) {
          const param = params[0];

          if (!param.data) {
            const parts = [...(param.parts ?? [])];
            const effectiveParts = parts[0] === 'this' ? parts.slice(1) : parts;
            const fullPath = context.length > 0 && parts[0] !== 'this' && !variableMap.has(effectiveParts[0])
              ? context
              : effectiveParts;

            if (fullPath.length > 0) {
              registerTopLevelVariable(fullPath, 'array');
              walkProgramNode(node.program, fullPath);
            } else {
              walkProgramNode(node.program, context);
            }
          } else {
            walkProgramNode(node.program, context);
          }
        } else if ((helperName === 'if' || helperName === 'unless') && params.length > 0 && isPathExpression(params[0])) {
          registerVariable(params[0], context, 'any');
          walkProgramNode(node.program, context);
          walkProgramNode(node.inverse, context);
        } else {
          for (const param of params) {
            walkExpression(param, context, 'any');
          }
          walkProgramNode(node.program, context);
          walkProgramNode(node.inverse, context);
        }
        break;
      }
      default:
        break;
    }
  }

  walkProgramNode(program, []);

  return {
    variables: Array.from(variableMap.values()),
    extractedAt: new Date().toISOString()
  };
}

export function mergeSchemas(extracted: VariableSchema, existing: VariableSchema | null): VariableSchema {
  if (!existing) {
    return extracted;
  }

  const existingMap = new Map(existing.variables.map((variable) => [variable.name, variable]));

  return {
    variables: extracted.variables.map((variable) => {
      const previous = existingMap.get(variable.name);

      if (!previous) {
        return variable;
      }

      return {
        ...variable,
        required: previous.required,
        description: previous.description,
        children: variable.children?.map((child) => {
          const previousChild = previous.children?.find((item) => item.name === child.name);

          if (!previousChild) {
            return child;
          }

          return {
            ...child,
            required: previousChild.required,
            description: previousChild.description
          };
        })
      };
    }),
    extractedAt: extracted.extractedAt
  };
}
