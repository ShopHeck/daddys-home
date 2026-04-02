import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractVariables, mergeSchemas, type VariableSchema } from '@/lib/template-variables';
import { createTemplateVersion } from '@/lib/template-versions';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const template = await prisma.template.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
      variableSchema: true,
      currentVersion: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    description?: string;
    content?: string;
    variableSchema?: VariableSchema | null;
  } | null;

  if (!body?.name?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'Name and content are required.' }, { status: 400 });
  }

  const existing = await prisma.template.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: {
      id: true,
      variableSchema: true
    }
  });

  if (!existing) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const name = body.name.trim();
  const description = body.description?.trim() || null;
  const content = body.content;
  const extracted = extractVariables(content);
  const schema = mergeSchemas(extracted, body.variableSchema ?? (existing.variableSchema as VariableSchema | null));

  const payload = await prisma.$transaction(async (tx) => {
    const template = await tx.template.update({
      where: { id: existing.id },
      data: {
        name,
        description,
        content,
        variableSchema: schema as any
      },
      select: {
        id: true,
        name: true,
        description: true,
        content: true,
        variableSchema: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const version = await createTemplateVersion(
      {
        templateId: existing.id,
        name,
        description,
        content,
        variableSchema: schema
      },
      tx
    );

    return {
      ...template,
      currentVersion: version.version
    };
  });

  return NextResponse.json(payload);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    variableSchema?: {
      variables: Array<{
        name: string;
        description?: string;
        required?: boolean;
        children?: Array<{
          name: string;
          description?: string;
          required?: boolean;
        }>;
      }>;
    };
  } | null;

  if (!body?.variableSchema?.variables || !Array.isArray(body.variableSchema.variables)) {
    return NextResponse.json({ error: 'variableSchema.variables is required' }, { status: 400 });
  }

  const existing = await prisma.template.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: {
      id: true,
      variableSchema: true
    }
  });

  if (!existing) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const currentSchema = existing.variableSchema as VariableSchema | null;

  if (!currentSchema) {
    return NextResponse.json({ error: 'No schema to update.' }, { status: 400 });
  }

  const updatedVariables = currentSchema.variables.map((variable) => {
    const update = body.variableSchema?.variables.find((item) => item.name === variable.name);

    if (!update) {
      return variable;
    }

    return {
      ...variable,
      description: update.description ?? variable.description,
      required: update.required ?? variable.required,
      children: variable.children?.map((child) => {
        const childUpdate = update.children?.find((item) => item.name === child.name);

        if (!childUpdate) {
          return child;
        }

        return {
          ...child,
          description: childUpdate.description ?? child.description,
          required: childUpdate.required ?? child.required
        };
      })
    };
  });

  const updatedSchema: VariableSchema = {
    ...currentSchema,
    variables: updatedVariables
  };

  await prisma.template.update({
    where: { id: existing.id },
    data: { variableSchema: updatedSchema as any }
  });

  return NextResponse.json({ variableSchema: updatedSchema });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.template.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: {
      id: true,
      variableSchema: true
    }
  });

  if (!existing) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  await prisma.template.delete({
    where: { id: existing.id }
  });

  return NextResponse.json({ success: true });
}
