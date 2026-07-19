import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 font-semibold min-h-[44px] ' +
  'transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-glow hover:brightness-110 focus-visible:ring-brand-end',
  secondary:
    'bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
};

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size={18} />}
      {children}
    </motion.button>
  );
}

export default Button;
