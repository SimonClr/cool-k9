import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute, Login, ProtectedRoute } from '@/app/features/auth';
import { LEGAL_ROUTES } from '@/app/features/legal';
import { Layout } from '@/app/layout';
import { Loader2 } from 'lucide-react';

const SessionsList = lazy(() =>
  import('./features/sessions/SessionsList').then(m => ({ default: m.SessionsList }))
);
const Pricing = lazy(() => import('./features/admin/Pricing').then(m => ({ default: m.Pricing })));
const Register = lazy(() =>
  import('./features/auth/Register').then(m => ({ default: m.Register }))
);
const ProfilePage = lazy(() =>
  import('./features/profile/ProfilePage').then(m => ({ default: m.ProfilePage }))
);
const SessionFormPage = lazy(() =>
  import('./features/sessions/SessionFormPage').then(m => ({ default: m.SessionFormPage }))
);
const PrivacyPolicy = lazy(() =>
  import('./features/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy }))
);
const TermsOfService = lazy(() =>
  import('./features/legal/TermsOfService').then(m => ({ default: m.TermsOfService }))
);
const LegalNotice = lazy(() =>
  import('./features/legal/LegalNotice').then(m => ({ default: m.LegalNotice }))
);

function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/register"
        element={
          <Suspense fallback={<PageLoader />}>
            <Register />
          </Suspense>
        }
      />

      {/* Legal documents stay reachable while signed out. */}
      <Route
        path={LEGAL_ROUTES.privacy}
        element={
          <Suspense fallback={<PageLoader />}>
            <PrivacyPolicy />
          </Suspense>
        }
      />
      <Route
        path={LEGAL_ROUTES.terms}
        element={
          <Suspense fallback={<PageLoader />}>
            <TermsOfService />
          </Suspense>
        }
      />
      <Route
        path={LEGAL_ROUTES.notice}
        element={
          <Suspense fallback={<PageLoader />}>
            <LegalNotice />
          </Suspense>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/sessions" replace />} />
        <Route path="sessions" element={<SessionsList />} />
        <Route
          path="sessions/new"
          element={
            <AdminRoute>
              <SessionFormPage />
            </AdminRoute>
          }
        />
        <Route path="sessions/:id" element={<SessionFormPage />} />
        <Route
          path="pricing"
          element={
            <AdminRoute>
              <Pricing />
            </AdminRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
