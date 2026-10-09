/** Raios de busca; 0 = qualquer distância (mesma convenção da API). */
export const DISTANCE_OPTIONS = [
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 0, label: 'Qualquer distância' },
] as const;
