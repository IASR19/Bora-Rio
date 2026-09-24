/**
 * Diz se a página está sendo aberta de dentro do app instalado (PWA em
 * standalone), e não numa aba comum do navegador.
 *
 * Por que isso existe: o `start_url` do manifesto passou de "/" para "/app",
 * mas quem instalou o BORA *antes* dessa mudança tem a versão antiga do
 * manifesto guardada no celular, e o sistema só a atualiza quando quer. Sem
 * essa trava, essas pessoas abririam o ícone do app e cairiam na landing page
 * de marketing em vez do produto.
 */
export function isInstalledApp() {
  if (typeof window === 'undefined') return false;

  const standalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const minimalUi = window.matchMedia?.('(display-mode: minimal-ui)').matches ?? false;
  // iOS não implementa display-mode; expõe esta flag não-padrão no navigator.
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return standalone || minimalUi || iosStandalone;
}
