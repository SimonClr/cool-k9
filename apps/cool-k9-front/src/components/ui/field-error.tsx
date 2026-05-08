import { AlertCircle } from 'lucide-react';

export function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
