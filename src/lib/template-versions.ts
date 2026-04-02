import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

type TemplateVersionsClient = Prisma.TransactionClient | typeof prisma;

export async function createTemplateVersion(params: {
  templateId: string;
  name: string;
  description: string | null;
  content: string;
  tx?: TemplateVersionsClient;
}) {
  const run = async (tx: TemplateVersionsClient) => {
    const template = await tx.template.update({
      where: { id: params.templateId },
      data: {
        currentVersion: {
          increment: 1
        }
      },
      select: { currentVersion: true }
    });

    return tx.templateVersion.create({
      data: {
        templateId: params.templateId,
        version: template.currentVersion,
        name: params.name,
        description: params.description,
        content: params.content
      }
    });
  };

  if (params.tx) {
    return run(params.tx);
  }

  return prisma.$transaction(run);
}

export async function createInitialVersion(params: {
  templateId: string;
  name: string;
  description: string | null;
  content: string;
  tx?: TemplateVersionsClient;
}) {
  const client = params.tx ?? prisma;

  return client.templateVersion.create({
    data: {
      templateId: params.templateId,
      version: 1,
      name: params.name,
      description: params.description,
      content: params.content
    }
  });
}
