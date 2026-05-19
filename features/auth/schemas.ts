import { z } from "zod";

export const baseAuthSchema = z.object({
  email: z.email("Valid email required."),
  next: z.string().optional(),
});

export const signInSchema = baseAuthSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signUpSchema = baseAuthSchema
  .extend({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Password confirmation required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
