/**
 * Todo o conteúdo editorial da landing page em um lugar só: copy, passos, lugares,
 * benefícios e FAQ. Separado dos componentes de propósito — ajustar uma frase, um
 * preço ou uma pergunta não deve exigir mexer em JSX.
 *
 * Os lugares e eventos abaixo são os mesmos do seed do BoraApi
 * (`BoraApi/src/seeds/seed.ts`) e usam as imagens já versionadas em `public/venues/`.
 */

export interface LandingStep {
  number: string;
  title: string;
  description: string;
}

export interface LandingVenue {
  name: string;
  neighborhood: string;
  event: string;
  tags: string[];
  image: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const HERO = {
  eyebrow: 'Rio de Janeiro',
  headlineStart: 'Mais vida fora',
  headlineAccent: 'do óbvio.',
  subtitle:
    'Bares, festas, rooftops e praia — e, antes de sair de casa, quem já confirmou que vai estar lá.',
  primaryCta: 'Criar minha conta',
  secondaryCta: 'Já tenho conta',
} as const;

export const HERO_STATS = [
  { value: '6', label: 'lugares na primeira leva' },
  { value: '92', label: 'BORA Score do rolê mais quente' },
  { value: 'R$ 4,99', label: 'por mês, se quiser o Club' },
] as const;

/** Os quatro passos do loop do produto, na mesma voz da tela "Como funciona" do app. */
export const STEPS: LandingStep[] = [
  {
    number: '01',
    title: 'Descubra',
    description:
      'Diga o que você quer fazer hoje — beber, dançar, jantar, praia — e veja o que está rolando perto de você, hoje à noite.',
  },
  {
    number: '02',
    title: 'Conecte-se',
    description:
      'Antes de ir, veja quem também confirmou presença. Não é lista de nomes: são pessoas com interesse parecido com o seu.',
  },
  {
    number: '03',
    title: 'Vá',
    description:
      'Confirme presença, chegue no local e faça o check-in pelo QR Code do estabelecimento. Benefício liberado na hora.',
  },
  {
    number: '04',
    title: 'Deu BORA',
    description:
      'Acabou o rolê, você escolhe quem quer rever. Se o interesse for mútuo, a conversa abre — e aí é com vocês.',
  },
];

export const VENUES: LandingVenue[] = [
  {
    name: 'Marea Beach Club',
    neighborhood: 'Barra da Tijuca',
    event: 'Sunset do Marea',
    tags: ['Rooftop', 'Pagode', 'Open bar'],
    image: '/venues/marea-beach-club.webp',
  },
  {
    name: 'Casa Rosa Lapa',
    neighborhood: 'Lapa',
    event: 'Festa X',
    tags: ['Festa', 'Eletrônico'],
    image: '/venues/casa-rosa-lapa.webp',
  },
  {
    name: 'Skyline Rooftop',
    neighborhood: 'Barra da Tijuca',
    event: 'Skyline Night',
    tags: ['Rooftop', 'DJ', 'Premium'],
    image: '/venues/skyline-rooftop.webp',
  },
  {
    name: 'Quartas do Vidigal',
    neighborhood: 'Vidigal',
    event: 'Quartas do Vidigal',
    tags: ['Bar', 'Pagode', 'Econômico'],
    image: '/venues/quartas-do-vidigal.webp',
  },
  {
    name: 'Oro Bistrô',
    neighborhood: 'Leblon',
    event: 'Jantar ao Vivo no Oro',
    tags: ['Restaurante', 'Jazz'],
    image: '/venues/oro-bistro.webp',
  },
  {
    name: 'Bar do Zeca',
    neighborhood: 'Recreio',
    event: 'Sambinha do Zeca',
    tags: ['Praia', 'Samba'],
    image: '/venues/bar-do-zeca.webp',
  },
];

/** Os critérios reais do cálculo do BORA Score (ver `BoraApi` — regras de score). */
export const SCORE_CRITERIA = [
  'O estilo de música que toca lá',
  'O tipo de ambiente que você curte',
  'A faixa etária de quem vai estar',
  'A distância até você',
  'A faixa de preço do lugar',
  'A intenção que você marcou pra hoje',
] as const;

/** Espelha os benefícios da tela de assinatura (`pages/subscription/BoraClub.tsx`). */
export const CLUB = {
  name: 'BORA CLUB',
  price: 4.99,
  period: '/mês',
  benefits: [
    'Participe de experiências',
    'Veja quem vai',
    'Faça check-in',
    'Receba benefícios',
    'Entre em grupos',
    'E muito mais',
  ],
  note: 'Dá pra começar de graça e assinar quando fizer sentido. Pagamentos ainda estão chegando.',
} as const;

/* Cada resposta reflete o comportamento real do código, não a intenção de
 * produto — conferidas contra `BoraApi` (regra de idade, TTL do QR, campos
 * expostos em "Quem vai", pré-requisito de check-in pro resgate e pro Deu
 * BORA). Mudou a regra no backend? Atualize a resposta aqui junto. */
export const FAQ: FaqItem[] = [
  {
    question: 'O BORA é pago?',
    answer:
      'Hoje, não. Criar conta, descobrir lugares, ver quem vai e fazer check-in são gratuitos. O BORA Club, de R$ 4,99 por mês, é o plano de assinatura previsto — os pagamentos ainda não estão integrados, então por enquanto dá pra usar tudo sem pagar.',
  },
  {
    question: 'Em qual cidade funciona?',
    answer:
      'Rio de Janeiro. A primeira leva de lugares vai da Barra e do Recreio ao Vidigal, Leblon e Lapa — bar, festa, rooftop, restaurante e praia, do econômico ao premium.',
  },
  {
    question: 'Tem idade mínima?',
    answer:
      'Sim: 18 anos completos. A data de nascimento é validada no cadastro, e ela também entra no cálculo do BORA Score — é por isso que o app mostra a faixa etária de quem costuma ir a cada lugar.',
  },
  {
    question: 'Como funciona o check-in?',
    answer:
      'O estabelecimento mostra um QR Code que se renova a cada 30 segundos, e você escaneia pelo app. Esse código curto existe pra o check-in valer só pra quem está de fato no local — não dá pra alguém mandar um print pra outra pessoa fazer check-in de casa.',
  },
  {
    question: 'Quem consegue ver que eu vou a um evento?',
    answer:
      'Na lista "Quem vai", as outras pessoas veem só o seu primeiro nome e a sua foto — não o nome completo, nem e-mail, telefone ou a sua localização. E dá pra sair da lista: nas Configurações existe uma chave para não aparecer em "Quem vai", e o app continua funcionando normalmente com ela desligada.',
  },
  {
    question: 'O BORA é um aplicativo de relacionamento?',
    answer:
      'Não. O ponto de partida é sempre o lugar. Depois do evento existe o "Deu BORA", mas ele só aparece entre pessoas que fizeram check-in no mesmo evento, e a conversa só abre se as duas se escolherem. É consequência de ter saído, não o objetivo do app.',
  },
  {
    question: 'E os benefícios dos lugares, como pego?',
    answer:
      'Cada evento pode ter um benefício do estabelecimento, tipo dois drinks até 21h. Ele é resgatado no app depois que você faz o check-in no local — check-in e resgate são coisas separadas, então o benefício não é queimado sem você querer.',
  },
  {
    question: 'Preciso baixar na loja de aplicativos?',
    answer:
      'Não. O BORA abre direto no navegador e pode ser instalado na tela inicial do celular pelo menu do próprio navegador — sem App Store, sem Play Store, sem ocupar espaço de app tradicional.',
  },
];

export const FOOTER = {
  tagline: 'BORA. VIVER MAIS.',
  brandline: 'Onde ir. Com quem ir.',
  finalCtaTitle: 'O mundo acontece fora.',
  finalCtaAccent: 'BORA?',
} as const;
