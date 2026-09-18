import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { resizeImageToBase64 } from '@/utils/image';

const SELFIE_SIZE = 400;

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function Security() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [cpf, setCpf] = useState('');
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const identityVerified = Boolean(user?.cpf && user?.selfieUrl);

  const handleSelfieChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSelfieUrl(await resizeImageToBase64(file, SELFIE_SIZE));
    } catch {
      setIdentityError('Não foi possível processar essa foto.');
    }
  };

  const handleSubmitIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfieUrl) {
      setIdentityError('Tire uma selfie antes de enviar.');
      return;
    }
    setIdentityLoading(true);
    setIdentityError(null);
    try {
      await usersService.submitIdentity(cpf, selfieUrl);
      await refreshUser();
    } catch (err) {
      setIdentityError(err instanceof ApiError ? err.message : 'Não foi possível verificar sua identidade.');
    } finally {
      setIdentityLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'Não foi possível trocar a senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await usersService.deleteMe();
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir a conta.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-background px-5 pt-6">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="mt-4 text-2xl font-extrabold">Segurança</h1>

      <form className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-4" onSubmit={handleChangePassword}>
        <p className="font-semibold">Trocar senha</p>
        <p className="text-xs text-muted">
          Se você entra pelo Google, sua conta não tem senha — essa troca só funciona pra quem cadastrou com e-mail.
        </p>
        <Input
          type="password"
          placeholder="Senha atual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Nova senha"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
        {passwordError && <p className="text-sm text-destaque">{passwordError}</p>}
        {passwordSuccess && <p className="text-sm text-green-400">Senha alterada.</p>}
        <Button type="submit" variant="outline" className="w-full" disabled={passwordLoading}>
          {passwordLoading ? 'Salvando...' : 'Trocar senha'}
        </Button>
      </form>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="font-semibold">Verificação de identidade</p>
        {identityVerified ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <BadgeCheck className="h-4 w-4 text-destaque" /> Identidade verificada. Seus eventos publicam na hora.
          </p>
        ) : (
          <form className="mt-3 space-y-3" onSubmit={handleSubmitIdentity}>
            <p className="text-xs text-muted">
              Telefone confirmado + CPF + uma selfie liberam publicar evento na hora, mesmo em local novo, sem
              esperar check-in de ninguém.
            </p>
            <Input placeholder="CPF" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} required />
            <button
              type="button"
              onClick={() => selfieInputRef.current?.click()}
              className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-background text-sm text-muted"
            >
              {selfieUrl ? <img src={selfieUrl} className="h-full w-full object-cover" alt="" /> : 'Tirar selfie'}
            </button>
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleSelfieChange}
            />
            {identityError && <p className="text-sm text-destaque">{identityError}</p>}
            <Button type="submit" variant="outline" className="w-full" disabled={identityLoading}>
              {identityLoading ? 'Enviando...' : 'Verificar identidade'}
            </Button>
          </form>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-destaque/30 bg-surface p-4">
        <p className="font-semibold text-destaque">Excluir conta</p>
        <p className="mt-1 text-xs text-muted">
          Seus dados são removidos do BORA. Essa ação não pode ser desfeita.
        </p>
        {deleteError && <p className="mt-2 text-sm text-destaque">{deleteError}</p>}
        {!confirmingDelete ? (
          <Button variant="outline" className="mt-3 w-full" onClick={() => setConfirmingDelete(true)}>
            Excluir minha conta
          </Button>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-semibold">Tem certeza? Isso não pode ser desfeito.</p>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleDeleteAccount} disabled={deleteLoading}>
                {deleteLoading ? 'Excluindo...' : 'Confirmar exclusão'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
