import { Session } from '@models';
import { getExerciseTypeData } from '@/app/utils/exercise-type';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Dog, FileText } from 'lucide-react';

interface SessionCardProps {
  session: Session;
}

const getBadgeVariant = (color: string) => {
  const variantMap: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'info'> = {
    primary: 'default',
    accent: 'secondary',
    success: 'success',
    warning: 'warning',
    info: 'info',
    neutral: 'secondary',
  };
  return variantMap[color] || 'default';
};

export function SessionCard({ session }: SessionCardProps) {
  const exerciseTypeData = getExerciseTypeData(session.exerciseType);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card className="transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 dark:hover:border-primary/60 dark:hover:shadow-[0_4px_20px_hsl(var(--primary)/0.15)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{formatDate(session.date)}</CardTitle>
          <Badge variant={getBadgeVariant(exerciseTypeData.color)}>{exerciseTypeData.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-3 text-sm">
          <Dog className="h-4 w-4 text-muted-foreground" />
          <span>{session.dogName}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{session.duration} min</span>
        </div>

        {session.notes && (
          <div className="flex items-center gap-3 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-2">{session.notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
