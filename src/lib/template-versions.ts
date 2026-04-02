import { prisma } from '@/lib/prisma';
import type { VariableSchema } from '@/lib/template-variables';

export async function createTemplateVersion(params: {
  templateId: string;
  name: string;
  description: string | null;
  content: string;
  variableSchema?: VariableSchema | null;
}) {
  return prisma.$transaction(async (tx) => {
    const template = await tx.template.findUniqueOrThrow({
      where: { id: params.templateId },
      select: { currentVersion: true }
    });

    const nextVersion = template.currentVersion + 1;

    const version = await tx.templateVersion.create({
      data: {
        templateId: params.templateId,
        version: nextVersion,
        name: params.name,
        description: params.description,
        content: params.content,
        variableSchema: (params.variableSchema as any) ?? undefined
      }
    });

    await tx.template.update({
      where: { id: params.templateId },
      data: { currentVersion: nextVersion }
    });

    return version;
  });
}

export async function createInitialVersion(params: {
  templateId: string;
  name: string;
  description: string | null;
  content: string;
  variableSchema?: VariableSchema | null;
}) {
  return prisma.templateVersion.create({
    data: {
      templateId: params.templateId,
      version: 1,
      name: params.name,
      description: params.description,
      content: params.content,
      variableSchema: (params.variableSchema as any) ?? undefined
    }
  });
}
