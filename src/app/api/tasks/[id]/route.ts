import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/lib/middleware";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

function parseId(raw: unknown) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = authenticateRequest(request);
  if (auth.error) return auth.error;

 type RouteParams = { id: string };

const paramsResolved = (await Promise.resolve(
  context.params as RouteParams | Promise<RouteParams>
)) as RouteParams;

const id = parseId(paramsResolved.id);



  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const body = await request.json();
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // user's own task
  const existing = await prisma.task.findFirst({
    where: { id, userId: auth.user.userId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
  }

  const task = await prisma.task.update({
    where: { id },
    data: parsed.data,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ task }, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const auth = authenticateRequest(request);
  if (auth.error) return auth.error;

 type RouteParams = { id: string };

const paramsResolved = (await Promise.resolve(
  context.params as RouteParams | Promise<RouteParams>
)) as RouteParams;

const id = parseId(paramsResolved.id);


  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const existing = await prisma.task.findFirst({
    where: { id, userId: auth.user.userId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ message: "Tarefa deletada" }, { status: 200 });
}
