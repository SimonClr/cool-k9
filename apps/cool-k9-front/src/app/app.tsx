import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute, Login, ProtectedRoute } from '@/app/features/auth';
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
