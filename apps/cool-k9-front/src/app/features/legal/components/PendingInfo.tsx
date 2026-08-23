import { PENDING_VALUE } from '@/app/features/legal';

interface PendingInfoProps {
  value: string;
}

/**
 * Renders a value, or a visible marker when it is still awaiting the site
 * owner. Without it a missing value leaves a gap that reads as a deliberate
 * omission when the page is proofread.
 */
export function PendingInfo({ value }: PendingInfoProps) {
  if (value !== PENDING_VALUE) return <>{value}</>;

  return (
    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-sm font-medium text-destructive">
      [à compléter]
    </span>
  );
}
