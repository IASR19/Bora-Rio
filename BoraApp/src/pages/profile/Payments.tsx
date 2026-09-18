import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

const STATUS_LABEL: Record<string, string> = {
  free: 'Grátis',
  active: 'Ativo',
  canceled: 'Cancelado',
};

export function Payments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const status = user?.subscriptionStatus ?? 'free';

  return (
    <div className="bg-background px-5 pt-6">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="mt-4 text-2xl font-extrabold">Pagamentos</h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Plano atual</p>
        <p className="mt-1 gradient-text text-xl font-extrabold">BORA CLUB</p>
        <p className="mt-1 text-sm text-muted">
          R$ 4,99/mês · <span className="font-semibold text-foreground">{STATUS_LABEL[status] ?? status}</span>
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
        Cobrança automática ainda não está disponível nesta versão — quando o BORA Club estiver com pagamento
        ativo, seu método de pagamento e histórico de cobranças aparecem aqui.
      </div>
    </div>
  );
}
