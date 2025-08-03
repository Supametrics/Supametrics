import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(255),
});
