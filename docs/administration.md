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
- Revisão de cadastros comerciais pendentes, download protegido do contrato e aprovação/rejeição. A aprovação publica os eventos comerciais pendentes daquele criador, conforme o fluxo já existente.
- Edição de nome, role, idioma, visibilidade em Quem vai e situação ativa/suspensa. E-mail, senha, documentos e verificação de identidade não são editados pela tabela.
- Suspensão bloqueia login, tokens de acesso existentes e refresh. Reativação restaura o acesso. Um administrador não pode remover o próprio role nem suspender a própria conta. Alterações administrativas são serializadas e a permissão é revalidada dentro da transação.
- Histórico paginado com ação, responsável, registro, data e alterações.

## Semântica dos indicadores

O período filtra eventos pela data de início, usuários pela data de cadastro e check-ins pela data de realização **em eventos que também atendam aos filtros de eventos**. As datas usam o fuso de São Paulo. Locais representam o catálogo atual e respeitam localização/categoria, não período nem status de eventos. O gráfico diário mostra até 30 dias com atividade; cidades mostram as dez maiores contagens.

Região e UF de locais usam `catalogMetadata.state` ou o sufixo `Cidade - UF`. Nos usuários, usam o sufixo da cidade, já adotado pelo cadastro. Registros antigos sem UF continuam nas consultas gerais e por cidade, mas não recebem região por suposição. Para corrigir a localização de uma conta, use a seleção de estado/cidade no perfil.

A publicação automática por verificação ou três check-ins reais foi preservada. Eventos rejeitados não aparecem nas buscas públicas, inclusive ao buscar pelo local. A tela Meus eventos continua permitindo que o criador acompanhe o status dos próprios eventos.

O link direto de um evento rejeitado permite apenas consulta: mostra o status correto e oculta as ações de participação. A API bloqueia interesse, confirmação, novos check-ins, emissão de QR, acesso à sala e resgate de benefícios. Confirmação e check-in usam uma transação com trava do evento compartilhada com a moderação, impedindo gravações durante uma rejeição; um QR emitido antes da decisão também é recusado.

## Idiomas

O seletor global oferece português, espanhol e inglês, inclusive no cadastro e no painel. A preferência inicial usa o navegador e depois o valor salvo no dispositivo; ao entrar em uma conta, prevalece a preferência salva nela. A troca não remonta as páginas nem apaga os campos preenchidos. Falhas de sincronização são informadas e a escolha continua salva no dispositivo.

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
