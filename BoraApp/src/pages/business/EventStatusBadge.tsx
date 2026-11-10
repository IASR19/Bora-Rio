import { t, useI18n } from "@/i18n";

const LABELS: Record<string, string> = {
  published: "Publicado",
  pending_review: "Em análise",
  rejected: "Rejeitado",
};

export function EventStatusBadge({ status }: { status?: string }) {
  useI18n();
  const s = status ?? "published";
  const tone =
    s === "published"
      ? "bg-green-500/15 text-green-400"
      : s === "rejected"
        ? "bg-destaque/15 text-destaque"
        : "bg-surface-alt text-muted";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}
    >
      {t(LABELS[s] ?? s)}
    </span>
  );
}
