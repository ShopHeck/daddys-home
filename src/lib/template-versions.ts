import { prisma } from '@/lib/prisma';

export async function createTemplateVersion(params: {
  templateId: string;
  name: string;
  description: string | null;
  content: string;
}) {
  return prisma.$transaction(async (tx) => {
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
  });
}

export async function createInitialVersion(params: {
  templateId: string;
  name: string;
  description: string | null;
  content: string;
}) {
  return prisma.templateVersion.create({
    data: {
      templateId: params.templateId,
      version: 1,
      name: params.name,
      description: params.description,
      content: params.content
    }
  });
}
