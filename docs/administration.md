# Administração e idiomas

## Arquitetura

- `BoraApp`: React 19, Vite, React Router e React Query; componentes existentes de Tailwind/shadcn e tema BORA.
- `BoraApi`: NestJS 11, TypeORM e PostgreSQL. A autenticação global usa JWT de acesso e cookie HTTP-only de refresh.
- `vercel.json`: entrega conjunta do frontend estático e da API serverless, no mesmo domínio, com `/api` como prefixo.
- `AdminModule`: APIs protegidas por autenticação e consulta do role atual no banco. Não depende de roles embutidos no token nem de esconder botões no frontend.

## Configuração

As migrations devem ser criadas exclusivamente por `npm run migration:generate -- src/migrations/<Nome>`, a partir das entities, com o banco de referência atualizado. `Administration1793830239005` foi gerada dessa forma; não contém alterações das migrations anteriores.

No ambiente de destino, aplique as migrations pelo fluxo existente:

```sh
cd BoraApi
npm run migration:run
```

Cadastre uma conta normalmente. Para atribuir o primeiro administrador, execute no backend com as variáveis do banco correto:

```sh
npm run admin:grant -- email@dominio.com
```

O comando exige uma conta existente e ativa, não cria senha, não altera contas automaticamente e registra a atribuição no histórico. Depois, o painel pode atribuir/remover roles de outras contas. O acesso fica em **Perfil → Painel administrativo**, ou diretamente em `/admin`.

## Funcionalidades

- Indicadores reais de usuários, eventos, locais e check-ins; gráficos por status, cidade, categoria e dia.
- Filtros por região brasileira, UF, cidade, período, categoria e status. Na gestão de usuários, busca por nome/e-mail, role e situação da conta. Listas paginadas no servidor, até 100 registros por página.
- Aprovação/rejeição de eventos em análise com motivo obrigatório. A decisão e o responsável ficam no histórico; decisões concorrentes não sobrescrevem a primeira revisão.
- Revisão de cadastros comerciais pendentes, com os dados do local, o parecer da IA, o download protegido do contrato e aprovação/rejeição. Todo comércio passa por essa revisão. A aprovação marca o local do comércio como verificado, o que o faz aparecer no app, e publica os eventos comerciais pendentes daquele criador.
- Edição de nome, role, idioma, visibilidade em Quem vai e situação ativa/suspensa. E-mail, senha, documentos e verificação de identidade não são editados pela tabela.
- Suspensão bloqueia login, tokens de acesso existentes e refresh. Reativação restaura o acesso. Um administrador não pode remover o próprio role nem suspender a própria conta. Alterações administrativas são serializadas e a permissão é revalidada dentro da transação.
- Histórico paginado com ação, responsável, registro, data e alterações.

## Contas de usuário e de comércio

O tipo da conta (`users.account_type`) é escolhido no cadastro e não muda depois.

- **Usuário** (`user`): usa o app (explorar, interesse, check-in, chat, benefícios). Não cria eventos. CPF obrigatório e único, validado pelo dígito verificador. Contas antigas sem CPF informam o CPF uma única vez em "Completar perfil".
- **Comércio** (`business`): cadastro em `POST /auth/register/business`, com CNPJ, contrato social e dados do local. Cria a conta como `pending` e o local com `owner_user_id` e `verified=false`.
  - **Aprovação:** a IA analisa o contrato contra a Receita, mas o parecer é só consultivo. Nada é aprovado sem um administrador. O parecer fica em `users.business_ai_note` e só aparece no painel admin; o comércio vê apenas o aviso de "em análise" ou a nota da decisão.
  - **Acesso:** usa apenas a área `/business` (painel, eventos, promoções, QR de check-in, conta). As ações de usuário são bloqueadas na API pelo `UserAccountGuard`.
  - **Rejeição:** libera o CNPJ (na conta e no local), para que o dono verdadeiro consiga se cadastrar. O comércio rejeitado reenvia CNPJ e contrato pela própria área.
- **Google:** serve para os dois tipos de conta. Conta já existente sempre entra. Quem entra pelo Google sem cadastro escolhe "Quero curtir eventos" ou "Tenho um estabelecimento", igual ao cadastro por e-mail:
  - o login envia `createAccount: false` a `POST /auth/google`, e a API responde `GOOGLE_ACCOUNT_NOT_FOUND` em vez de criar a conta;
  - usuário: a conta é criada pelo Google e o CPF é pedido em "Completar perfil";
  - comércio: `POST /auth/register/business` recebe `googleIdToken` no lugar de e-mail e senha. O e-mail vem do token verificado pela API, e o resto do fluxo (CNPJ, contrato, local, análise) é o mesmo.
- **Unicidade:** cada CPF e cada CNPJ pertence a uma única conta (o CNPJ, entre contas não excluídas). O telefone pode se repetir entre contas e não é verificado.
- **Eventos:** `POST /events` só aceita comércio aprovado (`BusinessAccountGuard`). O evento é criado sempre no local do próprio comércio e já nasce publicado.
- **Promoções** (`rewards.kind`):
  - `gift`: brinde resgatado no app após o check-in, com quantidade opcional, só dentro do horário `valid_from`–`valid_until` (fuso de São Paulo; pode atravessar a meia-noite). Brinde já resgatado não pode ser apagado.
  - `fixed_price` e `percent_off`: apenas informativas.
  - Somente o comércio dono do local cria, edita e remove promoções.
- **QR de check-in:** gerado somente pelo comércio dono (`GET /checkins/qr/:eventId`, validade de 60 s). O QR contém o link `/checkin/<id>?t=<token>`: o cliente abre com a câmera do celular e o app confirma o check-in.

## Confirmação de e-mail

Toda conta (usuário ou comércio) confirma o e-mail com um código de 6 dígitos antes de usar o app. Quem entra pelo Google já chega confirmado. Contas antigas confirmam no próximo acesso.

- **Fluxo:** a tela `/verification` pede o código (`POST /auth/verification/email/request`) e o confirma (`POST /auth/verification/email/confirm`). Os dois exigem login.
- **Regras:** o código vale 10 minutos. Um novo envio só sai 60 s depois do anterior, e só o código mais recente vale. Cinco tentativas erradas invalidam o código.
- **Envio:** pela API do Resend. Configure no backend (local e Vercel):
  - `RESEND_API_KEY`: chave criada em resend.com → API Keys, com permissão de envio;
  - `MAIL_FROM`: remetente de um domínio verificado no Resend, ex.: `Bora <nao-responda@mail.seudominio.com.br>`.
- **Sem Resend configurado:** em produção o envio falha com aviso na tela. Fora de produção, o código vai no log e na resposta (`devCode`), e o app mostra "Código de teste" no modo de desenvolvimento.
- **Limite:** o bloqueio é feito pelas telas do app. A API ainda não recusa chamadas de contas não confirmadas.

## Semântica dos indicadores

O período filtra eventos pela data de início, usuários pela data de cadastro e check-ins pela data de realização **em eventos que também atendam aos filtros de eventos**. As datas usam o fuso de São Paulo. Locais representam o catálogo atual e respeitam localização/categoria, não período nem status de eventos. O gráfico diário mostra até 30 dias com atividade; cidades mostram as dez maiores contagens.

Região e UF de locais usam `catalogMetadata.state` ou o sufixo `Cidade - UF`. Nos usuários, usam o sufixo da cidade, já adotado pelo cadastro. Registros antigos sem UF continuam nas consultas gerais e por cidade, mas não recebem região por suposição. Para corrigir a localização de uma conta, use a seleção de estado/cidade no perfil.

A publicação automática por verificação ou três check-ins reais foi preservada. Eventos rejeitados não aparecem nas buscas públicas, inclusive ao buscar pelo local. A tela Meus eventos continua permitindo que o criador acompanhe o status dos próprios eventos.

O link direto de um evento rejeitado permite apenas consulta: mostra o status correto e oculta as ações de participação. A API bloqueia interesse, confirmação, novos check-ins, emissão de QR, acesso à sala e resgate de benefícios. Confirmação e check-in usam uma transação com trava do evento compartilhada com a moderação, impedindo gravações durante uma rejeição; um QR emitido antes da decisão também é recusado.

## Idiomas

O seletor oferece português, espanhol e inglês (`components/LanguageSelector.tsx`). Fica no cabeçalho da landing e do painel admin, no canto superior das telas de entrada (boas-vindas, login, cadastro), em **Perfil → Configurações** para usuários e em **Conta** para comércios. A preferência inicial usa o navegador e depois o valor salvo no dispositivo; ao entrar em uma conta, prevalece a preferência salva nela. A troca não remonta as páginas nem apaga os campos preenchidos. Falhas de sincronização são informadas e a escolha continua salva no dispositivo.

`BoraApp/src/i18n` centraliza o dicionário, as traduções de opções de domínio e o locale de datas. Valores enviados à API, rotas, nomes de cidades e conteúdo escrito pelos usuários mantêm seus valores originais. Traduções novas devem ser adicionadas ao dicionário em inglês e espanhol; o texto de origem é português.

Quando o armazenamento local está bloqueado ou cheio, idioma e identificador do dispositivo continuam em memória durante a sessão. Erros da API são normalizados por código/mensagem para textos traduzíveis; mensagens desconhecidas e validações retornadas em lista recebem um texto localizado, sem expor detalhes internos. As validações de idioma, mensagens e armazenamento também rodam no workflow de deploy.

## Verificação

```sh
cd BoraApi
npm run test:admin
npm run test:seed
cd ../BoraApp
npm run test:i18n
npm run check
npm run lint
npm run build
```

Os testes administrativos usam apenas o banco **local** explicitamente configurado, criam fixtures com IDs exclusivos e removem somente essas fixtures. Sem configuração de banco no CI, ou em banco remoto, a suíte de integração é ignorada. A revisão visual requer navegador de teste disponível.
