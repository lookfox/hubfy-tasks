import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


import { loginSchema } from "@/types/auth";
import { comparePasswords, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    const ok = await comparePasswords(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
