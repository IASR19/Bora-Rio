import { Calendar, Compass, Home, Plus, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/utils/cn';

const items = [
  { to: '/home', label: 'Início', icon: Home },
  { to: '/explore', label: 'Explorar', icon: Compass },
];

const itemsEnd = [
  { to: '/events', label: 'Eventos', icon: Calendar },
  { to: '/profile', label: 'Perfil', icon: User },
];

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] items-center justify-between border-t border-border bg-background/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur">
      {items.map((item) => (
        <NavItem key={item.to} {...item} />
      ))}

      <NavLink
        to="/bora"
        className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-bora-gradient shadow-glow"
        aria-label="BORA"
      >
        <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
      </NavLink>

      {itemsEnd.map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Home }) {
  return (
    <NavLink
      to={to}
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
          {label}
        </>
      )}
    </NavLink>
  );
}
