import { getLocale, t, useI18n } from "@/i18n";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { businessService } from "@/services/business.service";
import { Chip } from "@/shared/ui/Chip";

import { EventStatusBadge } from "./EventStatusBadge";

const PERIODS = [7, 30, 90];

const shortDate = (iso: string) => iso.slice(5).split("-").reverse().join("/");

export function BusinessDashboard() {
  useI18n();
  const locale = getLocale();
  const [days, setDays] = useState(30);
  const query = useQuery({
    queryKey: ["business", "dashboard", days],
    queryFn: () => businessService.dashboard(days),
  });
  const data = query.data;

  const tiles = data
    ? [
        ["Eventos", data.totals.events],
        ["Próximos", data.totals.upcomingEvents],
        ["Interessados", data.totals.interested],
        ["Confirmados", data.totals.confirmed],
        ["Check-ins", data.totals.checkins],
        ["Brindes resgatados", data.totals.giftRedemptions],
        ["Leituras de QR de promoções", data.totals.promoScans ?? 0],
        ["Cadastros por QR", data.totals.promoSignups ?? 0],
      ]
    : [];
  const chartTotal =
    data?.checkinsByDay.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const max = Math.max(1, ...(data?.checkinsByDay.map((d) => d.count) ?? []));

  return (
    <div className="px-5 pt-8">
      {data && (
        <header>
          <h1 className="text-2xl font-extrabold">{data.venue.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0" /> {data.venue.address}
          </p>
        </header>
      )}

      {query.isLoading && (
        <p className="py-8 text-muted">{t("Carregando...")}</p>
      )}
      {query.isError && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-destaque p-4 text-sm"
        >
          {query.error.message}
        </div>
      )}

      {data && (
        <>
          <h2 className="mt-5 mb-3 font-bold">{t("Desde o início")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {tiles.map(([label, count]) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <p className="text-xs text-muted">{t(String(label))}</p>
                <p className="mt-2 text-2xl font-extrabold">
                  {Number(count).toLocaleString(locale)}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-5 rounded-2xl border border-border bg-surface p-4">
            <h2 className="mb-3 font-bold">
              {t("Check-ins nos últimos {days} dias", { days })}
            </h2>
            <div
              className="mb-4 flex gap-2"
              role="group"
              aria-label={t("Período do gráfico")}
            >
              {PERIODS.map((p) => (
                <Chip
                  key={p}
                  selected={days === p}
                  aria-pressed={days === p}
                  onClick={() => setDays(p)}
                >
                  {t("{days} dias", { days: p })}
                </Chip>
              ))}
            </div>
            {chartTotal === 0 ? (
              <p className="text-sm text-muted">
                {t("Nenhum check-in no período.")}
              </p>
            ) : (
              <>
                <div className="flex h-32 items-end gap-[2px]">
                  {data.checkinsByDay.map((d) => (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.count}`}
                      className="min-w-[2px] flex-1 rounded-t bg-bora-gradient"
                      style={{
                        height: `${Math.max(3, (d.count / max) * 100)}%`,
                        opacity: d.count ? 1 : 0.25,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted">
                  <span>{shortDate(data.checkinsByDay[0].date)}</span>
                  <span>
                    {t("Máx.")}: {max}
                  </span>
                  <span>
                    {shortDate(
                      data.checkinsByDay[data.checkinsByDay.length - 1].date,
                    )}
                  </span>
                </div>
              </>
            )}
          </section>

          <section className="mt-5">
            <h2 className="mb-3 font-bold">{t("Eventos")}</h2>
            {data.events.length === 0 && (
              <p className="text-sm text-muted">{t("Nenhum evento ainda.")}</p>
            )}
            <div className="space-y-3">
              {data.events.map((e) => (
                <Link
                  key={e.id}
                  to={`/business/events/${e.id}`}
                  className="block rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{e.name}</p>
                    <EventStatusBadge status={e.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {new Date(e.startsAt).toLocaleString(locale)}
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      ["Interessados", e.interested],
                      ["Confirmados", e.confirmed],
                      ["Check-ins", e.checkins],
                      ["Brindes", e.giftRedemptions],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <p className="text-base font-bold">{v}</p>
                        <p className="text-muted">{t(String(l))}</p>
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
