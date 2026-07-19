import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '../components/common/Layout';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

interface Feature {
  title: string;
  text: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    title: 'Безопасность по умолчанию',
    text: 'JWT-токены, подтверждение email и защищённые маршруты из коробки.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Молниеносная скорость',
    text: 'Собрано на Vite и React 18 — мгновенная загрузка и отклик интерфейса.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Продуманный UX',
    text: 'Валидация в реальном времени, понятные ошибки и адаптивный дизайн.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-gradient-soft opacity-70 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Готово к работе — регистрация открыта
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tightest text-slate-900 sm:text-6xl"
          >
            Аутентификация, которой
            <span className="block bg-brand-gradient bg-clip-text text-transparent">
              можно доверять
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-600"
          >
            Современная система входа с подтверждением email, восстановлением
            пароля и защищённым личным кабинетом. Всё, что нужно для безопасного
            старта вашего продукта.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="primary" fullWidth className="sm:px-8">
                  Перейти в ЛК
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="primary" fullWidth className="sm:px-8">
                    Зарегистрироваться
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" fullWidth className="sm:px-8">
                    Войти
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {isAuthenticated && user && (
            <p className="mt-4 text-sm text-slate-500">
              Вы вошли как {user.email}
            </p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.article
              key={f.title}
              variants={item}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-md transition-colors duration-200 hover:border-brand-end/40"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow-blue">
                {f.icon}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-slate-600">{f.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </Layout>
  );
}

export default HomePage;
