import { Navigate } from 'react-router-dom';
import { useSession } from '@/app/features/sessions/hooks/useSessions';
import { useAuth } from '@authentication';
import { Loader2 } from 'lucide-react';
import { AdminSessionForm } from './AdminSessionForm';
import { UserSessionView } from './UserSessionView';

export function EditSessionForm({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();
  const { data: session, isLoading, isError } = useSession(sessionId);

  if (isLoading) {
    return (
      <div
        aria-live="polite"
        aria-busy="true"
        className="flex items-center justify-center gap-2 text-muted-foreground py-12"
      >
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (isError || !session) {
    return <Navigate to="/sessions" replace />;
  }

  if (user?.isAdmin) {
    return <AdminSessionForm session={session} />;
  }

  return <UserSessionView session={session} />;
}
