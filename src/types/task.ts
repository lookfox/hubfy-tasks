import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(255, "Título muito longo"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});


export const updateTaskSchema = createTaskSchema.partial();
