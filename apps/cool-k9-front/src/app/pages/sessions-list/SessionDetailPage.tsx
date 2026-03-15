import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../../hooks/useSessions';
import { Environment, ObservationStatus } from '@models';
import { getExerciseTypeData } from '@/app/utils/exercise-type';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Clock,
  Cloud,
  Dog,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Target,
  Thermometer,
} from 'lucide-react';

const WEATHER_LABELS: Record<string, string> = {
  SUNNY: '☀️ Soleil',
  CLOUDY: '☁️ Nuageux',
  RAIN: '🌧️ Pluie',
  WIND: '💨 Vent',
  SNOW: '❄️ Neige',
  STORM: '⛈️ Orage',
};

const ENVIRONMENT_LABELS: Record<string, string> = {
  INDOOR: 'Intérieur',
  OUTDOOR: 'Extérieur',
};

const OBSERVATION_STATUS_LABELS: Record<string, string> = {
  WAITING_OWNER: 'En attente propriétaire',
  WAITING_TRAINER: 'En attente dresseur',
  COMPLETE: 'Complète',
};

const OBSERVATION_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'warning' | 'success'> =
  {
    WAITING_OWNER: 'warning',
    WAITING_TRAINER: 'secondary',
    COMPLETE: 'success',
  };

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{children}</p>
      </CardContent>
    </Card>
  );
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading, isError } = useSession(id!);

  const formatDateLong = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          aria-live="polite"
          aria-busy="true"
          className="flex items-center justify-center gap-2 text-muted-foreground py-12"
        >
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return <Navigate to="/sessions" replace />;
  }

  const exerciseTypeData = getExerciseTypeData(session.exerciseType);
  const showTrainerObservations = session.observationStatus !== ObservationStatus.WAITING_OWNER;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Bouton retour */}
      <Button
        variant="ghost"
        className="mb-6 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Mes séances
      </Button>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold capitalize">{formatDateLong(session.date)}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                exerciseTypeData.color === 'primary'
                  ? 'default'
                  : exerciseTypeData.color === 'success'
                    ? 'success'
                    : exerciseTypeData.color === 'warning'
                      ? 'warning'
                      : exerciseTypeData.color === 'info'
                        ? 'info'
                        : 'secondary'
              }
            >
              {exerciseTypeData.label}
            </Badge>
            {session.observationStatus && (
              <Badge variant={OBSERVATION_STATUS_VARIANTS[session.observationStatus]}>
                {OBSERVATION_STATUS_LABELS[session.observationStatus]}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Infos générales */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Dog className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="font-medium">{session.dogName}</span>
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
        </CardContent>
      </Card>

      {/* Sections riches */}
      <div className="space-y-4">
        {session.route && (
          <SectionCard icon={<MapPin className="h-4 w-4" aria-hidden="true" />} title="Parcours">
            {session.route}
          </SectionCard>
        )}

        {session.previousObjectives && (
          <SectionCard
            icon={<Target className="h-4 w-4" aria-hidden="true" />}
            title="Objectifs de la séance précédente"
          >
            {session.previousObjectives}
          </SectionCard>
        )}

        {session.ownerObservations && (
          <SectionCard
            icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
            title="Observations propriétaire"
          >
            {session.ownerObservations}
          </SectionCard>
        )}

        {showTrainerObservations && session.trainerObservations && (
          <SectionCard
            icon={<FileText className="h-4 w-4" aria-hidden="true" />}
            title="Observations dresseur"
          >
            {session.trainerObservations}
          </SectionCard>
        )}

        {session.nextObjectives && (
          <SectionCard
            icon={<Target className="h-4 w-4" aria-hidden="true" />}
            title="Objectifs prochaine séance"
          >
            {session.nextObjectives}
          </SectionCard>
        )}

        {session.notes && (
          <SectionCard icon={<FileText className="h-4 w-4" aria-hidden="true" />} title="Notes">
            {session.notes}
          </SectionCard>
        )}
      </div>
    </div>
  );
}
