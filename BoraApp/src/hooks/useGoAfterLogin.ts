import { useNavigate } from 'react-router-dom';

import type { User } from '@/types/domain';
import { takePendingCheckin } from '@/utils/pendingCheckin';
import { isProfileComplete } from '@/utils/profile';

/** Para onde levar a pessoa depois de entrar: área do comércio, check-in pendente, completar
 * cadastro (ex.: CPF de quem veio pelo Google) ou a home. */
export function useGoAfterLogin() {
  const navigate = useNavigate();
  return (user: User) => {
    if (!user.emailVerified) {
      navigate('/verification', { replace: true });
      return;
    }
    if (user.accountType === 'business') {
      navigate('/business', { replace: true });
      return;
    }
    const pending = takePendingCheckin();
    if (pending) {
      navigate(pending, { replace: true });
      return;
    }
    navigate(isProfileComplete(user) ? '/home' : '/complete-profile', { replace: true });
  };
}
