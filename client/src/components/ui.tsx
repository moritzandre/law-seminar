/**
 * components/ui.tsx
 * -----------------------------------------------------------------------------
 * Kleine, wiederverwendbare UI-Bausteine, die die globalen Design-System-Klassen
 * kapseln. Bewusst leichtgewichtig (keine UI-Bibliothek).
 */

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';
import type { Phase } from '@shared/types';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
  size?: 'md' | 'lg';
}

export function Button({
  variant = 'secondary',
  block,
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    block ? 'btn-block' : '',
    size === 'lg' ? 'btn-lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  panel?: boolean;
  children: ReactNode;
}

export function Card({ panel, className = '', children, ...rest }: CardProps) {
  const classes = [panel ? 'panel' : 'card', className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

/** Status-Badge fuer die aktuelle Phase. */
export function PhaseBadge({ phase }: { phase: Phase }) {
  const map: Record<Phase, { label: string; cls: string }> = {
    idle: { label: 'Bereit', cls: 'badge-idle' },
    collecting: { label: 'Sammelt Antworten', cls: 'badge-collecting' },
    revealed: { label: 'Aufgeloest', cls: 'badge-revealed' },
  };
  const { label, cls } = map[phase];
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}
