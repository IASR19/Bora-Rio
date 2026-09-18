import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/utils/cn';

const FAQ = [
  {
    q: 'Como funciona o BORA Score?',
    a: 'É um cálculo de compatibilidade entre você e o lugar/evento, baseado em música, tipo de ambiente, faixa etária, distância, preço e suas intenções — não é uma nota de popularidade.',
  },
  {
    q: 'Preciso pagar pra usar o BORA?',
    a: 'Não. O modo gratuito permite descobrir lugares e eventos, confirmar presença e fazer check-in. O BORA Club é opcional.',
  },
  {
    q: 'Como faço check-in num evento?',
    a: 'Na tela do evento, confirme presença em "Eu vou" e, ao chegar no local, escaneie o QR Code exibido pelo estabelecimento.',
  },
  {
    q: 'Quem vê que eu confirmei presença?',
    a: 'Só quem também confirmou ou está interessado no mesmo evento, e apenas se você deixar "Aparecer em Quem Vai" ativado nas Configurações.',
  },
  {
    q: 'Como excluo minha conta?',
    a: 'Vá em Perfil → Segurança → Excluir conta.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold"
      >
        {q}
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && <p className="px-4 pb-4 text-sm text-muted">{a}</p>}
    </div>
  );
}

export function Support() {
  const navigate = useNavigate();

  return (
    <div className="bg-background px-5 pt-6">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="mt-4 text-2xl font-extrabold">Ajuda e suporte</h1>

      <div className="mt-6 space-y-2">
        {FAQ.map(({ q, a }) => (
          <FaqItem key={q} q={q} a={a} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4 text-center text-sm text-muted">
        Canal direto de suporte (WhatsApp/e-mail) ainda não configurado — assim que houver um contato oficial, ele
        aparece aqui.
      </div>
    </div>
  );
}
