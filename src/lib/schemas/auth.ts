import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Valid email required').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(1, 'Name is required').max(100).trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email required').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email required').max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
