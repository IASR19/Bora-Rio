import { QrCode, ScanLine, ShieldCheck } from 'lucide-react';

import { StatusBar } from './SceneChrome';

/** Padrão fixo, decorativo — não é um QR Code válido nem pretende ser. */
const QR_PATTERN = [
  '#######.#.#.#',
  '#.....#.##..#',
  '#.###.#..#.##',
  '#.###.#.##.#.',
  '#.###.#..##.#',
  '#.....#.#.#.#',
  '#######.#.#.#',
  '........##.#.',
  '#.##.##..#..#',
  '.#..#.#.###.#',
  '##.#..####..#',
  '.#.##.#..##.#',
  '##.#.####.#.#',
];

/** Cena 3 — chegou no lugar: check-in pelo QR do estabelecimento. */
export function CheckInScene() {
  return (
    <div className="relative flex h-full flex-col bg-background">
      <StatusBar />

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.18em] text-destaque">
          <ScanLine className="h-[10px] w-[10px]" strokeWidth={2.4} />
          Check-in
        </span>
        <p className="mt-2 text-[11px] font-bold leading-snug">
          Escaneie o QR Code
          <br />
          do estabelecimento
        </p>

        <div className="relative mt-5 rounded-2xl bg-white p-3">
          {/* Cantos do enquadramento, na cor da marca. */}
          <span className="absolute -left-1.5 -top-1.5 h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-energia" />
          <span className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-destaque" />
          <span className="absolute -bottom-1.5 -left-1.5 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-destaque" />
          <span className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-vibe" />

          <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
            {QR_PATTERN.flatMap((row, y) =>
              row.split('').map((cell, x) => (
                <span
                  key={`${y}-${x}`}
                  className={cell === '#' ? 'h-[7px] w-[7px] bg-[#05070d]' : 'h-[7px] w-[7px]'}
                />
              )),
            )}
          </div>
        </div>

        <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface py-2 text-[9px] text-muted">
          <QrCode className="h-[11px] w-[11px]" strokeWidth={2} />
          Inserir código manualmente
        </div>

        <p className="mt-4 flex items-center gap-1 text-[7.5px] text-muted">
          <ShieldCheck className="h-[9px] w-[9px] text-destaque" strokeWidth={2.2} />
          Código válido por 30 segundos
        </p>
      </div>
    </div>
  );
}
