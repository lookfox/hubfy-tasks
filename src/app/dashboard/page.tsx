"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth-client";

type TaskStatus = "pending" | "in_progress" | "completed";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

type NewTaskForm = {
  title: string;
  description: string;
  status: TaskStatus;
};

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const [form, setForm] = useState<NewTaskForm>({
    title: "",
    description: "",
    status: "pending",
  });

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  async function fetchTasks() {
    setLoading(true);
    setServerError(null);

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        
        if (res.status === 401) {
          clearToken();
          router.push("/login");
          return;
        }

        setServerError(data?.error || "Erro ao carregar tarefas.");
        return;
      }

      setTasks(data.tasks || []);
    } catch {
      setServerError("Erro de rede ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (!form.title.trim()) {
      setServerError("Informe um título para a tarefa.");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() ? form.description.trim() : null,
          status: form.status,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          clearToken();
          router.push("/login");
          return;
        }
        setServerError(data?.error || "Erro ao criar tarefa.");
        return;
      }

      setTasks((prev) => [data.task, ...prev]);

      setForm({ title: "", description: "", status: "pending" });
    } catch {
      setServerError("Erro de rede ao criar tarefa.");
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTasks();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-zinc-600">
              Suas tarefas (protegido por token).
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
          >
            Sair
          </button>
        </header>

        {serverError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold">Nova tarefa</h2>

          <form className="space-y-3" onSubmit={createTask}>
            <div>
              <label className="block text-sm font-medium" htmlFor="title">
                Título
              </label>
              <input
                id="title"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Ex: Revisar testes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="description">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Detalhes..."
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      status: e.target.value as TaskStatus,
                    }))
                  }
                >
                  <option value="pending">pending</option>
                  <option value="in_progress">in_progress</option>
                  <option value="completed">completed</option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
              >
                Criar
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold">Tarefas</h2>

            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">Filtro:</span>
              <select
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">todas</option>
                <option value="pending">pending</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
              </select>

              <button
                onClick={fetchTasks}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
              >
                Recarregar
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-600">Carregando...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-sm text-zinc-600">Nenhuma tarefa.</p>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-zinc-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      {t.description ? (
                        <p className="mt-1 text-sm text-zinc-600">
                          {t.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-700">
                      {t.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
