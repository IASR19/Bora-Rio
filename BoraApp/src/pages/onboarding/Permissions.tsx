import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/ui/Button';

export function Permissions() {
  const navigate = useNavigate();

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => navigate('/login'),
        () => navigate('/login'),
      );
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col items-center justify-between bg-background px-6 pb-10 pt-20 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bora-gradient-soft">
          <MapPin className="h-11 w-11 text-destaque" />
        </div>
        <h1 className="mt-8 text-2xl font-extrabold">Ative sua localização</h1>
        <p className="mt-3 max-w-xs text-sm text-muted">
          Para descobrir o que está acontecendo perto de você.
        </p>
      </div>

      <div className="w-full space-y-3">
        <Button size="lg" className="w-full" onClick={requestLocation}>
          Permitir localização
        </Button>
        <Button size="lg" variant="ghost" className="w-full" onClick={() => navigate('/login')}>
          Agora não
        </Button>
      </div>
    </div>
  );
}
