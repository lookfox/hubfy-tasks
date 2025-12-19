"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth-client";
import {
  Task,
  TaskStatus,
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "@/lib/tasks-client";

type CreateForm = {
  title: string;
  description: string;
  status: TaskStatus;
};

function statusLabel(s: TaskStatus) {
  if (s === "pending") return "Pendente";
  if (s === "in_progress") return "Em andamento";
  return "Concluída";
}

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateForm>({
    title: "",
    description: "",
    status: "pending",
  });

 
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CreateForm>({
    title: "",
    description: "",
    status: "pending",
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listTasks();
        setTasks(data);
      } catch (e: any) {
        setError(e?.message ?? "Falha ao carregar tarefas");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const filtered = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setError(null);

    if (!createForm.title.trim()) {
      setError("Título é obrigatório.");
      return;
    }

    try {
      setBusyId(-1);
      const created = await createTask({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        status: createForm.status,
      });

      setTasks((prev) => [created, ...prev]);
      setCreateForm({ title: "", description: "", status: "pending" });
      setNotice("Tarefa criada com sucesso.");
    } catch (e: any) {
      setError(e?.message ?? "Falha ao criar tarefa");
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(t: Task) {
    setNotice(null);
    setError(null);
    setEditingId(t.id);
    setEditForm({
      title: t.title,
      description: t.description ?? "",
      status: t.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: number) {
    setNotice(null);
    setError(null);

    if (!editForm.title.trim()) {
      setError("Título é obrigatório.");
      return;
    }

    try {
      setBusyId(id);
      const updated = await updateTask(id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() ? editForm.description.trim() : null,
        status: editForm.status,
      });

      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      setNotice("Tarefa atualizada.");
    } catch (e: any) {
      setError(e?.message ?? "Falha ao atualizar tarefa");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    setNotice(null);
    setError(null);

    const ok = confirm("Tem certeza que deseja deletar esta tarefa?");
    if (!ok) return;

    try {
      setBusyId(id);
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setNotice("Tarefa deletada.");
    } catch (e: any) {
      setError(e?.message ?? "Falha ao deletar tarefa");
    } finally {
      setBusyId(null);
    }
  }

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-zinc-600">
              Gerencie suas tarefas (CRUD).
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-100"
          >
            Sair
          </button>
        </header>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Nova tarefa</h2>

          <form onSubmit={handleCreate} className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Título</label>
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Ex: Revisar PR"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                className="min-h-[90px] w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Detalhes (opcional)"
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-400"
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm((p) => ({
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
                disabled={busyId === -1}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyId === -1 ? "Criando..." : "Criar"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Minhas tarefas</h2>

            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">Filtro:</span>
              <select
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as TaskStatus | "all")
                }
              >
                <option value="all">Todas</option>
                <option value="pending">pending</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-600">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-zinc-600">Nenhuma tarefa por aqui.</p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((t) => {
                const isEditing = editingId === t.id;
                const isBusy = busyId === t.id;

                return (
                  <li
                    key={t.id}
                    className="rounded-xl border border-zinc-200 p-4"
                  >
                    {isEditing ? (
                      <div className="grid gap-3">
                        <div className="grid gap-1">
                          <label className="text-sm font-medium">Título</label>
                          <input
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="grid gap-1">
                          <label className="text-sm font-medium">
                            Descrição
                          </label>
                          <textarea
                            className="min-h-[90px] w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-400"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                          <div className="grid gap-1">
                            <label className="text-sm font-medium">
                              Status
                            </label>
                            <select
                              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-zinc-400"
                              value={editForm.status}
                              onChange={(e) =>
                                setEditForm((p) => ({
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
                            onClick={() => saveEdit(t.id)}
                            disabled={isBusy}
                            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy ? "Salvando..." : "Salvar"}
                          </button>

                          <button
                            onClick={cancelEdit}
                            disabled={isBusy}
                            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold">
                              {t.title}
                            </h3>
                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
                              {statusLabel(t.status)} ({t.status})
                            </span>
                          </div>

                          {t.description ? (
                            <p className="mt-1 text-sm text-zinc-600">
                              {t.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => startEdit(t)}
                            disabled={isBusy}
                            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={isBusy}
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy ? "Deletando..." : "Deletar"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
