import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation } from '../../hooks/useFormValidation';
import { loginSchema, type LoginFormValues } from '../../utils/validators';
import { extractErrorMessage } from '../../services/api';

const fieldMotion = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const MailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
);

const LockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormValidation<LoginFormValues>({
    schema: loginSchema,
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // remember определяет, куда сохранить сессию: localStorage или sessionStorage
      await login(
        { email: values.email, password: values.password },
        Boolean(values.remember),
      );
      toast.success('С возвращением!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  const busy = submitting || isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.07 }}
        className="space-y-4"
      >
        <motion.div variants={fieldMotion}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={MailIcon}
            error={errors.email?.message}
            {...register('email')}
          />
        </motion.div>

        <motion.div variants={fieldMotion}>
          <Input
            label="Пароль"
            passwordToggle
            placeholder="Ваш пароль"
            autoComplete="current-password"
            leftIcon={LockIcon}
            error={errors.password?.message}
            {...register('password')}
          />
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-start focus-visible:ring-brand-end"
            {...register('remember')}
          />
          Запомнить меня
        </label>
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-brand-start hover:text-brand-end cursor-pointer"
        >
          Забыли пароль?
        </Link>
      </div>

      <Button type="submit" fullWidth loading={busy} disabled={busy}>
        {busy ? 'Входим…' : 'Войти'}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Нет аккаунта?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand-start hover:text-brand-end cursor-pointer"
        >
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
