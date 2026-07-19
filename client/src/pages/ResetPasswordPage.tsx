import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthShell } from '../components/auth/AuthShell';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useFormValidation } from '../hooks/useFormValidation';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../utils/validators';
import { authApi, extractErrorMessage } from '../services/api';

const LockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function ResetForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormValidation<ResetPasswordFormValues>({
    schema: resetPasswordSchema,
    defaultValues: { password: '', confirmPassword: '' },
  });

  // Без токена в URL сброс невозможен
  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-slate-600">
          Ссылка недействительна: отсутствует токен сброса пароля.
        </p>
        <Link
          to="/forgot-password"
          className="inline-block font-semibold text-brand-start hover:text-brand-end cursor-pointer"
        >
          Запросить новую ссылку
        </Link>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await authApi.resetPassword(token, values.password);
      toast.success(res.message || 'Пароль обновлён. Войдите с новым паролем.');
      navigate('/login');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  const busy = submitting || isSubmitting;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Input
        label="Новый пароль"
        passwordToggle
        placeholder="Минимум 8 символов"
        autoComplete="new-password"
        leftIcon={LockIcon}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Подтверждение пароля"
        passwordToggle
        placeholder="Повторите пароль"
        autoComplete="new-password"
        leftIcon={LockIcon}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" fullWidth loading={busy} disabled={busy}>
        {busy ? 'Сохраняем…' : 'Сбросить пароль'}
      </Button>
      <p className="text-center text-sm text-slate-600">
        <Link
          to="/login"
          className="font-semibold text-brand-start hover:text-brand-end cursor-pointer"
        >
          Вернуться ко входу
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordPage() {
  return (
    <AuthShell
      title="Новый пароль"
      subtitle="Придумайте надёжный пароль для вашего аккаунта."
      asideTitle="Почти готово"
      asideText="Задайте новый пароль — и снова получите полный доступ к личному кабинету."
      bullets={[
        'Минимум 8 символов',
        'Заглавные буквы, цифры и спецсимволы',
        'Сразу можно войти с новым паролем',
      ]}
    >
      <ResetForm />
    </AuthShell>
  );
}

export default ResetPasswordPage;
