import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CreateSessionForm } from './components/CreateSessionForm';
import { EditSessionForm } from './components/EditSessionForm';

export function SessionFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  return (
    <div className="container mx-auto max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Mes séances
      </Button>

      {isEditMode ? <EditSessionForm sessionId={id} /> : <CreateSessionForm />}
    </div>
  );
}
