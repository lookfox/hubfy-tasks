import { getToken } from "@/lib/auth-client";

export type TaskStatus = "pending" | "in_progress" | "completed";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

function authHeaders() {
  const token = getToken();
  if (!token) return null;

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function listTasks(): Promise<Task[]> {
  const headers = authHeaders();
  if (!headers) throw new Error("Sem token");

  const res = await fetch("/api/tasks", {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Falha ao listar tarefas");
  return data.tasks as Task[];
}

export async function createTask(input: {
  title: string;
  description?: string;
  status?: TaskStatus;
}): Promise<Task> {
  const headers = authHeaders();
  if (!headers) throw new Error("Sem token");

  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "pending",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Falha ao criar tarefa");
  return data.task as Task;
}

export async function updateTask(
  id: number,
  patch: Partial<Pick<Task, "title" | "description" | "status">>
): Promise<Task> {
  const headers = authHeaders();
  if (!headers) throw new Error("Sem token");

  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...patch,

      ...(patch.description === undefined ? {} : { description: patch.description }),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Falha ao atualizar tarefa");
  return data.task as Task;
}

export async function deleteTask(id: number): Promise<void> {
  const headers = authHeaders();
  if (!headers) throw new Error("Sem token");

  const res = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Falha ao deletar tarefa");
}
