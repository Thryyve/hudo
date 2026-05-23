import { z } from "zod"

export const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  color: z.string().default("#0ea5e9"),
  workspaceId: z.string().min(1),
})

export type CreateBoardInput = z.infer<typeof createBoardSchema>
