import { z } from 'zod';

// Пароль: минимум 8 символов, хотя бы 1 заглавная, 1 цифра и 1 спецсимвол
const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .regex(/[A-Z]/, 'Добавьте хотя бы одну заглавную букву')
  .regex(/[0-9]/, 'Добавьте хотя бы одну цифру')
  .regex(/[^A-Za-z0-9]/, 'Добавьте хотя бы один спецсимвол');

const emailSchema = z
  .string()
  .min(1, 'Введите email')
  .email('Некорректный формат email');

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    lastName: z
      .string()
      .max(50, 'Слишком длинная фамилия')
      .optional()
      .or(z.literal('')),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().max(50, 'Слишком длинная фамилия').optional().or(z.literal('')),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
