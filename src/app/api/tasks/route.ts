import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/lib/middleware";
import { createTaskSchema } from "@/types/task";

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (auth.error) return auth.error;

  const tasks = await prisma.task.findMany({
    where: { userId: auth.user.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ tasks }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, description, status } = parsed.data;

  const task = await prisma.task.create({
    data: {
      userId: auth.user.userId,
      title,
      description,
      status: status ?? "pending",
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
