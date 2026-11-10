/** Lê nome e e-mail do ID token do Google só para mostrar na tela. Quem confia no token é a API,
 * que verifica a assinatura. */
export function readGoogleCredential(credential: string): { email?: string; name?: string } {
  try {
    const base64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as { email?: string; name?: string };
    return { email: payload.email, name: payload.name };
  } catch {
    return {};
  }
}
