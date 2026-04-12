import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(30),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(30),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});