import { Navigate, Route, Routes } from 'react-router-dom';

import { MainLayout } from './components/MainLayout';
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
import { CompleteProfile } from './pages/auth/CompleteProfile';
import { Events } from './pages/events/Events';
import { Explore } from './pages/explore/Explore';
import { Home } from './pages/home/Home';
import { HowItWorks } from './pages/onboarding/HowItWorks';
import { Permissions } from './pages/onboarding/Permissions';
import { Splash } from './pages/onboarding/Splash';
import { Welcome } from './pages/onboarding/Welcome';
import { Profile } from './pages/profile/Profile';
import { BoraClub } from './pages/subscription/BoraClub';
import { VenueDetail } from './pages/venue/VenueDetail';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/** Idade, telefone e cidade são obrigatórios — sem isso não dá pra calcular
 * BORA Score (distância, restrição de idade) nem mostrar "perto de você". */
function isProfileComplete(user: { birthDate: string | null; phone: string | null; city: string | null }) {
  return Boolean(user.birthDate && user.phone && user.city);
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isProfileComplete(user)) return <Navigate to="/complete-profile" replace />;
  return <MainLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
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
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/bora" element={<BoraQuickActions />} />
      <Route path="/venue/:id" element={<VenueDetail />} />
      <Route path="/checkin/:eventId" element={<CheckIn />} />
      <Route path="/checkin/:eventId/confirmed" element={<CheckInConfirmed />} />
      <Route path="/deu-bora/:eventId" element={<DeuBora />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
