import { t, useI18n } from "@/i18n";
import { useQuery } from "@tanstack/react-query";
import { Clock, XCircle } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { businessService } from "@/services/business.service";
import { formatCnpj } from "@/utils/businessContract";
import { BusinessVerificationCard } from "@/pages/events/BusinessVerificationCard";

import { BusinessBottomNav } from "./BusinessBottomNav";

export const businessMeKey = ["business", "me"] as const;

export function useBusinessMe() {
  const { user } = useAuth();
  return useQuery({
    queryKey: businessMeKey,
    queryFn: businessService.me,
    enabled: user?.accountType === "business",
  });
}

function StatusScreen({
  status,
  note,
  venueName,
}: {
  status: string | null;
  note: string | null;
  venueName?: string;
}) {
  useI18n();
  const { user } = useAuth();
  const rejected = status === "rejected" || status === null;
  return (
    <div className="px-5 pt-10">
      <div className="flex flex-col items-center text-center">
        {rejected ? (
          <XCircle className="h-12 w-12 text-destaque" />
        ) : (
          <Clock className="h-12 w-12 text-muted" />
        )}
        <h1 className="mt-4 text-2xl font-extrabold">
          {rejected ? t("Cadastro não aprovado") : t("Cadastro em análise")}
        </h1>
        {venueName && <p className="mt-2 font-semibold">{venueName}</p>}
        {user?.businessCnpj && (
          <p className="text-sm text-muted">
            CNPJ {formatCnpj(user.businessCnpj)}
          </p>
        )}
      </div>
      <p className="mt-5 text-sm text-muted">
        {rejected
          ? t(
              "Seu cadastro não foi aprovado. Veja o motivo abaixo e reenvie os dados.",
            )
          : t(
              "Um administrador está revisando o seu cadastro. Assim que for aprovado, você poderá criar eventos e promoções.",
            )}
      </p>
      {note && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase text-muted">
            {t(rejected ? "Motivo" : "Observação")}
          </p>
          {note}
        </div>
      )}
      {rejected && <BusinessVerificationCard />}
    </div>
  );
}

export function BusinessLayout() {
  useI18n();
  const { user, loading } = useAuth();
  const location = useLocation();
  const me = useBusinessMe();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verification" replace />;
  if (user.accountType !== "business") return <Navigate to="/home" replace />;

  const onAccount = location.pathname.startsWith("/business/account");
  const approved = me.data?.status === "approved";

  let content;
  if (onAccount || approved) {
    content = <Outlet />;
  } else if (me.isLoading) {
    content = (
      <p className="px-5 pt-10 text-center text-muted">{t("Carregando...")}</p>
    );
  } else if (me.isError) {
    content = (
      <div className="px-5 pt-10 text-center">
        <p className="text-sm text-destaque">
          {t("Não foi possível carregar os dados.")}
        </p>
        <button
          className="mt-3 text-sm font-semibold text-destaque"
          onClick={() => void me.refetch()}
        >
          {t("Tentar novamente")}
        </button>
      </div>
    );
  } else {
    content = (
      <StatusScreen
        status={me.data?.status ?? null}
        note={me.data?.note ?? null}
        venueName={me.data?.venue?.name}
      />
    );
  }

  return (
    <div className="app-shell bg-background">
      <div className="pb-24">{content}</div>
      <BusinessBottomNav />
    </div>
  );
}
