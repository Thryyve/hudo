import { z } from "zod"

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
