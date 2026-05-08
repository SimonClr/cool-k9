import { FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@authentication';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function Register() {
  const { register, isLoading, error } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [success, setSuccess] = useState(false);

  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!firstName.trim()) errors.firstName = 'Le prénom est obligatoire';
    if (!lastName.trim()) errors.lastName = 'Le nom est obligatoire';
    if (!email.trim()) errors.email = 'L\'email est obligatoire';
    if (!password) errors.password = 'Le mot de passe est obligatoire';
    if (!confirmPassword) errors.confirmPassword = 'Veuillez confirmer le mot de passe';
    else if (password && password !== confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(email, password, firstName, lastName);
      setSuccess(true);
    } catch {
      // error is already set in auth context
    }
  };

  const handleFirstNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); lastNameRef.current?.focus(); }
  };

  const handleLastNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); emailRef.current?.focus(); }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); passwordRef.current?.focus(); }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); confirmPasswordRef.current?.focus(); }
  };

  const handleConfirmPasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e as unknown as FormEvent); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img src="/logo.png" alt="Cool K9" className="h-32 w-auto mx-auto mb-2" width="128" height="128" />
              </picture>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <div>
              <p className="font-semibold">Compte créé avec succès !</p>
              <p className="text-sm text-muted-foreground mt-1">
                Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail pour activer votre compte.
              </p>
            </div>
            <Link to="/login" className="text-sm text-primary hover:underline">
              Retour à la connexion
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="Cool K9" className="h-32 w-auto mx-auto mb-2" />
          <CardDescription>Créez votre espace entraîneur</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  maxLength={40}
                  value={firstName}
                  onChange={e => {
                    setFirstName(e.target.value);
                    if (fieldErrors.firstName) setFieldErrors(prev => ({ ...prev, firstName: undefined }));
                  }}
                  onKeyDown={handleFirstNameKeyDown}
                  autoComplete="given-name"
                  aria-invalid={!!fieldErrors.firstName}
                  aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                  className={fieldErrors.firstName ? 'border-destructive' : ''}
                />
                {fieldErrors.firstName && (
                  <p id="firstName-error" role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
                    <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  maxLength={30}
                  ref={lastNameRef}
                  value={lastName}
                  onChange={e => {
                    setLastName(e.target.value);
                    if (fieldErrors.lastName) setFieldErrors(prev => ({ ...prev, lastName: undefined }));
                  }}
                  onKeyDown={handleLastNameKeyDown}
                  autoComplete="family-name"
                  aria-invalid={!!fieldErrors.lastName}
                  aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                  className={fieldErrors.lastName ? 'border-destructive' : ''}
                />
                {fieldErrors.lastName && (
                  <p id="lastName-error" role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
                    <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                ref={emailRef}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                }}
                onKeyDown={handleEmailKeyDown}
                placeholder="trainer@coolk9.com"
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                className={fieldErrors.email ? 'border-destructive' : ''}
              />
              {fieldErrors.email && (
                <p id="email-error" role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
                  <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                ref={passwordRef}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                }}
                onKeyDown={handlePasswordKeyDown}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
                className={fieldErrors.password ? 'border-destructive' : ''}
              />
              {fieldErrors.password && (
                <p id="register-password-error" role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
                  <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                ref={confirmPasswordRef}
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }}
                onKeyDown={handleConfirmPasswordKeyDown}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                className={fieldErrors.confirmPassword ? 'border-destructive' : ''}
              />
              {fieldErrors.confirmPassword && (
                <p id="confirm-password-error" role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
                  <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Création...
                </>
              ) : (
                'Créer un compte'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
