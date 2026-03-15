import { Route, Routes, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@authentication';
import { Layout } from './components/Layout';
import { SessionsList } from './pages/sessions-list/SessionsList';
import { Pricing } from './pages/pricing/Pricing';
import { Login } from './pages/login/Login';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
  );
}

export default App;
