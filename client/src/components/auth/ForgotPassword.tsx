import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useFormValidation } from '../../hooks/useFormValidation';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../../utils/validators';
import { authApi, extractErrorMessage } from '../../services/api';

const MailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
);

export function ForgotPassword() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormValidation<ForgotPasswordFormValues>({
    schema: forgotPasswordSchema,
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(values.email);
      setSent(true);
      toast.success(res.message || 'Если аккаунт существует, письмо отправлено.');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  const busy = submitting || isSubmitting;

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-2 text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
        </span>
        <h2 className="text-xl font-semibold text-slate-900">Проверьте почту</h2>
        <p className="text-slate-600">
          Если такой аккаунт существует, мы отправили ссылку для сброса пароля.
        </p>
        <Link
          to="/login"
          className="font-semibold text-brand-start hover:text-brand-end cursor-pointer"
        >
          Вернуться ко входу
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        leftIcon={MailIcon}
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" fullWidth loading={busy} disabled={busy}>
        {busy ? 'Отправляем…' : 'Отправить ссылку'}
      </Button>
      <p className="text-center text-sm text-slate-600">
        Вспомнили пароль?{' '}
        <Link
          to="/login"
          className="font-semibold text-brand-start hover:text-brand-end cursor-pointer"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}

export default ForgotPassword;
