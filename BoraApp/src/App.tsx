import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { ImpersonationBanner } from './components/ImpersonationBanner';
import { MainLayout } from './components/MainLayout';
import { isProfileComplete, needsEmailVerification } from './utils/profile';
import { isPublicAppRoute, PublicLanguageCorner } from './components/LanguageSelector';
import { Admin } from './pages/admin/Admin';
import { useAuth } from './context/AuthContext';
import { AgeDistanceStep } from './pages/preferences/AgeDistanceStep';
import { BudgetStep } from './pages/preferences/BudgetStep';
import { IntentionsStep } from './pages/preferences/IntentionsStep';
import { MusicStep } from './pages/preferences/MusicStep';
import { VenueTypesStep } from './pages/preferences/VenueTypesStep';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Verification } from './pages/auth/Verification';
import { BoraQuickActions } from './pages/bora/BoraQuickActions';
import { CheckIn } from './pages/checkin/CheckIn';
import { CheckInConfirmed } from './pages/checkin/CheckInConfirmed';
import { DeuBora } from './pages/checkin/DeuBora';
import { DirectChat } from './pages/chat/DirectChat';
import { CompleteProfile } from './pages/auth/CompleteProfile';
import { CreateEvent } from './pages/events/CreateEvent';
import { Events } from './pages/events/Events';
import { Explore } from './pages/explore/Explore';
import { Home } from './pages/home/Home';
import { Landing } from './pages/landing/Landing';
import { Matches } from './pages/matches/Matches';
import { Notifications } from './pages/notifications/Notifications';
import { HowItWorks } from './pages/onboarding/HowItWorks';
import { Permissions } from './pages/onboarding/Permissions';
import { Splash } from './pages/onboarding/Splash';
import { Welcome } from './pages/onboarding/Welcome';
import { EventDetail } from './pages/event/EventDetail';
import { EditProfile } from './pages/profile/EditProfile';
import { Payments } from './pages/profile/Payments';
import { Profile } from './pages/profile/Profile';
import { Security } from './pages/profile/Security';
import { Settings } from './pages/profile/Settings';
import { Support } from './pages/profile/Support';
import { BoraClub } from './pages/subscription/BoraClub';
import { VenueDetail } from './pages/venue/VenueDetail';
import { BusinessAccount } from './pages/business/BusinessAccount';
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { BusinessEventDetail } from './pages/business/BusinessEventDetail';
import { BusinessEvents } from './pages/business/BusinessEvents';
import { BusinessLayout } from './pages/business/BusinessLayout';
import { BusinessQr } from './pages/business/BusinessQr';
import { Promo } from './pages/promo/Promo';
import { Scan } from './pages/scan/Scan';
import { PromoQrArt } from './pages/business/PromoQrArt';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (needsEmailVerification(user)) return <Navigate to="/verification" replace />;
  if (user.accountType === 'business') return <Navigate to="/business" replace />;
  return children;
}

/** Idade, telefone e cidade são obrigatórios — sem isso não dá pra calcular
 * BORA Score (distância, restrição de idade) nem mostrar "perto de você". */
function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (needsEmailVerification(user)) return <Navigate to="/verification" replace />;
  if (user.accountType === 'business') return <Navigate to="/business" replace />;
  if (!isProfileComplete(user)) return <Navigate to="/complete-profile" replace />;
  return <MainLayout />;
}

export default function App() {
  const { pathname } = useLocation();

  return (
    <>
      {/* O idioma fica no cabeçalho da landing e do admin, em Configurações (usuário) e em
       * Conta (comércio). Só as telas de entrada, que não têm cabeçalho, usam o canto flutuante. */}
      {isPublicAppRoute(pathname) && <PublicLanguageCorner />}
      <ImpersonationBanner />
      <Routes>
        <Route path="/admin" element={<Admin />} />
        {/* "/" é a vitrine pública (landing). O app propriamente dito começa em "/app",
         * que é também o start_url do PWA — quem já instalou continua abrindo no app,
         * não na página de marketing. */}
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification" element={<Verification />} />
        <Route
          path="/complete-profile"
          element={
            <RequireAuth>
              <CompleteProfile />
            </RequireAuth>
          }
        />

        <Route path="/preferences/intentions" element={<IntentionsStep />} />
        <Route path="/preferences/music" element={<MusicStep />} />
        <Route path="/preferences/venue-types" element={<VenueTypesStep />} />
        <Route path="/preferences/age-distance" element={<AgeDistanceStep />} />
        <Route path="/preferences/budget" element={<BudgetStep />} />
        <Route path="/subscription" element={<BoraClub />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/create" element={<Navigate to="/business/events/new" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/settings" element={<Settings />} />
          <Route path="/profile/security" element={<Security />} />
          <Route path="/profile/support" element={<Support />} />
          <Route path="/profile/payments" element={<Payments />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/chat/:conversationId" element={<DirectChat />} />
        </Route>

        <Route path="/business" element={<BusinessLayout />}>
          <Route index element={<BusinessDashboard />} />
          <Route path="events" element={<BusinessEvents />} />
          <Route path="events/new" element={<CreateEvent />} />
          <Route path="events/:id" element={<BusinessEventDetail />} />
          <Route path="events/:id/qr" element={<BusinessQr />} />
          <Route path="events/:id/promotions/:rewardId/qr" element={<PromoQrArt />} />
          <Route path="account" element={<BusinessAccount />} />
        </Route>

        <Route path="/bora" element={<BoraQuickActions />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/p/:code" element={<Promo />} />
        <Route path="/venue/:id" element={<VenueDetail />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/checkin/:eventId" element={<CheckIn />} />
        <Route path="/checkin/:eventId/confirmed" element={<CheckInConfirmed />} />
        <Route path="/deu-bora/:eventId" element={<DeuBora />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
