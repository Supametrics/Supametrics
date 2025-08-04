import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(255),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  teamId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});
