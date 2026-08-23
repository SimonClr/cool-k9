import { Link } from 'react-router-dom';
import { LEGAL_ROUTES } from '@/app/features/legal';

/**
 * Legal links for the sign-in and sign-up screens, which do not use Layout and
 * therefore have no footer. They open in a new tab: navigating away would
 * unmount the form and discard whatever the visitor has already typed.
 */
export function LegalLinks() {
  return (
    <p className="mt-6 text-center text-xs text-muted-foreground">
      <Link
        to={LEGAL_ROUTES.terms}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 transition-colors hover:text-primary"
      >
        Conditions générales
      </Link>
      {' · '}
      <Link
        to={LEGAL_ROUTES.privacy}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 transition-colors hover:text-primary"
      >
        Politique de confidentialité
      </Link>
    </p>
  );
}
