"use client";

import { useMemo, useState } from "react";

type LoginForm = {
  email: string;
  password: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<keyof LoginForm, boolean>>({
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof LoginForm, string>> = {};

    if (!form.email.trim()) next.email = "Informe seu email.";
    else if (!isValidEmail(form.email)) next.email = "Email inválido.";

    if (!form.password.trim()) next.password = "Informe sua senha.";
    else if (form.password.length < 8)
      next.password = "A senha deve ter pelo menos 8 caracteres.";

    return next;
  }, [form.email, form.password]);

  const canSubmit = Object.keys(errors).length === 0 && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // marca tudo como "tocado" para mostrar erros se houver
    setTouched({ email: true, password: true });

    if (!canSubmit) return;

    setIsSubmitting(true);

    // Amanhã: aqui entra o fetch POST /api/auth/login
    await new Promise((r) => setTimeout(r, 600));

    setIsSubmitting(false);
    alert("UI OK. Amanhã vamos integrar na API.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="text-sm text-zinc-600">
            Acesse sua conta para gerenciar suas tarefas.
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            />
            {touched.email && errors.email ? (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
              placeholder="********"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
            />
            {touched.password && errors.password ? (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-zinc-600">
            Não tem conta?{" "}
            <a className="font-medium underline" href="/register">
              Criar conta
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
