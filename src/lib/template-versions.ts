import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import type { VariableSchema } from '@/lib/template-variables';

type DbClient = Prisma.TransactionClient | typeof prisma;

async function createTemplateVersionWithClient(
  db: DbClient,
  params: {
    templateId: string;
    name: string;
    description: string | null;
    content: string;
    css?: string | null;
    variableSchema?: VariableSchema | null;
  }
) {
  const template = await db.template.findUniqueOrThrow({
    where: { id: params.templateId },
    select: { currentVersion: true }
  });

  const nextVersion = template.currentVersion + 1;

  const version = await db.templateVersion.create({
    data: {
      templateId: params.templateId,
      version: nextVersion,
      name: params.name,
      description: params.description,
      content: params.content,
      css: params.css ?? null,
      variableSchema: params.variableSchema as any
    }
  });

  await db.template.update({
    where: { id: params.templateId },
    data: { currentVersion: nextVersion }
  });

  return version;
}

export async function createTemplateVersion(
  params: {
    templateId: string;
    name: string;
    description: string | null;
    content: string;
    css?: string | null;
    variableSchema?: VariableSchema | null;
  },
  tx?: DbClient
) {
  if (tx) {
    return createTemplateVersionWithClient(tx, params);
  }

  return prisma.$transaction(async (innerTx) => createTemplateVersionWithClient(innerTx, params));
}

export async function createInitialVersion(
  params: {
    templateId: string;
    name: string;
    description: string | null;
    content: string;
    css?: string | null;
    variableSchema?: VariableSchema | null;
  },
  tx?: DbClient
) {
  const db = tx ?? prisma;

  return db.templateVersion.create({
    data: {
      templateId: params.templateId,
      version: 1,
      name: params.name,
      description: params.description,
      content: params.content,
      css: params.css ?? null,
      variableSchema: params.variableSchema as any
    }
  });
}
