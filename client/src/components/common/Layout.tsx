import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow-blue">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
      <span className="text-lg tracking-tight">AuthApp</span>
    </Link>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Плавающая навигация с отступами от краёв */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 shadow-lg backdrop-blur-md">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline-block cursor-pointer"
                >
                  Личный кабинет
                </Link>
                <span className="hidden max-w-[140px] truncate text-sm text-slate-500 md:inline-block">
                  {user?.email}
                </span>
                <Button variant="secondary" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Войти
                </Link>
                <Link to="/register">
                  <Button variant="primary">Начать</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1"
      >
        {children}
      </motion.main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} AuthApp. Безопасная аутентификация.
      </footer>
    </div>
  );
}

export default Layout;
