import { t, useI18n } from '@/i18n';
import { Globe, LogOut, UserPlus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/context/AuthContext';
import { usersService } from '@/services/users.service';
import { Button } from '@/shared/ui/Button';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { formatCnpj } from '@/utils/businessContract';
import { resizeImageToBase64 } from '@/utils/image';

import { useBusinessMe } from './BusinessLayout';

const AVATAR_SIZE = 256;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Em análise',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export function BusinessAccount() {
  useI18n();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const me = useBusinessMe();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSaving(true);
    try {
      const avatarUrl = await resizeImageToBase64(file, AVATAR_SIZE);
      await usersService.updateMe({ avatarUrl });
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Não foi possível processar essa imagem.'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleCreateUserAccount = async () => {
    await logout();
    navigate('/register?tipo=usuario', { replace: true });
  };

  const status = me.data?.status ?? user?.businessVerificationStatus ?? null;
  const rows: [string, string | null | undefined][] = [
    ['Responsável', user?.name],
    ['E-mail', user?.email],
    ['CNPJ', user?.businessCnpj ? formatCnpj(user.businessCnpj) : null],
    ['Estabelecimento', me.data?.venue?.name ?? user?.businessName],
    ['Status do cadastro', status ? t(STATUS_LABELS[status]) : null],
  ];

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-extrabold">{t('Conta')}</h1>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          aria-label={t('Trocar foto')}
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-bora-gradient text-2xl font-extrabold text-white"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} className="h-full w-full object-cover" alt="" />
          ) : (
            (user?.name || 'B').charAt(0)
          )}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          className="text-sm font-semibold text-destaque"
        >
          {t('Trocar foto')}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        {error && <p className="text-sm text-destaque">{error}</p>}
      </div>

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm">
              <span className="text-muted">{t(label)}</span>
              <span className="truncate text-right font-medium">{value}</span>
            </div>
          ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Globe aria-hidden="true" className="h-4 w-4 text-destaque" /> {t('Idioma')}
        </p>
        <LanguageSelector className="mt-3" />
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-semibold"
      >
        <UserPlus className="h-4 w-4" /> {t('Adicionar conta de usuário')}
      </button>

      <button
        onClick={() => void handleLogout()}
        className="mt-4 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-destaque"
      >
        <LogOut className="h-4 w-4" /> {t('Sair')}
      </button>

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Adicionar conta de usuário">
        <p className="text-sm text-muted">
          {t(
            'Esta conta é só para administrar o seu estabelecimento. Para usar o Bora como pessoa, crie uma conta de usuário com outro e-mail.',
          )}
        </p>
        <Button className="mt-5 w-full" onClick={() => void handleCreateUserAccount()}>
          {t('Criar conta de usuário')}
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => setSheetOpen(false)}>
          {t('Cancelar')}
        </Button>
      </BottomSheet>
    </div>
  );
}
