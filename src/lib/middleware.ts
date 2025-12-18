import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Token não fornecido" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = verifyToken(token);
    return { user: payload };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      ),
    };
  }
}
