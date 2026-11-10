import { t, useI18n } from '@/i18n';
import { ArrowLeft, FileUp, PartyPopper, Store } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { useAuth } from '@/context/AuthContext';
import { useGoAfterLogin } from '@/hooks/useGoAfterLogin';
import { geocodeWithFallback, lookupCep, type CepAddress } from '@/services/cep.service';
import { ApiError } from '@/shared/api/client';
import { VENUE_CATEGORY_OPTIONS } from '@/shared/constants/venue-categories';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import type { User } from '@/types/domain';
import {
  ACCEPTED_CONTRACT_TYPES,
  MAX_CONTRACT_BYTES,
  formatCep,
  formatCnpj,
  formatCpf,
  readAsDataUrl,
} from '@/utils/businessContract';
import { readGoogleCredential } from '@/utils/googleCredential';
import { takePendingCheckin } from '@/utils/pendingCheckin';

type AccountType = 'user' | 'business';

/** A API não informa progresso real (CNPJ + IA levam até ~30 s): a barra avança por tempo
 * e só completa quando a resposta chega. */
const PROGRESS_CAP = 92;
/** O ID token do Google vale cerca de 1 h: se vencer no meio do cadastro, a API o recusa. */
const GOOGLE_EXPIRED = 'Sua sessão do Google expirou. Clique em "Continuar com Google" de novo.';

function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-border" /> {t('ou')} <span className="h-px flex-1 bg-border" />
    </div>
  );
}
const PROGRESS_TICK_MS = 300;
const ANALYSIS_STEPS = [
  { from: 0, label: 'Enviando contrato social...' },
  { from: 15, label: 'Consultando o CNPJ na Receita...' },
  { from: 35, label: 'Lendo o contrato com IA...' },
  { from: 70, label: 'Conferindo razão social e sócios...' },
];

function AnalysisProgress({ value }: { value: number }) {
  useI18n();
  const step = [...ANALYSIS_STEPS].reverse().find((s) => value >= s.from) ?? ANALYSIS_STEPS[0];
  return (
    <div className="space-y-2">
      <div
        role="progressbar"
        aria-label={t('Análise do contrato social')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-alt"
      >
        <div
          className="h-full rounded-full bg-bora-gradient transition-[width] duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="flex justify-between text-xs text-muted">
        <span>{t(step.label)}</span>
        <span>{Math.round(value)}%</span>
      </p>
    </div>
  );
}

function AccountTypeCard({
  icon: Icon,
  title,
  text,
  onClick,
  disabled,
}: {
  icon: typeof Store;
  title: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface p-5 text-left hover:border-destaque disabled:opacity-60"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-bora-gradient-soft text-destaque">
        <Icon className="h-7 w-7" />
      </span>
      <span>
        <span className="block text-lg font-extrabold">{t(title)}</span>
        <span className="mt-1 block text-sm text-muted">{t(text)}</span>
      </span>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('Voltar')}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}

function UserForm({ onBack }: { onBack: () => void }) {
  useI18n();
  const navigate = useNavigate();
  const goAfterLogin = useGoAfterLogin();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    gender: 'undisclosed',
    phone: '',
    email: '',
    password: '',
    cpf: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.cpf.replace(/\D/g, '').length !== 11) {
      setError('Informe o CPF completo.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, cpf: form.cpf.replace(/\D/g, '') });
      const pending = takePendingCheckin();
      navigate('/verification', { replace: true, state: { next: pending ?? '/preferences/intentions' } });
    } catch (err) {
      setError(err instanceof ApiError ? err.sourceMessage : 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackButton onClick={onBack} />
      <h1 className="mt-4 text-3xl font-extrabold">{t('Criar conta')}</h1>
      <p className="mt-2 text-sm text-muted">{t('Não pedimos informações desnecessárias.')}</p>

      {/* Pelo Google a conta de usuário é criada na hora; CPF e o resto vêm em "Completar cadastro". */}
      <div className="mt-8">
        <GoogleSignInButton text="signup_with" onSuccess={goAfterLogin} onError={setError} />
      </div>
      <OrDivider />

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input placeholder={t('Nome')} value={form.name} onChange={update('name')} required />
        <Input
          placeholder="CPF (000.000.000-00)"
          value={form.cpf}
          onChange={(e) => setForm((prev) => ({ ...prev, cpf: formatCpf(e.target.value) }))}
          inputMode="numeric"
          required
        />
        <Input
          type="date"
          placeholder={t('Data de nascimento')}
          value={form.birthDate}
          onChange={update('birthDate')}
          required
        />
        <Select value={form.gender} onChange={update('gender')}>
          <option value="undisclosed">{t('Prefiro não dizer')}</option>
          <option value="female">{t('Feminino')}</option>
          <option value="male">{t('Masculino')}</option>
          <option value="other">{t('Outro')}</option>
        </Select>
        <Input placeholder="+55 21 90000-0000" value={form.phone} onChange={update('phone')} required />
        <Input type="email" placeholder={t('E-mail')} value={form.email} onChange={update('email')} required />
        <Input type="password" placeholder={t('Senha')} value={form.password} onChange={update('password')} required />
        {error && <p className="text-sm text-destaque">{t(error)}</p>}
        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? t('Criando...') : t('Continuar')}
        </Button>
      </form>
    </>
  );
}

function BusinessForm({
  onBack,
  googleCredential,
  onGoogleCredential,
}: {
  onBack: () => void;
  /** Quando preenchido, o acesso é pela conta Google (sem e-mail e senha). */
  googleCredential: string | null;
  onGoogleCredential: (credential: string | null) => void;
}) {
  useI18n();
  const navigate = useNavigate();
  const goAfterLogin = useGoAfterLogin();
  const { registerBusiness, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const googleAccount = googleCredential ? readGoogleCredential(googleCredential) : null;
  const [form, setForm] = useState({
    name: googleAccount?.name ?? '',
    email: '',
    password: '',
    phone: '',
    cnpj: '',
    venueName: '',
    category: VENUE_CATEGORY_OPTIONS[0].value as string,
    number: '',
    complement: '',
    city: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [cep, setCep] = useState('');
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [address, setAddress] = useState<CepAddress | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geoFailed, setGeoFailed] = useState(false);
  const latestCep = useRef('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setProgress((p) => p + (PROGRESS_CAP - p) * 0.05), PROGRESS_TICK_MS);
    return () => clearInterval(id);
  }, [loading]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  /** Google com conta de comércio entra direto. Com conta de usuário, não: o comércio precisa de
   * outro e-mail, então sai da conta que acabou de entrar e avisa. */
  const handleExistingGoogleAccount = async (user: User) => {
    if (user.accountType === 'business') {
      goAfterLogin(user);
      return;
    }
    await logout();
    setError('Esse Google já tem uma conta de usuário no Bora. Use outro e-mail para o comércio.');
  };

  const connectGoogle = (credential: string) => {
    setError(null);
    onGoogleCredential(credential);
    const { name } = readGoogleCredential(credential);
    if (name) setForm((prev) => (prev.name ? prev : { ...prev, name }));
  };

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

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, '');
    latestCep.current = digits;
    setAddress(null);
    setCoords(null);
    setGeoFailed(false);
    if (digits.length !== 8) {
      setCepStatus('idle');
      return;
    }
    setCepStatus('loading');
    let found: CepAddress | null = null;
    try {
      found = await lookupCep(digits);
    } catch {
      found = null;
    }
    if (latestCep.current !== digits) return;
    if (!found) {
      setCepStatus('not-found');
      return;
    }
    setAddress(found);
    setForm((prev) => ({ ...prev, city: `${found.city} - ${found.state}` }));
    setCepStatus('found');
    const geo = await geocodeWithFallback(found);
    if (latestCep.current !== digits) return;
    setCoords(geo);
    setGeoFailed(!geo);
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === 1) {
      const phoneDigits = form.phone.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        setError('Informe um telefone válido com DDD.');
        return;
      }
      setStep(2);
      return;
    }
    if (form.cnpj.replace(/\D/g, '').length !== 14) {
      setError('Informe o CNPJ completo.');
      return;
    }
    if (!file) {
      setError('Anexe o contrato social (PDF ou foto).');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address) {
      setError('Preencha o CEP e aguarde o endereço ser localizado.');
      return;
    }
    if (!coords) {
      setError(
        geoFailed
          ? 'Não conseguimos localizar esse endereço no mapa. Confira o CEP e o número.'
          : 'Preencha o CEP e aguarde o endereço ser localizado.',
      );
      return;
    }
    if (!file) {
      setStep(2);
      return;
    }
    const fullAddress = [
      address.street ? `${address.street}${form.number ? `, ${form.number}` : ''}` : '',
      form.complement,
      address.neighborhood,
      `${address.city} - ${address.state}`,
    ]
      .filter(Boolean)
      .join(', ');
    setProgress(0);
    setLoading(true);
    try {
      await registerBusiness({
        name: form.name.trim(),
        ...(googleCredential ? { googleIdToken: googleCredential } : { email: form.email, password: form.password }),
        phone: form.phone,
        cnpj: form.cnpj.replace(/\D/g, ''),
        contractFile: await readAsDataUrl(file),
        venue: {
          name: form.venueName.trim(),
          category: form.category,
          address: fullAddress,
          latitude: coords.latitude,
          longitude: coords.longitude,
          city: form.city.trim() || `${address.city} - ${address.state}`,
        },
      });
      setProgress(100);
      if (googleCredential) navigate('/business', { replace: true });
      else navigate('/verification', { replace: true, state: { next: '/business' } });
    } catch (err) {
      if (googleCredential && err instanceof ApiError && err.errorCode === 'INVALID_CREDENTIALS') {
        onGoogleCredential(null);
        setError(GOOGLE_EXPIRED);
        setStep(1);
        return;
      }
      const message = err instanceof ApiError ? err.sourceMessage : 'Não foi possível criar sua conta.';
      setError(message);
      if (/e-?mail/i.test(message)) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackButton onClick={step === 1 ? onBack : () => setStep(step - 1)} />
      <h1 className="mt-4 text-3xl font-extrabold">{t('Conta de estabelecimento')}</h1>
      <p className="mt-2 text-sm text-muted">{t('Passo {step} de 3', { step })}</p>

      <form className="mt-6 space-y-3" onSubmit={step === 3 ? handleSubmit : nextStep}>
        {step === 1 && (
          <>
            <div className="rounded-2xl border border-destaque/40 bg-bora-gradient-soft p-4 text-sm font-semibold">
              {t(
                'Use o e-mail e os dados do seu comércio. Esta conta serve só para administrar o seu estabelecimento. Para usar o Bora como pessoa, faça outro cadastro com outro e-mail.',
              )}
            </div>
            {googleAccount ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block text-xs text-muted">{t('Acesso pela conta Google')}</span>
                  <span className="block truncate font-semibold">{googleAccount.email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onGoogleCredential(null)}
                  className="shrink-0 text-xs font-semibold text-destaque"
                >
                  {t('Usar e-mail e senha')}
                </button>
              </div>
            ) : (
              <>
                {/* Google sem conta vira o acesso deste comércio. */}
                <GoogleSignInButton
                  text="signup_with"
                  onSuccess={(user) => void handleExistingGoogleAccount(user)}
                  onError={setError}
                  onAccountNotFound={connectGoogle}
                />
                <OrDivider />
                <Input
                  type="email"
                  placeholder={t('E-mail do comércio')}
                  value={form.email}
                  onChange={update('email')}
                  required
                />
                <Input
                  type="password"
                  placeholder={t('Senha')}
                  value={form.password}
                  onChange={update('password')}
                  minLength={8}
                  required
                />
              </>
            )}
            <Input
              placeholder={t('Nome do responsável')}
              value={form.name}
              onChange={update('name')}
              minLength={2}
              required
            />
            <Input placeholder="+55 21 90000-0000" value={form.phone} onChange={update('phone')} required />
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="mb-2 block text-sm font-semibold text-muted">CNPJ</label>
              <Input
                placeholder="00.000.000/0001-00"
                value={form.cnpj}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    cnpj: formatCnpj(e.target.value),
                  }))
                }
                inputMode="numeric"
                required
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-left text-sm text-muted"
              >
                <FileUp className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {file ? file.name : t('Anexar contrato social (PDF ou foto, até 2,5 MB)')}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_CONTRACT_TYPES}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Input
              placeholder={t('Nome do estabelecimento')}
              value={form.venueName}
              onChange={update('venueName')}
              minLength={2}
              required
            />
            <Select value={form.category} onChange={update('category')}>
              {VENUE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </Select>
            <div>
              <Input
                placeholder="CEP (00000-000)"
                value={cep}
                onChange={(e) => handleCepChange(e.target.value)}
                inputMode="numeric"
                required
              />
              {cepStatus === 'loading' && <p className="mt-2 text-xs text-muted">{t('Buscando endereço...')}</p>}
              {cepStatus === 'not-found' && <p className="mt-2 text-xs text-destaque">{t('CEP não encontrado.')}</p>}
              {cepStatus === 'found' && geoFailed && (
                <p className="mt-2 text-xs text-destaque">
                  {t('Não conseguimos localizar esse endereço no mapa. Confira o CEP e o número.')}
                </p>
              )}
              {cepStatus === 'found' && address && (
                <p className="mt-2 text-xs text-muted">
                  {address.street && `${address.street}, `}
                  {address.neighborhood}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Input placeholder={t('Número')} value={form.number} onChange={update('number')} />
              <Input placeholder={t('Complemento')} value={form.complement} onChange={update('complement')} />
            </div>
            <Input placeholder={t('Cidade')} value={form.city} onChange={update('city')} required />
          </>
        )}

        {error && <p className="text-sm text-destaque">{t(error)}</p>}
        {loading ? (
          <AnalysisProgress value={progress} />
        ) : (
          <Button size="lg" className="w-full" type="submit">
            {step === 3 ? t('Criar conta de estabelecimento') : t('Continuar')}
          </Button>
        )}
      </form>
    </>
  );
}

export function Register() {
  useI18n();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const goAfterLogin = useGoAfterLogin();
  const { loginWithGoogle } = useAuth();
  const tipo = searchParams.get('tipo');
  const [type, setType] = useState<AccountType | null>(
    tipo === 'usuario' ? 'user' : tipo === 'comercio' ? 'business' : null,
  );
  // Vem do login com Google de quem ainda não tem conta (Login → "Continuar com Google").
  const [googleCredential, setGoogleCredential] = useState<string | null>(
    (location.state as { googleCredential?: string } | null)?.googleCredential ?? null,
  );
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);

  // O token já foi lido acima: tira do histórico da aba para não ser reaproveitado ao voltar/recarregar.
  useEffect(() => {
    if (location.state) navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
  }, [location.state, location.pathname, location.search, navigate]);
  const googleEmail = googleCredential ? readGoogleCredential(googleCredential).email : undefined;

  const chooseUser = async () => {
    if (!googleCredential) {
      setType('user');
      return;
    }
    setChoiceError(null);
    setCreatingUser(true);
    try {
      goAfterLogin(await loginWithGoogle(googleCredential, { createAccount: true }));
    } catch (err) {
      setGoogleCredential(null);
      setChoiceError(
        err instanceof ApiError && err.errorCode === 'INVALID_CREDENTIALS'
          ? GOOGLE_EXPIRED
          : 'Não foi possível criar sua conta.',
      );
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="app-shell min-h-dvh bg-background px-6 pb-10 pt-16">
      {type === null && (
        <>
          <h1 className="text-3xl font-extrabold">{t('Criar conta')}</h1>
          <p className="mt-2 text-sm text-muted">{t('Como você quer usar o Bora?')}</p>
          {googleEmail && (
            <p className="mt-4 rounded-2xl border border-destaque/40 bg-bora-gradient-soft p-4 text-sm">
              {t('Sua conta Google {email} ainda não tem cadastro no Bora. Escolha o tipo de conta para continuar.', {
                email: googleEmail,
              })}
            </p>
          )}
          <div className="mt-8 space-y-4">
            <AccountTypeCard
              icon={PartyPopper}
              title="Quero curtir eventos"
              text="Descubra lugares, confirme presença e faça check-in."
              onClick={() => void chooseUser()}
              disabled={creatingUser}
            />
            <AccountTypeCard
              icon={Store}
              title="Tenho um estabelecimento"
              text="Gerencie seu local, eventos e promoções."
              onClick={() => setType('business')}
            />
          </div>
          {creatingUser && <p className="mt-4 text-sm text-muted">{t('Criando...')}</p>}
          {choiceError && <p className="mt-4 text-sm text-destaque">{t(choiceError)}</p>}
        </>
      )}
      {type === 'user' && <UserForm onBack={() => setType(null)} />}
      {type === 'business' && (
        <BusinessForm
          onBack={() => setType(null)}
          googleCredential={googleCredential}
          onGoogleCredential={setGoogleCredential}
        />
      )}

      <p className="mt-8 text-center text-sm text-muted">
        {' '}
        {t('Já tem uma conta?')}{' '}
        <Link to="/login" className="font-semibold text-foreground underline">
          {' '}
          {t('Entrar')}{' '}
        </Link>
      </p>
    </div>
  );
}
