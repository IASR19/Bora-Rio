import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

import { googleClientId } from '@/config/featureFlags';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/shared/ui/Button';

export function GoogleSignInButton({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const { loginWithGoogle } = useAuth();

  if (!googleClientId) {
    return (
      <Button
        variant="outline"
        className="w-full"
        type="button"
        disabled
        title="Configure VITE_GOOGLE_CLIENT_ID para habilitar o login com Google"
      >
        Continuar com Google
      </Button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex justify-center overflow-hidden rounded-full [&>div]:w-full [&_iframe]:!w-full">
        <GoogleLogin
          theme="filled_black"
          shape="pill"
          size="large"
          text="continue_with"
          onSuccess={async (credentialResponse) => {
            if (!credentialResponse.credential) {
              onError('Não foi possível continuar com o Google.');
              return;
            }
            try {
              await loginWithGoogle(credentialResponse.credential);
              onSuccess();
            } catch {
              onError('Não foi possível continuar com o Google.');
            }
          }}
          onError={() => onError('Não foi possível continuar com o Google.')}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
