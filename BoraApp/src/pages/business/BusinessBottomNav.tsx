import { t, useI18n } from '@/i18n';
import { Calendar, LayoutDashboard, Plus, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/utils/cn';

const items = [
  { to: '/business', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/business/events', label: 'Eventos', icon: Calendar, end: false },
];
const itemsEnd = [{ to: '/business/account', label: 'Conta', icon: User, end: false }];

function NavItem({ to, label, icon: Icon, end }: (typeof items)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium text-muted transition-colors',
          isActive && 'text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-5 w-5', isActive && 'text-destaque')} strokeWidth={2} />
          {t(label)}
        </>
      )}
    </NavLink>
  );
}

export function BusinessBottomNav() {
  useI18n();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] items-center justify-between border-t border-border bg-background/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur">
      {items.map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
      <NavLink
        to="/business/events/new"
        className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-bora-gradient shadow-glow"
        aria-label={t('Criar evento')}
      >
        <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
      </NavLink>
      {itemsEnd.map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}
