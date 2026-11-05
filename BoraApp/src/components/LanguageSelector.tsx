import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useI18n, type Language } from '@/i18n';
import { usersService } from '@/services/users.service';

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();
  const { user, refreshUser } = useAuth();
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const change = async (value: Language) => {
    setLanguage(value);
    setError(false);
    if (!user) return;
    setSaving(true);
    try {
      await usersService.updateMe({ language: value });
      await refreshUser();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="border-b border-border bg-background px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-2 text-xs">
        <Globe aria-hidden="true" className="h-4 w-4 text-muted" />
        <label htmlFor="app-language">{t('Idioma')}</label>
        <select
          id="app-language"
          value={language}
          disabled={saving}
          onChange={(e) => void change(e.target.value as Language)}
          className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
        >
          <option value="pt">Português</option>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
        {error && (
          <span role="alert" className="text-destaque">
            {t('Idioma salvo neste dispositivo. Não foi possível sincronizar a conta.')}
          </span>
        )}
      </div>
    </div>
  );
}
