import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useFormValidation } from '../../hooks/useFormValidation';
import { profileSchema, type ProfileFormValues } from '../../utils/validators';
import { extractErrorMessage, usersApi } from '../../services/api';
import type { User } from '../../types';

// Инициалы из имени и фамилии для аватара
function getInitials(user: User): string {
  const first = user.firstName?.trim()?.[0] ?? '';
  const last = user.lastName?.trim()?.[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || user.email[0]?.toUpperCase() || '?';
}

// Стабильный градиент аватара на основе id пользователя
function gradientFor(seed: string): string {
  const palettes = [
    'from-blue-500 to-violet-600',
    'from-fuchsia-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-teal-600',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return palettes[hash % palettes.length];
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-start shadow-sm">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="truncate font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useFormValidation<ProfileFormValues>({
    schema: profileSchema,
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
  });

  const initials = useMemo(() => (user ? getInitials(user) : '?'), [user]);
  const gradient = useMemo(() => (user ? gradientFor(user.id) : ''), [user]);

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const onSave = handleSubmit(async (values) => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await usersApi.updateMe({
        firstName: values.firstName,
        lastName: values.lastName ? values.lastName : undefined,
      });
      setUser(updated);
      setEditing(false);
      toast.success('Профиль обновлён');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Обязательное приветствие */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Hello world! Добро пожаловать,{' '}
          <span className="bg-brand-gradient bg-clip-text text-transparent">
            {user.firstName}
          </span>
          !
        </h1>
        <p className="mt-2 text-slate-600">
          Рады видеть вас снова. Вот сводка по вашему аккаунту.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Карточка профиля */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="md:col-span-1"
        >
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-xl backdrop-blur-md">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-3xl font-bold text-white shadow-glow`}
            >
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              {fullName}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>

            <span
              className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                user.isEmailConfirmed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {user.isEmailConfirmed ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </>
                )}
              </svg>
              {user.isEmailConfirmed ? 'Email подтверждён' : 'Email не подтверждён'}
            </span>

            <Button
              variant="danger"
              fullWidth
              className="mt-6"
              onClick={handleLogout}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
              Выйти
            </Button>
          </div>
        </motion.section>

        {/* Детали аккаунта */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:col-span-2"
        >
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Данные аккаунта
              </h3>
              {!editing && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    reset({
                      firstName: user.firstName,
                      lastName: user.lastName ?? '',
                    });
                    setEditing(true);
                  }}
                >
                  Редактировать
                </Button>
              )}
            </div>

            {editing ? (
              <form onSubmit={onSave} noValidate className="space-y-4">
                <Input
                  label="Имя"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Фамилия (необязательно)"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
                <div className="flex gap-3">
                  <Button type="submit" loading={saving} disabled={saving}>
                    Сохранить
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow
                  label="Полное имя"
                  value={fullName}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
                />
                <InfoRow
                  label="Email"
                  value={user.email}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 5L2 7" />
                    </svg>
                  }
                />
                <InfoRow
                  label="Дата регистрации"
                  value={formatDate(user.createdAt)}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  }
                />
                <InfoRow
                  label="Статус email"
                  value={user.isEmailConfirmed ? 'Подтверждён' : 'Не подтверждён'}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default Dashboard;
