import { Bell } from 'lucide-react';

export function Notifications() {
  return (
    <div className="bg-background px-5 pt-8">
      <h1 className="text-2xl font-extrabold">Notificações</h1>

      <div className="mt-10 flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
          <Bell className="h-7 w-7 text-muted" />
        </span>
        <p className="mt-4 font-semibold">Nenhuma notificação por enquanto</p>
        <p className="mt-1 max-w-xs text-sm text-muted">
          Em breve você vai receber avisos de BORA Relâmpago, compatibilidade e eventos salvos aqui.
        </p>
      </div>
    </div>
  );
}
