/** API de localidades do IBGE (pública, sem chave): fonte única de UFs e municípios. */
const IBGE_LOCALIDADES = 'https://servicodados.ibge.gov.br/api/v1/localidades';

export interface IbgeState {
  sigla: string;
  nome: string;
}

export interface IbgeCity {
  id: number;
  nome: string;
}

async function ibgeFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${IBGE_LOCALIDADES}/${path}`);
  if (!response.ok) throw new Error('Não foi possível carregar as localidades do IBGE.');
  return response.json() as Promise<T>;
}

export const ibgeService = {
  states: () => ibgeFetch<IbgeState[]>('estados?orderBy=nome'),
  cities: (uf: string) => ibgeFetch<IbgeCity[]>(`estados/${uf}/municipios?orderBy=nome`),
};

/** Compara nomes ignorando acento e caixa (o Nominatim nem sempre grafa igual ao IBGE). */
export function sameCityName(a: string, b: string): boolean {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  return normalize(a) === normalize(b);
}

/** Formato salvo em `user.city`, o mesmo do cadastro por CEP: "Cidade - UF". */
export function formatCityWithUf(city: string, uf: string): string {
  return `${city} - ${uf}`;
}

export function parseCityWithUf(value: string | null | undefined): { city: string; uf: string } | null {
  const match = value?.match(/^(.+) - ([A-Z]{2})$/);
  return match ? { city: match[1], uf: match[2] } : null;
}
