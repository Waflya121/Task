import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation } from '../../hooks/useFormValidation';
import { registerSchema, type RegisterFormValues } from '../../utils/validators';
import { extractErrorMessage } from '../../services/api';

const fieldMotion = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const UserIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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

export function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useFormValidation<RegisterFormValues>({
    schema: registerSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    // Защита от двойной отправки: блокируем сразу при клике
    if (submitting) return;
    setSubmitting(true);
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName ? values.lastName : undefined,
        email: values.email,
        password: values.password,
      });
      toast.success('Аккаунт создан! Проверьте почту для подтверждения.');
      navigate('/confirm');
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
        transition={{ staggerChildren: 0.06 }}
        className="space-y-4"
      >
        <motion.div variants={fieldMotion}>
          <Input
            label="Имя"
            placeholder="Иван"
            autoComplete="given-name"
            leftIcon={UserIcon}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
        </motion.div>

        <motion.div variants={fieldMotion}>
          <Input
            label="Фамилия (необязательно)"
            placeholder="Иванов"
            autoComplete="family-name"
            leftIcon={UserIcon}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </motion.div>

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
            placeholder="Минимум 8 символов"
            autoComplete="new-password"
            leftIcon={LockIcon}
            error={errors.password?.message}
            {...register('password')}
          />
        </motion.div>

        <motion.div variants={fieldMotion}>
          <Input
            label="Подтверждение пароля"
            passwordToggle
            placeholder="Повторите пароль"
            autoComplete="new-password"
            leftIcon={LockIcon}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </motion.div>
      </motion.div>

      <Button type="submit" fullWidth loading={busy} disabled={busy}>
        {busy ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Уже есть аккаунт?{' '}
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

export default RegisterForm;
