import { ChevronRight, LogOut } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

const MENU = [
  'Editar perfil',
  'Minhas preferências',
  'Meus eventos',
  'BORA Club',
  'Pagamentos',
  'Configurações',
  'Segurança',
  'Suporte',
];

export function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-background px-5 pt-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bora-gradient text-xl font-extrabold text-white">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} className="h-full w-full rounded-full object-cover" alt={user.name} />
          ) : (
            user?.name?.charAt(0) ?? 'B'
          )}
        </div>
        <div>
          <p className="text-xl font-extrabold">{user?.name ?? 'Visitante'}</p>
          <p className="text-sm text-muted">{user?.city ?? 'Rio de Janeiro'}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface p-4 text-center">
        <div>
          <p className="text-lg font-extrabold">0</p>
          <p className="text-xs text-muted">Eventos</p>
        </div>
        <div>
          <p className="text-lg font-extrabold">0</p>
          <p className="text-xs text-muted">Check-ins</p>
        </div>
        <div>
          <p className="text-lg font-extrabold">0</p>
          <p className="text-xs text-muted">Conexões</p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
        {MENU.map((item) => (
          <button key={item} className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium">
            {item}
            <ChevronRight className="h-4 w-4 text-muted" />
          </button>
        ))}
      </div>

      <button
        onClick={logout}
        className="mt-6 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-destaque"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </div>
  );
}
