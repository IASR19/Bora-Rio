import { cn } from '@/utils/cn';

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-bora-gradient text-white shadow-glow',
        className,
      )}
    >
      <span className="text-lg font-extrabold leading-none">{score}</span>
      <span className="mt-0.5 text-[7px] font-bold uppercase tracking-wide leading-none">Score</span>
    </div>
  );
}
