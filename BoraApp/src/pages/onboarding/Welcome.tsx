import { useNavigate } from 'react-router-dom';

import logo from '@/assets/logo.png';
import { Button } from '@/shared/ui/Button';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="app-shell flex min-h-dvh flex-col justify-between bg-background px-6 pb-10 pt-16">
      <div>
        <img src={logo} alt="BORA" className="h-16 w-16" />
        <h1 className="mt-10 text-4xl font-extrabold leading-tight">
          Descubra
          <br />
          lugares <span className="gradient-text">incríveis.</span>
        </h1>
        <p className="mt-4 text-base text-muted">Conheça pessoas. Encontre experiências. Viva mais.</p>
      </div>

      <Button size="lg" className="w-full" onClick={() => navigate('/how-it-works')}>
        Continuar
      </Button>
    </div>
  );
}
