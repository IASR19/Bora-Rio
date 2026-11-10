import { domainLabel } from '@/i18n/domain-label';
import { isProfileComplete } from '@/utils/profile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, CheckCircle2, Clock3, History, Search, ShieldCheck, Users, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n';
import { LanguageMenu } from '@/components/LanguageSelector';
import { adminService, type AdminUser, type Breakdown, type Page } from '@/services/admin.service';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import type { BoraEvent } from '@/types/domain';
import { formatCnpj } from '@/utils/businessContract';

const labels: Record<string, string> = {
  pending_review: 'Em análise',
  published: 'Publicado',
  rejected: 'Rejeitado',
  approved: 'Aprovado',
  pending: 'Em análise',
  admin: 'Administrador',
  user: 'Usuário',
  'user.bootstrap': 'Acesso administrativo atribuído',
  'user.update': 'Usuário atualizado',
  'event.review': 'Evento revisado',
  'business.review': 'Cadastro comercial revisado',
};
const initialFilters = {
  region: '',
  state: '',
  city: '',
  from: '',
  to: '',
  category: '',
  status: '',
  q: '',
  role: '',
  active: '',
  business: '',
};
type Filters = typeof initialFilters;
type Tab = 'dashboard' | 'events' | 'users' | 'business' | 'audit';

function Bars({ title, rows }: { title: string; rows: Breakdown[] }) {
  const { t } = useI18n();
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-5 font-bold">{t(title)}</h2>
      {!rows.length && <p className="text-sm text-muted">{t('Nenhum dado para os filtros selecionados.')}</p>}
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span>{t(labels[r.label] ?? domainLabel(r.label))}</span>
              <strong>{r.count}</strong>
            </div>
            <div className="h-2 rounded-full bg-background">
              <div className="h-full rounded-full bg-bora-gradient" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pagination({
  data,
  page,
  setPage,
}: {
  data?: Pick<Page<unknown>, 'total' | 'pages'>;
  page: number;
  setPage: (p: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted">
        {data?.total ?? 0} {t('registros')} · {t('Página')} {page} / {data?.pages ?? 1}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          {t('Anterior')}
        </Button>
        <Button size="sm" variant="outline" disabled={!data || page >= data.pages} onClick={() => setPage(page + 1)}>
          {t('Próxima')}
        </Button>
      </div>
    </div>
  );
}

export function Admin() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/home" replace />;
  if (!isProfileComplete(user)) return <Navigate to="/complete-profile" replace />;
  return <AdminPanel />;
}

function AdminPanel() {
  const { user, refreshUser } = useAuth();
  const { t, locale } = useI18n();
  const cache = useQueryClient();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [review, setReview] = useState<{ id: string; name: string; kind: 'event' | 'business' } | null>(null);
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');
  const changeFilter = (key: keyof Filters, value: string) => {
    setFilters((f) => ({
      ...f,
      [key]: value,
      ...(key === 'region' ? { state: '', city: '' } : key === 'state' ? { city: '' } : {}),
    }));
    setPage(1);
  };
  const switchTab = (value: Tab) => {
    setTab(value);
    setPage(1);
    setFilters(initialFilters);
    setNotice('');
  };
  const common = Object.fromEntries(
    ['region', 'state', 'city', 'from', 'to'].map((key) => [key, filters[key as keyof Filters]]),
  );
  const eventFilters = { ...common, category: filters.category, status: filters.status, q: filters.q };
  const userFilters = {
    ...common,
    q: filters.q,
    role: filters.role,
    active: filters.active,
    business: tab === 'business' ? 'pending' : filters.business,
  };
  const options = useQuery({ queryKey: ['admin', 'options'], queryFn: adminService.options });
  const dashboard = useQuery({
    queryKey: ['admin', 'dashboard', eventFilters],
    queryFn: () => adminService.dashboard(eventFilters),
    enabled: tab === 'dashboard',
  });
  const events = useQuery({
    queryKey: ['admin', 'events', eventFilters, page],
    queryFn: () => adminService.events({ ...eventFilters, page: String(page) }),
    enabled: tab === 'events',
  });
  const users = useQuery({
    queryKey: ['admin', 'users', userFilters, page],
    queryFn: () => adminService.users({ ...userFilters, page: String(page) }),
    enabled: tab === 'users' || tab === 'business',
  });
  // Quantos cadastros comerciais esperam aprovação: aparece na aba e na Visão geral, em qualquer aba.
  const pendingBusiness = useQuery({
    queryKey: ['admin', 'business-pending-count'],
    queryFn: () => adminService.users({ business: 'pending', limit: '1', page: '1' }),
  });
  const pendingBusinessCount = pendingBusiness.data?.total ?? 0;
  const audit = useQuery({
    queryKey: ['admin', 'audit', page],
    queryFn: () => adminService.audit(page),
    enabled: tab === 'audit',
  });
  const document = useQuery({
    queryKey: ['admin', 'document', review?.id],
    queryFn: () => adminService.document(review!.id),
    enabled: review?.kind === 'business',
  });
  const finish = async () => {
    await cache.invalidateQueries({ queryKey: ['admin'] });
    await refreshUser();
    setEditing(null);
    setReview(null);
    setNote('');
    setNotice('Alterações salvas.');
  };
  const update = useMutation({
    mutationFn: (u: AdminUser) =>
      adminService.updateUser(u.id, {
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        showInWhoIsGoing: u.showInWhoIsGoing,
        language: u.language,
      }),
    onSuccess: finish,
  });
  const moderate = useMutation({
    mutationFn: (decision: 'approved' | 'rejected') =>
      adminService.review(review!.kind, review!.id, decision, note.trim()),
    onSuccess: finish,
  });
  const activeQuery = tab === 'dashboard' ? dashboard : tab === 'events' ? events : tab === 'audit' ? audit : users;
  const states = filters.region
    ? (options.data?.regions[filters.region] ?? [])
    : Object.values(options.data?.regions ?? {})
        .flat()
        .sort();
  const cities = [
    ...new Set(
      options.data?.locations
        .filter(
          (l) =>
            (!filters.state || l.state === filters.state) &&
            (!filters.region || options.data?.regions[filters.region]?.includes(l.state ?? '')),
        )
        .map((l) => l.city)
        .filter((v): v is string => Boolean(v)),
    ),
  ].sort();
  const tabs = [
    { id: 'dashboard', label: 'Visão geral', icon: BarChart3 },
    { id: 'events', label: 'Eventos', icon: CheckCircle2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'business', label: 'Cadastros comerciais', icon: ShieldCheck },
    { id: 'audit', label: 'Histórico', icon: History },
  ] as const;
  const selectFilter = (key: keyof Filters, label: string, choices: { value: string; label: string }[]) => (
    <label className="block text-xs text-muted">
      {t(label)}
      <Select className="mt-1 h-11 text-sm" value={filters[key]} onChange={(e) => changeFilter(key, e.target.value)}>
        <option value="">{t('Todos')}</option>
        {choices.map((c) => (
          <option key={c.value} value={c.value}>
            {t(c.label)}
          </option>
        ))}
      </Select>
    </label>
  );
  const values = (items: string[]) => items.map((v) => ({ value: v, label: v }));

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/profile" className="mb-4 inline-flex items-center gap-2 text-sm text-muted">
              <ArrowLeft className="h-4 w-4" />
              {t('Voltar ao aplicativo')}
            </Link>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-destaque" />
              <h1 className="text-2xl font-extrabold md:text-3xl">{t('Administração')}</h1>
            </div>
            <p className="mt-2 text-sm text-muted">{t('Acompanhe a comunidade, revise eventos e gerencie acessos.')}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageMenu />
            <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm">
              {user?.name} · {t('Administrador')}
            </span>
          </div>
        </header>
        {/* Quebra linha em vez de rolar para o lado: no iPhone a barra de rolagem não aparece e as
         * últimas abas (como Cadastros comerciais) ficavam escondidas. */}
        <nav aria-label={t('Navegação administrativa')} className="mt-7 flex flex-wrap gap-2 pb-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => switchTab(item.id)}
              aria-current={tab === item.id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${tab === item.id ? 'bg-bora-gradient text-white' : 'border border-border bg-surface text-muted'}`}
            >
              <item.icon className="h-4 w-4" />
              {t(item.label)}
              {item.id === 'business' && pendingBusinessCount > 0 && (
                <span
                  aria-label={t('{count} aguardando aprovação', { count: pendingBusinessCount })}
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === 'business' ? 'bg-white text-destaque' : 'bg-destaque text-white'}`}
                >
                  {pendingBusinessCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {tab !== 'business' && pendingBusinessCount > 0 && (
          <button
            type="button"
            onClick={() => switchTab('business')}
            className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-destaque/40 bg-bora-gradient-soft px-4 py-3 text-left text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-destaque" />
              {t(
                pendingBusinessCount === 1
                  ? '1 cadastro comercial aguardando aprovação'
                  : '{count} cadastros comerciais aguardando aprovação',
                { count: pendingBusinessCount },
              )}
            </span>
            <span className="shrink-0 text-destaque">{t('Revisar')}</span>
          </button>
        )}

        {tab !== 'audit' && (
          <section aria-label={t('Filtros')} className="my-5 rounded-2xl border border-border bg-surface p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {selectFilter('region', 'Região', values(Object.keys(options.data?.regions ?? {})))}
              {selectFilter('state', 'Estado', values(states))}
              <label className="text-xs text-muted">
                {t('Cidade')}
                <Input
                  className="mt-1 h-11 text-sm"
                  list="admin-cities"
                  placeholder={t('Todas as cidades')}
                  value={filters.city}
                  onChange={(e) => changeFilter('city', e.target.value)}
                />
                <datalist id="admin-cities">
                  {cities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
              {(tab === 'dashboard' || tab === 'events') &&
                selectFilter(
                  'category',
                  'Categoria',
                  (options.data?.categories ?? []).map((value) => ({ value, label: domainLabel(value) })),
                )}
              <label className="block min-w-0 text-xs text-muted">
                {t(tab === 'users' || tab === 'business' ? 'Cadastro a partir de' : 'Eventos a partir de')}
                <Input
                  type="date"
                  className="mt-1 h-11 text-sm"
                  value={filters.from}
                  onChange={(e) => changeFilter('from', e.target.value)}
                />
              </label>
              <label className="block min-w-0 text-xs text-muted">
                {t('Até')}
                <Input
                  type="date"
                  className="mt-1 h-11 text-sm"
                  value={filters.to}
                  min={filters.from}
                  onChange={(e) => changeFilter('to', e.target.value)}
                />
              </label>
              {(tab === 'dashboard' || tab === 'events') &&
                selectFilter(
                  'status',
                  'Status do evento',
                  ['pending_review', 'published', 'rejected'].map((v) => ({ value: v, label: labels[v] })),
                )}
              {tab === 'users' && (
                <>
                  {selectFilter('role', 'Perfil de acesso', [
                    { value: 'user', label: 'Usuário' },
                    { value: 'admin', label: 'Administrador' },
                  ])}
                  {selectFilter('active', 'Situação da conta', [
                    { value: 'true', label: 'Ativa' },
                    { value: 'false', label: 'Suspensa' },
                  ])}
                </>
              )}
              {tab !== 'dashboard' && (
                <label className="text-xs text-muted">
                  <span className="inline-flex gap-1">
                    <Search className="h-3 w-3" />
                    {t('Buscar')}
                  </span>
                  <Input
                    className="mt-1 h-11 text-sm"
                    placeholder={t(tab === 'events' ? 'Nome do evento ou local' : 'Nome ou e-mail')}
                    value={filters.q}
                    onChange={(e) => changeFilter('q', e.target.value)}
                  />
                </label>
              )}
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs">
              <p className="text-muted">{t('Região e estado consideram registros com UF informada.')}</p>
              <button
                className="font-semibold text-destaque"
                onClick={() => {
                  setFilters(initialFilters);
                  setPage(1);
                }}
              >
                {t('Limpar filtros')}
              </button>
            </div>
          </section>
        )}
        {notice && (
          <p role="status" className="my-4 text-sm text-green-400">
            {t(notice)}
          </p>
        )}
        {(activeQuery.isError || options.isError) && (
          <div role="alert" className="my-5 rounded-xl border border-destaque p-4 text-sm">
            <p>{t(activeQuery.error?.message ?? options.error?.message ?? 'Não foi possível carregar os dados.')}</p>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => {
                void activeQuery.refetch();
                void options.refetch();
              }}
            >
              {t('Tentar novamente')}
            </Button>
          </div>
        )}
        {activeQuery.isLoading && (
          <p role="status" className="py-8 text-muted">
            {t('Carregando...')}
          </p>
        )}

        {tab === 'dashboard' && dashboard.data && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ['Usuários', dashboard.data.users],
                ['Eventos', dashboard.data.events],
                ['Locais', dashboard.data.venues],
                ['Check-ins', dashboard.data.checkins],
              ].map(([label, count]) => (
                <div key={label} className="rounded-2xl border border-border bg-surface p-5">
                  <p className="text-sm text-muted">{t(String(label))}</p>
                  <p className="mt-3 text-3xl font-extrabold">{Number(count).toLocaleString(locale)}</p>
                </div>
              ))}
            </div>
            <p className="my-3 text-xs text-muted">
              {t(
                'Período: eventos pela data de início, usuários pela data de cadastro e check-ins pela data de realização. Locais representam o catálogo atual.',
              )}
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Bars title="Status dos eventos" rows={dashboard.data.statuses} />
              <Bars title="Eventos por cidade" rows={dashboard.data.cities} />
              <Bars title="Eventos por categoria" rows={dashboard.data.categories} />
              <Bars title="Check-ins por dia" rows={dashboard.data.activity} />
            </div>
          </>
        )}

        {tab === 'events' && events.data && (
          <>
            <div className="mt-5 space-y-3">
              {events.data.items.map((event: BoraEvent) => (
                <article
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-destaque">{t(labels[event.status ?? 'published'])}</p>
                    <h2 className="mt-1 break-words font-bold">{event.name}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {event.venue?.name} · {event.venue?.city} · {new Date(event.startsAt).toLocaleString(locale)}
                    </p>
                    <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm">{event.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/event/${event.id}`}>{t('Ver evento')}</Link>
                    </Button>
                    {event.status === 'pending_review' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setReview({ id: event.id, name: event.name, kind: 'event' });
                          moderate.reset();
                          setNote('');
                        }}
                      >
                        {t('Revisar')}
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {!events.data.items.length && <Empty />}
            <Pagination data={events.data} page={page} setPage={setPage} />
          </>
        )}

        {(tab === 'users' || tab === 'business') && users.data && (
          <>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-surface scrollbar-visible">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-background text-xs text-muted">
                  <tr>
                    {['Usuário', 'Cidade', 'Perfil de acesso', 'Situação', 'Cadastro', 'Ações'].map((h) => (
                      <th scope="col" className="px-4 py-4" key={h}>
                        {t(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.data.items.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                        {u.businessName && (
                          <p className={tab === 'business' ? 'mt-1 text-sm font-semibold' : 'mt-1 text-xs text-muted'}>
                            {tab === 'business' && `${t('Estabelecimento')}: `}
                            {u.businessName}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">{u.city ?? '—'}</td>
                      <td className="px-4 py-4">
                        <span className={u.role === 'admin' ? 'text-destaque' : 'text-muted'}>{t(labels[u.role])}</span>
                      </td>
                      <td className="px-4 py-4">
                        {t(u.isActive ? 'Ativa' : 'Suspensa')}
                        <p className="mt-1 text-xs text-muted">
                          {t(u.emailVerified ? 'E-mail verificado' : 'E-mail não verificado')}
                        </p>
                      </td>
                      <td className="px-4 py-4">{new Date(u.createdAt).toLocaleDateString(locale)}</td>
                      <td className="px-4 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (tab === 'business') {
                              setReview({ id: u.id, name: u.businessName ?? u.name, kind: 'business' });
                              moderate.reset();
                              setNote('');
                            } else {
                              setEditing({ ...u });
                              update.reset();
                            }
                          }}
                        >
                          {t(tab === 'business' ? 'Revisar' : 'Editar')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!users.data.items.length && <Empty />}
            <Pagination data={users.data} page={page} setPage={setPage} />
          </>
        )}

        {tab === 'audit' && audit.data && (
          <>
            <div className="mt-5 space-y-3">
              {audit.data.items.map((a) => (
                <article key={a.id} className="rounded-2xl border border-border bg-surface p-4 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>{t(labels[a.action] ?? a.action)}</strong>
                    <time className="text-muted">{new Date(a.createdAt).toLocaleString(locale)}</time>
                  </div>
                  <p className="mt-2 break-all text-xs text-muted">
                    {t('Responsável')}: {a.actorName} · {t('Registro')}: {a.targetName}
                  </p>
                  <AuditDetails changes={a.changes} />
                </article>
              ))}
            </div>
            {!audit.data.items.length && <Empty />}
            <Pagination data={audit.data} page={page} setPage={setPage} />
          </>
        )}

        <BottomSheet
          open={Boolean(editing)}
          onOpenChange={(open) => {
            if (!open && !update.isPending) setEditing(null);
          }}
          title={t('Editar usuário')}
        >
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                update.mutate(editing);
              }}
            >
              <p className="break-all text-sm text-muted">{editing.email}</p>
              <label className="block text-sm">
                {t('Nome')}
                <Input
                  className="mt-1"
                  minLength={2}
                  maxLength={120}
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                {t('Perfil de acesso')}
                <Select
                  className="mt-1"
                  disabled={editing.id === user?.id}
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as AdminUser['role'] })}
                >
                  <option value="user">{t('Usuário')}</option>
                  <option value="admin">{t('Administrador')}</option>
                </Select>
              </label>
              <label className="block text-sm">
                {t('Idioma')}
                <Select
                  className="mt-1"
                  value={editing.language}
                  onChange={(e) => setEditing({ ...editing, language: e.target.value as AdminUser['language'] })}
                >
                  <option value="pt">Português</option>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </Select>
              </label>
              <label className="flex gap-3 text-sm">
                <input
                  type="checkbox"
                  disabled={editing.id === user?.id}
                  checked={editing.isActive}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                />
                {t('Conta ativa')}
              </label>
              <label className="flex gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={editing.showInWhoIsGoing}
                  onChange={(e) => setEditing({ ...editing, showInWhoIsGoing: e.target.checked })}
                />
                {t('Aparecer em Quem vai')}
              </label>
              {editing.role === 'admin' && (
                <p className="text-xs text-muted">
                  {t('Administradores podem revisar eventos e alterar o acesso de outros usuários.')}
                </p>
              )}
              {update.error && (
                <p role="alert" className="text-sm text-destaque">
                  {t(update.error.message)}
                </p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={update.isPending}>
                  {t(update.isPending ? 'Salvando...' : 'Salvar alterações')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={update.isPending}
                  onClick={() => setEditing(null)}
                >
                  {t('Cancelar')}
                </Button>
              </div>
            </form>
          )}
        </BottomSheet>
        <BottomSheet
          open={Boolean(review)}
          onOpenChange={(open) => {
            if (!open && !moderate.isPending) setReview(null);
          }}
          title={t('Revisar submissão')}
        >
          {review && (
            <div className="space-y-4">
              <h3 className="font-bold">{review.name}</h3>
              {review.kind === 'business' && (
                <div className="space-y-2 text-sm">
                  {document.data?.venue && (
                    <div className="rounded-xl border border-border bg-background p-3">
                      <p className="text-xs font-semibold uppercase text-muted">{t('Estabelecimento')}</p>
                      <p className="font-semibold">{document.data.venue.name}</p>
                      <p className="text-xs text-muted">
                        {domainLabel(document.data.venue.category)} · {document.data.venue.address}
                        {document.data.venue.city ? ` · ${document.data.venue.city}` : ''}
                      </p>
                    </div>
                  )}
                  {document.data?.cnpj && <p>CNPJ {formatCnpj(document.data.cnpj)}</p>}
                  {(document.data?.aiNote ?? document.data?.note) && (
                    <div className="rounded-xl border border-destaque/40 bg-background p-3">
                      <p className="text-xs font-semibold uppercase text-destaque">{t('Parecer da IA')}</p>
                      <p className="mt-1 whitespace-pre-line">{document.data.aiNote ?? document.data.note}</p>
                    </div>
                  )}
                  {document.isLoading && <p>{t('Carregando documento...')}</p>}
                  {document.isError && <p role="alert">{t('Não foi possível carregar o documento.')}</p>}
                  {document.data?.document &&
                    /^data:(application\/pdf|image\/(png|jpeg));base64,/.test(document.data.document) && (
                      <a
                        className="inline-block font-semibold text-destaque"
                        href={document.data.document}
                        download={`contrato-${review.id}.${document.data.document.startsWith('data:application/pdf') ? 'pdf' : document.data.document.startsWith('data:image/png') ? 'png' : 'jpg'}`}
                      >
                        {t('Baixar contrato para análise')}
                      </a>
                    )}
                </div>
              )}
              <label className="block text-sm">
                {t('Motivo da decisão')}
                <textarea
                  className="mt-2 w-full rounded-xl border border-border bg-background p-3"
                  rows={4}
                  minLength={3}
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              {moderate.error && (
                <p role="alert" className="text-sm text-destaque">
                  {t(moderate.error.message)}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={
                    moderate.isPending ||
                    note.trim().length < 3 ||
                    (review.kind === 'business' && !document.data?.document)
                  }
                  onClick={() => moderate.mutate('approved')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t('Aprovar')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={moderate.isPending || note.trim().length < 3}
                  onClick={() => moderate.mutate('rejected')}
                >
                  <X className="h-4 w-4" />
                  {t('Rejeitar')}
                </Button>
                <Button size="sm" variant="ghost" disabled={moderate.isPending} onClick={() => setReview(null)}>
                  {t('Cancelar')}
                </Button>
              </div>
            </div>
          )}
        </BottomSheet>
      </div>
    </div>
  );
}

function Empty() {
  const { t } = useI18n();
  return (
    <div className="my-6 flex items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-sm text-muted">
      <Clock3 className="h-5 w-5" />
      {t('Nenhum registro encontrado.')}
    </div>
  );
}

function AuditDetails({ changes }: { changes: Record<string, unknown> }) {
  const { t } = useI18n();
  const fields: Record<string, string> = {
    name: 'Nome',
    role: 'Perfil de acesso',
    language: 'Idioma',
    isActive: 'Conta ativa',
    showInWhoIsGoing: 'Aparecer em Quem vai',
  };
  const format = (field: string, value: unknown) =>
    typeof value === 'boolean'
      ? t(value ? 'Sim' : 'Não')
      : field === 'name'
        ? String(value)
        : t(
            labels[String(value)] ??
              ({ pt: 'Português', es: 'Español', en: 'English' } as Record<string, string>)[String(value)] ??
              String(value),
          );
  const before = changes.before as Record<string, unknown> | undefined;
  const after = changes.after as Record<string, unknown> | undefined;
  return (
    <div className="mt-3 space-y-1 text-sm">
      {after &&
        Object.entries(after)
          .filter(([key, value]) => before?.[key] !== value)
          .map(([key, value]) => (
            <p key={key}>
              <span className="text-muted">{t(fields[key] ?? key)}: </span>
              {format(key, before?.[key])} → <strong>{format(key, value)}</strong>
            </p>
          ))}
      {Boolean(changes.status || changes.decision || changes.role) && (
        <p className="font-semibold">{format('role', changes.status ?? changes.decision ?? changes.role)}</p>
      )}
      {typeof changes.note === 'string' && <p className="whitespace-pre-wrap">{changes.note}</p>}
      {after && Object.entries(after).every(([key, value]) => before?.[key] === value) && (
        <p className="text-muted">{t('Sem alterações')}</p>
      )}
    </div>
  );
}
