import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '@/assets/logo.png';
import { useAuth } from '@/context/AuthContext';

export function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      navigate(user ? '/home' : '/welcome', { replace: true });
    }, 1400);
    return () => clearTimeout(timer);
  }, [loading, user, navigate]);

  return (
    <div className="app-shell flex min-h-dvh flex-col items-center justify-center bg-background">
      <img src={logo} alt="BORA" className="h-28 w-28 animate-pulse drop-shadow-[0_0_40px_rgba(255,45,149,0.45)]" />
      <div className="mt-6 text-center">
        <p className="text-2xl font-extrabold tracking-wide">BORA</p>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted">Onde ir. Com quem ir.</p>
      </div>
    </div>
  );
}
