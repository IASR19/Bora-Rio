import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export function Security() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
