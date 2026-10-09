import { BadgeCheck, Clock, FileUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { usersService } from '@/services/users.service';
import { ApiError } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

// Em base64 o arquivo cresce 4/3 e precisa caber no limite de envio da API (4 MB).
const MAX_CONTRACT_BYTES = 2.5 * 1024 * 1024;
const ACCEPTED_CONTRACT_TYPES = 'application/pdf,image/jpeg,image/png,image/webp';

export function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** A API não informa progresso real (BrasilAPI + IA levam ~10–25 s): a barra avança por tempo,
 * desacelerando perto do teto, e só completa quando a resposta chega. */
const PROGRESS_CAP = 92;
const PROGRESS_TICK_MS = 300;
const ANALYSIS_STEPS = [
  { from: 0, label: 'Enviando contrato social...' },
  { from: 15, label: 'Consultando o CNPJ na Receita...' },
  { from: 35, label: 'Lendo o contrato com IA...' },
  { from: 70, label: 'Conferindo razão social e sócios...' },
];

function AnalysisProgress({ value }: { value: number }) {
  const step = [...ANALYSIS_STEPS].reverse().find((s) => value >= s.from) ?? ANALYSIS_STEPS[0];
  return (
    <div className="space-y-2">
      <div
        role="progressbar"
        aria-label="Análise do contrato social"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-alt"
      >
        <div className="h-full rounded-full bg-bora-gradient transition-[width] duration-300" style={{ width: `${value}%` }} />
      </div>
      <p className="flex justify-between text-xs text-muted">
        <span>{step.label}</span>
        <span>{Math.round(value)}%</span>
      </p>
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

/**
 * Ponto comercial: na primeira vez, CNPJ + contrato social (analisado por IA contra o CNPJ);
 * depois, mostra o CNPJ já validado (ou em análise) e reaproveita sem pedir de novo.
 */
export function BusinessVerificationCard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cnpj, setCnpj] = useState(user?.businessCnpj ? formatCnpj(user.businessCnpj) : '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!sending) return;
    const id = setInterval(() => setProgress((p) => p + (PROGRESS_CAP - p) * 0.05), PROGRESS_TICK_MS);
    return () => clearInterval(id);
  }, [sending]);

  const status = user?.businessVerificationStatus;
  // Aprovação automática confere o CPF da identidade verificada no contrato (ver BusinessVerificationService).
  const identityVerified = Boolean(user?.phoneVerified && user.cpf && user.selfieUrl);

  if (status === 'approved') {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-destaque" />
        <p>
          <span className="font-semibold">{user?.businessName ?? 'Empresa verificada'}</span>
          <span className="block text-xs text-muted">CNPJ {formatCnpj(user?.businessCnpj ?? '')} · validado</span>
        </p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
        <p>
          <span className="font-semibold">CNPJ {formatCnpj(user?.businessCnpj ?? '')} em análise</span>
          <span className="block text-xs text-muted">
            {user?.businessVerificationNote ?? 'Estamos conferindo seu contrato social.'} Seus eventos comerciais ficam em
            análise até a aprovação.
          </span>
        </p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setError(null);
    if (selected && selected.size > MAX_CONTRACT_BYTES) {
      setError('O arquivo precisa ter no máximo 2,5 MB.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    setError(null);
    if (cnpj.replace(/\D/g, '').length !== 14) {
      setError('Informe o CNPJ completo.');
      return;
    }
    if (!file) {
      setError('Anexe o contrato social (PDF ou foto).');
      return;
    }
    setProgress(0);
    setSending(true);
    try {
      await usersService.submitBusinessVerification(cnpj, await readAsDataUrl(file));
      setProgress(100);
      await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar o contrato social.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border bg-surface p-3">
      <p className="text-xs text-muted">
        {status === 'rejected'
          ? `Validação anterior reprovada: ${user?.businessVerificationNote ?? 'envie um novo documento.'}`
          : 'Só na primeira vez: informe o CNPJ e anexe o contrato social. Conferimos se o documento bate com o CNPJ e se seu CPF aparece como sócio, e depois reaproveitamos nos próximos eventos.'}
      </p>
      {!identityVerified && (
        <p className="text-xs text-muted">
          Sem identidade verificada a validação vai pra revisão manual.{' '}
          <button type="button" onClick={() => navigate('/profile/security')} className="font-semibold text-destaque">
            Verificar identidade
          </button>{' '}
          antes deixa a aprovação automática.
        </p>
      )}
      <div>
        <label className="mb-2 block text-sm font-semibold text-muted">CNPJ</label>
        <Input
          placeholder="00.000.000/0001-00"
          value={cnpj}
          onChange={(e) => setCnpj(formatCnpj(e.target.value))}
          inputMode="numeric"
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-left text-sm text-muted"
        >
          <FileUp className="h-4 w-4 shrink-0" />
          <span className="truncate">{file ? file.name : 'Anexar contrato social (PDF ou foto, até 2,5 MB)'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_CONTRACT_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="text-sm text-destaque">{error}</p>}
      {sending ? (
        <AnalysisProgress value={progress} />
      ) : (
        <Button type="button" className="w-full" onClick={handleSubmit}>
          Validar CNPJ
        </Button>
      )}
    </div>
  );
}
