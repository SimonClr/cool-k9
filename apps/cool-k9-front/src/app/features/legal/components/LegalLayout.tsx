import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn.utils';
import { LEGAL_INFO, LEGAL_ROUTES } from '@/app/features/legal';
import { PendingInfo } from './PendingInfo';

const LEGAL_LINKS = [
  { to: LEGAL_ROUTES.notice, label: 'Mentions légales' },
  { to: LEGAL_ROUTES.privacy, label: 'Politique de confidentialité' },
  { to: LEGAL_ROUTES.terms, label: 'Conditions générales' },
];

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

/**
 * Standalone page frame for the legal documents. These pages must stay readable
 * while signed out, so they cannot go through Layout, which loads the user's
 * dogs and redirects to the profile.
 */
export function LegalLayout({ title, children }: LegalLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Cool K9" className="h-12 w-auto" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour au site
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <nav
          aria-label="Documents légaux"
          className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b pb-4"
        >
          {LEGAL_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={location.pathname === link.to ? 'page' : undefined}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === link.to ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <main>
          <h1 className="mb-8 text-3xl font-bold">{title}</h1>
          <div className="flex flex-col gap-8 text-sm leading-relaxed text-foreground">
            {children}
          </div>
        </main>

        <footer className="mt-12 border-t pt-4 text-sm text-muted-foreground">
          Dernière mise à jour : <PendingInfo value={LEGAL_INFO.lastUpdated} /> — version{' '}
          {LEGAL_INFO.documentsVersion}
        </footer>
      </div>
    </div>
  );
}
