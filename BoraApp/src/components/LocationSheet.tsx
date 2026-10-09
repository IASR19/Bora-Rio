import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useCityLocation } from '@/hooks/useCityLocation';
import { usersService } from '@/services/users.service';
import { ApiError } from '@/shared/api/client';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';

import { LocationFields } from './LocationFields';

/** Troca rápida da cidade (e do ponto usado na distância) a partir do cabeçalho da Home.
 * Montado só enquanto aberto, então cada abertura parte da cidade salva. */
export function LocationSheet({ onClose }: { onClose: () => void }) {
  const { user, refreshUser } = useAuth();
  const location = useCityLocation(user);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const resolved = await location.resolve();
      if (!resolved) return;
      const { city, latitude, longitude, geocodeFailed } = resolved;
      await usersService.updateMe({ city, ...(latitude != null && longitude != null ? { latitude, longitude } : {}) });
      await refreshUser();
      if (geocodeFailed) {
        location.setError('Cidade salva, mas não achamos ela no mapa. Use "Usar minha localização atual".');
        return;
      }
      onClose();
    } catch (err) {
      location.setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open onOpenChange={(open) => !open && onClose()} title="Sua localização">
      <div className="space-y-5">
        <LocationFields location={location} />
        {location.error && <p className="text-sm text-destaque">{location.error}</p>}
        <Button size="lg" className="w-full" onClick={handleSave} disabled={saving || location.locating}>
          {saving ? 'Salvando...' : 'Salvar localização'}
        </Button>
      </div>
    </BottomSheet>
  );
}
