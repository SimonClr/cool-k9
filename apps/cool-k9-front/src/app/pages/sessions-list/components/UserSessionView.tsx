import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Environment, ObservationStatus, Session } from '@models';
import { useUpdateSession } from '@/app/hooks/useSessions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Clock,
  Cloud,
  Dog,
  Loader2,
  MapPin,
  MessageSquare,
  Target,
  Thermometer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  OBSERVATION_STATUS_LABELS,
  OBSERVATION_STATUS_VARIANTS,
} from '../models/session-form.types';
import { ENVIRONMENT_LABELS, WEATHER_LABELS } from '@/app/utils/session-labels';
import { getExerciseTypeData } from '@/app/utils/exercise-type';
import { SectionCard } from './SectionCard';

// ─── UserSessionView ──────────────────────────────────────────────────────────

export function UserSessionView({ session }: { session: Session }) {
  const navigate = useNavigate();
  const updateSession = useUpdateSession(session.id);

  const canEditOwnerObs = session.userIds.length === 1;
  const showTrainerObservations = session.observationStatus !== ObservationStatus.WAITING_OWNER;

  const [ownerObservations, setOwnerObservations] = useState(session.ownerObservations ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateSession.mutate(
      { ownerObservations: ownerObservations.trim() || null } as Parameters<
        typeof updateSession.mutate
      >[0],
      {
        onSuccess: () => {
          toast.success('Observations enregistrées !');
          navigate('/sessions', { replace: true });
        },
        onError: () => toast.error('Erreur lors de la mise à jour. Veuillez réessayer.'),
      }
    );
  };

  const exerciseTypeData = getExerciseTypeData(session.exerciseType);

  const formatDateLong = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <SectionCard
        title={<h1 className="text-2xl font-bold capitalize">{formatDateLong(session.date)}</h1>}
        headerAction={
          <div className="flex flex-wrap gap-2">
            <Badge variant={exerciseTypeData.variant}>{exerciseTypeData.label}</Badge>
            {session.observationStatus && (
              <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
                {OBSERVATION_STATUS_LABELS[session.observationStatus]}
              </Badge>
            )}
          </div>
        }
        headerClassName="p-6 pb-3"
        contentClassName="space-y-3"
      >
        <div className="flex items-center gap-3 text-sm">
          <Dog className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="font-medium">{session.dogNames.join(', ') || '—'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span>{session.duration} min</span>
        </div>
        {session.location && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>{session.location}</span>
          </div>
        )}
        {session.environment && (
          <div className="flex items-center gap-3 text-sm">
            <Cloud className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>{ENVIRONMENT_LABELS[session.environment]}</span>
          </div>
        )}
        {session.environment === Environment.OUTDOOR && session.weather && (
          <div className="flex items-center gap-3 text-sm">
            <Thermometer className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>{WEATHER_LABELS[session.weather]}</span>
          </div>
        )}
      </SectionCard>

      {session.route && session.environment === Environment.OUTDOOR && (
        <SectionCard icon={<MapPin className="h-4 w-4" aria-hidden="true" />} title="Parcours">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{session.route}</p>
        </SectionCard>
      )}

      {/* Observations Cool-K9 + client — fusionnées dans une seule card */}
      {((showTrainerObservations && !!session.trainerObservations) ||
        canEditOwnerObs ||
        !!session.ownerObservations) && (
        <SectionCard
          icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
          title="Observations"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cool-K9 en premier */}
            {showTrainerObservations && session.trainerObservations && (
              <div
                className={cn(
                  'flex flex-col gap-1.5',
                  !(canEditOwnerObs || !!session.ownerObservations) && 'sm:col-span-2'
                )}
              >
                <p className="text-sm font-medium">Cool-K9</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {session.trainerObservations}
                </p>
              </div>
            )}
            {/* Client */}
            {(canEditOwnerObs || !!session.ownerObservations) && (
              <div
                className={cn(
                  'flex flex-col gap-1.5',
                  !(showTrainerObservations && !!session.trainerObservations) && 'sm:col-span-2'
                )}
              >
                <p className="text-sm font-medium">Client</p>
                {canEditOwnerObs ? (
                  <Textarea
                    id="ownerObservations"
                    placeholder="Vos observations après la séance..."
                    value={ownerObservations}
                    onChange={e => setOwnerObservations(e.target.value)}
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {session.ownerObservations}
                  </p>
                )}
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Objectifs — fusionnés dans une seule card */}
      {(session.previousObjectives || session.nextObjectives) && (
        <SectionCard icon={<Target className="h-4 w-4" aria-hidden="true" />} title="Objectifs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Séance courante */}
            {session.previousObjectives && (
              <div
                className={cn('flex flex-col gap-1.5', !session.nextObjectives && 'sm:col-span-2')}
              >
                <p className="text-sm font-medium">Séance</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {session.previousObjectives}
                </p>
              </div>
            )}
            {/* Prochaine séance */}
            {session.nextObjectives && (
              <div
                className={cn(
                  'flex flex-col gap-1.5',
                  !session.previousObjectives && 'sm:col-span-2'
                )}
              >
                <p className="text-sm font-medium">Prochaine séance</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {session.nextObjectives}
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {canEditOwnerObs && (
        <div className="flex gap-3 mt-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={
              updateSession.isPending ||
              ownerObservations.trim() === (session.ownerObservations ?? '').trim()
            }
            aria-busy={updateSession.isPending}
          >
            {updateSession.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
