/**
 * components/ThemeToggle.tsx
 * -----------------------------------------------------------------------------
 * Umschalter fuer Hell-/Dunkelmodus (oben rechts in der Topbar).
 */

import { useTheme } from '../theme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={
        theme === 'light'
          ? 'Zu dunklem Design wechseln'
          : 'Zu hellem Design wechseln'
      }
    >
      {theme === 'light' ? '◐ Dunkel' : '◑ Hell'}
    </button>
  );
}
