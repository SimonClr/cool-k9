import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@authentication';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';
import { Login } from './pages/login/Login';

const SessionsList = lazy(() => import('./pages/sessions-list/SessionsList').then(m => ({ default: m.SessionsList })));
const Pricing = lazy(() => import('./pages/pricing/Pricing').then(m => ({ default: m.Pricing })));
const Register = lazy(() => import('./pages/register/Register').then(m => ({ default: m.Register })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" aria-live="polite" aria-busy="true">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
          <Route path="pricing" element={<Pricing />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
