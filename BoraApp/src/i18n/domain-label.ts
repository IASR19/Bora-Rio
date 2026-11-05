import { t } from './index';

const labels: Record<string, string> = {
  festa: 'Festas',
  bar: 'Bares',
  samba: 'Samba',
  beach_club: 'Beach clubs',
  rooftop: 'Rooftops',
  praia: 'Praias',
  ponto_turistico: 'Pontos turísticos',
  cultura: 'Cultura',
  parque: 'Parques',
  aventura: 'Aventura',
  restaurante: 'Restaurantes',
  lounge: 'Lounges',
  eletronico: 'Eletrônico',
  outros: 'Outros',
  economico: 'Econômico',
  medio: 'Médio',
  premium: 'Premium',
  sofisticado: 'Sofisticado',
  casual: 'Casual',
  animado: 'Animado',
  tranquilo: 'Tranquilo',
  balada: 'Balada',
};
export const domainLabel = (value: string) => t(labels[value] ?? value.charAt(0).toUpperCase() + value.slice(1));
