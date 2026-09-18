# BORA — Onde ir. Com quem ir.

Aplicativo de descoberta social e experiências presenciais. Monorepo com backend (NestJS + TypeORM +
PostgreSQL) e frontend (React + Vite + PWA), seguindo o padrão arquitetural de referência (etapa
inicial/MVP: shadcn/Tailwind, sem Storybook/Cypress/Orval/i18n).

## Estrutura

```
Bora-Rio/
├── BoraApi/      # Backend — NestJS + TypeORM + PostgreSQL
├── BoraApp/      # Frontend — React + Vite + PWA (shadcn/ui + Tailwind)
└── escopo/       # Documento de escopo e identidade visual (não versionado)
```

## Primeiro setup

### Backend

```bash
cd BoraApi
npm install
cp env.example .env   # edite com as credenciais do seu Postgres local
npm run migration:generate -- src/migrations/InitialSchema
npm run migration:run
npm run seed:dev
npm run start:dev
```

API em `http://localhost:3000/api`, Swagger em `http://localhost:3000/api/docs`.

### Frontend

```bash
cd BoraApp
npm install
cp env.example .env   # já aponta para a API local
npm run dev
```

App em `http://localhost:5173`.

## Identidade visual

- Fundo `#0B0F1A`, superfície `#1B2233`
- Gradiente de marca: `#FF8A00 → #FF2D95 → #7A2BFF`
- Tipografia: **Sora**
- Estética: nightlife premium, tecnológica e social — nunca genérica/corporativa

## Loop principal do produto

Descobrir → Escolher → Confirmar → Ir → Check-in → Experimentar → Conectar → Voltar

O indicador principal do produto é **check-ins BORA por semana**.

## Status desta primeira entrega

Implementado (vertical slice do fluxo principal):

- Onboarding completo (Splash → Boas-vindas → Como funciona → Permissões)
- Auth por e-mail/senha + verificação de telefone por código (login social com
  Google/Apple ainda como placeholder de UI)
- Preferências (intenções, música, ambiente, idade/distância, orçamento)
- BORA Club (tela de assinatura, sem gateway de pagamento integrado)
- Home, Explorar (lista + filtros; mapa ainda placeholder), página do
  lugar/evento com abas (Sobre, Quem vai, Benefícios, Local)
- BORA Score calculado por regras (music/venueType/age/distance/price/intent)
- Check-in com QR dinâmico assinado (JWT de curta duração) e distinção
  check-in ≠ resgate de benefício
- Deu BORA (UI de seleção pós-evento; ainda sem persistência de match mútuo)
- Meus Eventos, Perfil

Deixado para as próximas iterações (ver `escopo/escopo.md` #61 e módulos futuros):

- BORA Room (chat do evento)
- Persistência de match mútuo do Deu BORA + chat
- Mapa real (Explorar) e scanner de QR com câmera
- Login social (Google/Apple) e pagamentos (BORA Club)
- Painel web do estabelecimento (BORA Business)
- Notificações push
