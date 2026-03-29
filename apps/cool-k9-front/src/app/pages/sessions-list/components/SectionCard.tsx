import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface SectionCardProps {
  icon?: ReactNode;
  title?: string | ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

export function SectionCard({
  icon,
  title,
  headerAction,
  children,
  headerClassName,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card>
      {(title || headerAction) && (
        <CardHeader className={headerClassName ?? 'pb-3'}>
          {title && (
            <div className="flex flex-wrap items-start justify-between gap-3">
              {typeof title === 'string' ? (
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  {icon}
                  {title}
                </CardTitle>
              ) : (
                title
              )}
              {headerAction}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}