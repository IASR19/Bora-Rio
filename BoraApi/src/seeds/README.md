# Catálogo real do BORA

O seed padrão contém **55 locais: 49 no Rio de Janeiro e 6 em Santa Rita do Sapucaí (MG)**,
nas dez categorias da curadoria. Pesquisa realizada em **09/10/2026**.

## Aplicar

Com o PostgreSQL de destino configurado no `.env`, execute em `BoraApi`:

```sh
npm run migration:run
npm run seed:dev
```

Em produção isso é automático: a cada push na `main`, o job `migrate` do
`.github/workflows/deploy.yml` roda as migrations e depois o seed, antes do deploy na Vercel.
Para rodar manualmente, após o build:

```sh
npm run migration:run:prod
npm run seed
```

Verificação sem conexão nem escrita no banco:

```sh
npm run seed:check
npm run test:seed
```

O seed atualiza por **nome + cidade**, roda em uma transação e usa um lock do PostgreSQL
para serializar execuções simultâneas. Só reaproveita registros do próprio catálogo (mesmo `slug`)
ou locais legados verificados sem CNPJ, e preserva IDs e relações existentes. Homônimos cadastrados
por usuários (não verificados, ou verificados pelo dono via CNPJ) não são alterados; o catálogo cria
seu próprio registro verificado.

> **O JSON é a fonte da verdade.** Como o seed roda a cada deploy e sobrescreve todos os campos
> dos locais do catálogo, qualquer ajuste feito direto no banco de produção volta ao valor do
> `venues.catalog.json` no deploy seguinte. Para corrigir um local, edite o JSON. Não cria eventos, ingressos, promoções ou benefícios. Não remove registros existentes.

A migration `VenueCatalogMetadata` adiciona `catalog_metadata` (JSONB, nullable) à tabela `venues`.
Os nomes de categorias antigos continuam aceitos; filtros e criação de locais também aceitam as
dez categorias novas. Metadados são retornados junto ao local pela API.

## Dados e fontes

- `venues.catalog.json`: dados utilizados offline pelo seed, sem chamadas externas durante o startup.
- `venues.pending.json`: Vitrinni Lounge Beer (operação atual), Villa/Planetário, Bar da Lapa e Porta Aberta.
  Não entram no catálogo público enquanto a identidade/operação estiver pendente.
- `catalogMetadata.sourceUrls`: páginas consultadas para cada local.
- `catalogMetadata.instagramUrl` e `openingHours`: preenchidos somente quando encontrados nas fontes;
  ausência significa informação pendente, não fechamento do local.
- `catalogMetadata.coordinatesAccuracy`: todos os pins iniciais são **aproximados**, definidos como
  referência geográfica. Não são entradas medidas ou geocodificações verificadas. A aba Local informa
  isso e oferece pesquisa no Google Maps pelo nome/endereço.
- `priceRangeAccuracy`: todas as faixas são estimativas editoriais; não são preços ou ingressos cotados.
- `catalogMetadata.photo`: URL, página de origem, crédito e estado da licença.

São **53 URLs de fotos reais**, com resposta HTTP e decodificação de imagem verificadas e revisão visual.
São referências externas: não são fotos geradas nem cópias hospedadas no BORA. As licenças de
republicação não foram confirmadas (`license: not_confirmed`); os créditos permanecem na origem e a
aba Sobre inclui o link da fonte. Links externos podem mudar. A capa da Praça do Santuário focaliza o
Santuário situado na praça e compartilha essa referência com seu registro. **Praia do Pepê e Quiosques do Pepê** ficam sem capa própria;
não receberam a foto de outro trecho de praia ou estabelecimento.

Fontes principais: [Riotur](https://riotur.rio/), [Orla Rio](https://www.orlario.com.br/), sites dos
estabelecimentos, [Veja Rio](https://vejario.abril.com.br/),
[Visite Santa Rita do Sapucaí](https://www.visitesrs.com.br/) e
[Turismo de Minas Gerais](https://www.minasgerais.com.br/pt/atracoes/santa-rita-do-sapucai/praca-do-santuario).
As URLs específicas ficam em cada registro do JSON.

## Decisões da curadoria

- Bosque Bar fica em `festa` (baladas e casas noturnas).
- Rocco e Elena mantêm o agrupamento de vida noturna pedido pelo sócio. As fontes os descrevem como
  restaurante/bar; isso está registrado em `notes`.
- Clássico Beach Club representa especificamente a **unidade Leme**, evitando misturar endereço e foto
  de unidades diferentes.
- “K8” foi interpretado como **K08 — Praia do Pepê**, identificado pela
  [concessionária Orla Rio](https://www.orlario.com.br/quiosque/k08/), em frente ao nº 890 da Av. do Pepê.
  A interpretação consta nos metadados; não se trata do perfil “K8 Bom D+”.
- Mureta da Urca, região dos bares da Lapa e quiosques do Pepê são referências geográficas coletivas,
  descritas como tal.

Santa Rita: Santuário Santa Rita de Cássia, Praça do Santuário, Museu Histórico Delfim Moreira,
Galeria Aberta de Arte Urbana, Mercado Municipal Benedito Pereira dos Reis e campus do Inatel.
Visitas ao Inatel dependem de agendamento.

## Atualizar o catálogo

Edite os registros de `venues.catalog.json` após conferir as fontes de cada local. Revise visualmente
as novas fotos e mantenha sua origem nos metadados. Execute `npm run seed:check` e `npm run test:seed`
antes de aplicar. Os scripts e snapshots utilizados na pesquisa inicial são materiais locais,
ignorados pelo Git; não são dependências do seed nem do aplicativo.
