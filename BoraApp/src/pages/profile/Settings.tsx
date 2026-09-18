import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { usersService } from '@/services/users.service';

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        checked ? 'bg-bora-gradient' : 'bg-surface-alt'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleToggleShowInWhoIsGoing = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await usersService.updateMe({ showInWhoIsGoing: !user.showInWhoIsGoing });
      await refreshUser();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background px-5 pt-6">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="mt-4 text-2xl font-extrabold">Configurações</h1>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <div className="pr-4">
            <p className="font-semibold">Aparecer em "Quem vai"</p>
            <p className="mt-0.5 text-xs text-muted">
              Outras pessoas confirmadas no mesmo evento veem seu nome e foto na aba Quem Vai.
            </p>
          </div>
          <Toggle checked={user?.showInWhoIsGoing ?? true} onChange={handleToggleShowInWhoIsGoing} disabled={saving} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="font-semibold">Localização</p>
          <p className="mt-0.5 text-xs text-muted">
            Controlada pela permissão do navegador/sistema. Pra revogar, ajuste nas configurações de localização do
            seu dispositivo ou navegador — o BORA continua funcionando por cidade sem ela.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="font-semibold">Notificações</p>
          <p className="mt-0.5 text-xs text-muted">
            Notificações push ainda não estão disponíveis nesta versão — em breve você poderá escolher quais tipos
            receber.
          </p>
        </div>
      </div>
    </div>
  );
}
