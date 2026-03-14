import { Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SessionsList } from './pages/sessions-list/SessionsList';
import { Pricing } from './pages/pricing/Pricing';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/sessions" replace />} />
        <Route path="sessions" element={<SessionsList />} />
        <Route path="pricing" element={<Pricing />} />
      </Route>
    </Routes>
  );
}

export default App;
