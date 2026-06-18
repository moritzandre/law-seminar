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
import type { ModuleKind, Phase } from '@shared/types';

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

/** Status-Badge fuer die aktuelle Phase. Bei Praesentationsmodulen passende Texte. */
export function PhaseBadge({ phase, kind }: { phase: Phase; kind?: ModuleKind }) {
  const presentation = kind === 'presentation';
  const map: Record<Phase, { label: string; cls: string }> = {
    idle: { label: 'Bereit', cls: 'badge-idle' },
    collecting: {
      label: presentation ? 'Läuft' : 'Sammelt Antworten',
      cls: 'badge-collecting',
    },
    revealed: { label: 'Aufgelöst', cls: 'badge-revealed' },
  };
  const { label, cls } = map[phase];
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}
