import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Контент декоративной панели (правая колонка на десктопе) */
  asideTitle: string;
  asideText: string;
  bullets: string[];
}

/**
 * Полноэкранный каркас для страниц аутентификации.
 * Десктоп (>=1024px) — две колонки: форма + декоративная градиентная панель.
 * Планшет/телефон — одна колонка, панель скрывается.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  asideTitle,
  asideText,
  bullets,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen bg-brand-gradient-soft">
      {/* Мягкий градиентный фон */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Колонка с формой */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mx-auto w-full max-w-md"
        >
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            На главную
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-slate-600">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </motion.div>

        {/* Декоративная панель — только на десктопе */}
        <motion.aside
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="relative hidden overflow-hidden rounded-3xl bg-brand-gradient p-10 text-white shadow-glow lg:block"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <h2 className="mt-8 text-3xl font-bold tracking-tight">
              {asideTitle}
            </h2>
            <p className="mt-3 text-white/80">{asideText}</p>
            <ul className="mt-8 space-y-4">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-white/90">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

export default AuthShell;
