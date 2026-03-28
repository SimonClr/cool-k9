import { Link } from 'react-router-dom';
import { Session } from '@models';
import { getExerciseTypeData } from '@/app/utils/exercise-type';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Dog, MapPin, Thermometer, User } from 'lucide-react';
import { WEATHER_LABELS } from '@/app/utils/session-labels';
import { useAuth } from '@authentication';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const { user } = useAuth();
  const exerciseTypeData = getExerciseTypeData(session.exerciseType);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Link to={`/sessions/${session.id}`} className="block">
      <Card className="transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 dark:hover:border-primary/60 dark:hover:shadow-[0_4px_20px_hsl(var(--primary)/0.15)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{formatDate(session.date)}</CardTitle>
            <Badge variant={exerciseTypeData.variant}>{exerciseTypeData.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Dog className="h-4 w-4 text-muted-foreground" />
            <span>{session.dogNames.join(', ') || '—'}</span>
          </div>

          {user?.isAdmin && session.userNames && session.userNames.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{session.userNames.join(', ')}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{session.duration} min</span>
          </div>

          {session.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{session.location}</span>
            </div>
          )}

          {session.weather && (
            <div className="flex items-center gap-3 text-sm">
              <Thermometer className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{WEATHER_LABELS[session.weather]}</span>
            </div>
          )}

        </CardContent>
      </Card>
    </Link>
  );
}
