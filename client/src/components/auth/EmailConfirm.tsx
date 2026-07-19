import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { authApi, extractErrorMessage } from '../../services/api';

type Status = 'idle' | 'verifying' | 'success' | 'error';

export function EmailConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState<string>('');
  const [resending, setResending] = useState(false);
  // StrictMode в dev монтирует эффект дважды — защищаемся от повторного POST
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token || verifiedRef.current) return;
    verifiedRef.current = true;

    const verify = async () => {
      try {
        const res = await authApi.confirm(token);
        setStatus('success');
        setMessage(res.message);
        toast.success('Email подтверждён!');
      } catch (error) {
        setStatus('error');
        setMessage(extractErrorMessage(error));
      }
    };
    void verify();
  }, [token]);

  // После успешного подтверждения уводим в кабинет через 3 секунды
  useEffect(() => {
    if (status !== 'success') return;
    const timer = window.setTimeout(() => navigate('/dashboard'), 3000);
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  const handleResend = async () => {
    if (!user?.email) {
      toast.error('Не удалось определить email. Войдите заново.');
      return;
    }
    setResending(true);
    try {
      const res = await authApi.resendConfirmation(user.email);
      toast.success(res.message || 'Письмо отправлено повторно.');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-center"
    >
      {status === 'verifying' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-brand-start">
            <Spinner size={32} />
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            Подтверждаем ваш email…
          </h2>
          <p className="text-slate-600">Это займёт пару секунд.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            Email подтверждён!
          </h2>
          <p className="text-slate-600">
            {message || 'Всё готово.'} Перенаправляем в личный кабинет…
          </p>
          <Button onClick={() => navigate('/dashboard')} fullWidth>
            Перейти сейчас
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            Не удалось подтвердить email
          </h2>
          <p className="text-slate-600">
            {message || 'Ссылка недействительна или устарела.'}
          </p>
          <Button onClick={handleResend} loading={resending} disabled={resending} fullWidth>
            Отправить письмо повторно
          </Button>
        </div>
      )}

      {status === 'idle' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-brand-start">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 5L2 7" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-slate-900">
            Проверьте вашу почту
          </h2>
          <p className="text-slate-600">
            Мы отправили ссылку для подтверждения
            {user?.email ? (
              <>
                {' '}на <span className="font-medium text-slate-900">{user.email}</span>
              </>
            ) : null}
            . Перейдите по ней, чтобы активировать аккаунт.
          </p>
          <Button onClick={handleResend} loading={resending} disabled={resending} fullWidth>
            Отправить письмо повторно
          </Button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-brand-start hover:text-brand-end cursor-pointer"
          >
            Перейти в личный кабинет
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default EmailConfirm;
