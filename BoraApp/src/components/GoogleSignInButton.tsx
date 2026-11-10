import { t, useI18n } from '@/i18n';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

import { googleClientId } from '@/config/featureFlags';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/shared/api/client';
import type { User } from '@/types/domain';
import { Button } from '@/shared/ui/Button';

/**
 * Conta existente sempre entra (`onSuccess`). Para quem ainda não tem conta:
 * - com `onAccountNotFound`, nada é criado e o token volta para a tela decidir o tipo de conta;
 * - sem ele, cria conta de usuário (cadastro de quem já escolheu "Quero curtir eventos").
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  onAccountNotFound,
  text = 'continue_with',
}: {
  onSuccess: (user: User) => void;
  onError: (message: string) => void;
  onAccountNotFound?: (credential: string) => void;
  text?: 'continue_with' | 'signup_with';
}) {
  const { language } = useI18n();
  const { loginWithGoogle } = useAuth();

  if (!googleClientId) {
    return (
      <Button
        variant="outline"
        className="w-full"
        type="button"
        disabled
        title={t('Configure VITE_GOOGLE_CLIENT_ID para habilitar o login com Google')}
      >
        {' '}
        {t('Continuar com Google')}{' '}
      </Button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId} locale={language} key={language}>
      <div className="flex justify-center overflow-hidden rounded-full [&>div]:w-full [&_iframe]:!w-full">
        <GoogleLogin
          theme="filled_black"
          shape="pill"
          size="large"
          text={text}
          onSuccess={async ({ credential }) => {
            if (!credential) {
              onError('Não foi possível continuar com o Google.');
              return;
            }
            try {
              const loggedUser = await loginWithGoogle(credential, { createAccount: !onAccountNotFound });
              onSuccess(loggedUser);
            } catch (err) {
              if (onAccountNotFound && err instanceof ApiError && err.errorCode === 'GOOGLE_ACCOUNT_NOT_FOUND') {
                onAccountNotFound(credential);
                return;
              }
              onError('Não foi possível continuar com o Google.');
            }
          }}
          onError={() => onError('Não foi possível continuar com o Google.')}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
