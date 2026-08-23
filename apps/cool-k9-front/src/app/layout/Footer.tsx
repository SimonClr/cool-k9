import { Link } from 'react-router-dom';
import { LEGAL_ROUTES } from '@/app/features/legal';

// Short labels keep the footer to a single line on narrow viewports, where
// the full wording wrapped onto two.
const FOOTER_LINKS = [
  { to: LEGAL_ROUTES.notice, label: 'Mentions légales', shortLabel: 'Mentions' },
  { to: LEGAL_ROUTES.privacy, label: 'Politique de confidentialité', shortLabel: 'Confidentialité' },
  { to: LEGAL_ROUTES.terms, label: 'Conditions générales', shortLabel: 'CGU' },
];

export function Footer() {
  return (
    <footer className="shrink-0 border-t bg-background py-4">
      <div className="container mx-auto flex flex-col items-center gap-1 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:gap-3">
        <nav
          aria-label="Informations légales"
          className="flex flex-wrap justify-center gap-x-4 gap-y-1"
        >
          {FOOTER_LINKS.map(link => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-primary">
              <span className="sm:hidden">{link.shortLabel}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} Cool K9</p>
      </div>
    </footer>
  );
}
