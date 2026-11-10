import { getLocale, t, useI18n } from "@/i18n";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, QrCode } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { eventsService } from "@/services/events.service";
import { Button } from "@/shared/ui/Button";

import { EventStatusBadge } from "./EventStatusBadge";
import { PromotionsSection } from "./PromotionsSection";

export function BusinessEventDetail() {
  useI18n();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["business", "event", id],
    queryFn: () => eventsService.getById(id),
  });
  const event = query.data;

  return (
    <div className="px-5 pt-6">
      <button
        onClick={() => navigate("/business/events")}
        className="mb-4 flex items-center gap-1 text-sm text-muted"
      >
        <ArrowLeft className="h-4 w-4" /> {t("Eventos")}
      </button>
      {query.isLoading && <p className="text-muted">{t("Carregando...")}</p>}
      {query.isError && (
        <p className="text-sm text-destaque">{query.error.message}</p>
      )}
      {event && (
        <>
          {event.coverImageUrl && (
            <img
              src={event.coverImageUrl}
              alt=""
              className="mb-4 h-40 w-full rounded-2xl object-cover"
            />
          )}
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-extrabold">{event.name}</h1>
            <EventStatusBadge status={event.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {new Date(event.startsAt).toLocaleString(getLocale())}
            {event.endsAt &&
              ` – ${new Date(event.endsAt).toLocaleString(getLocale())}`}
          </p>
          {event.description && (
            <p className="mt-3 text-sm">{event.description}</p>
          )}
          {event.musicGenres.length > 0 && (
            <p className="mt-2 text-xs text-muted">
              {event.musicGenres.join(" · ")}
            </p>
          )}

          <div className="mt-5 space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate(`/business/events/${event.id}/qr`)}
            >
              <QrCode className="h-5 w-5" /> {t("Mostrar QR de check-in")}
            </Button>
            <Link
              to={`/event/${event.id}`}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-destaque"
            >
              <ExternalLink className="h-4 w-4" /> {t("Ver como cliente")}
            </Link>
          </div>

          <PromotionsSection eventId={event.id} />
        </>
      )}
    </div>
  );
}
