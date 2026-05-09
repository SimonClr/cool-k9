import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { AlertCircle, Loader2 } from 'lucide-react';
import { loginSchema, type LoginFormValues } from './models/login.schema';

export function Login() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const from = fromPath && fromPath !== '/profile' ? fromPath : '/sessions';

  useEffect(() => { clearError(); }, []);

  const passwordRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { ref: passwordRhfRef, ...passwordRest } = register('password');

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // error is already set in auth context
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); passwordRef.current?.focus(); }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(onSubmit)(); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img src="/logo.png" alt="Cool K9" className="h-32 w-auto mx-auto mb-2" width="128" height="128" fetchPriority="high" />
            </picture>
          <CardDescription>Connectez-vous à votre espace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error && (
              <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                onKeyDown={handleEmailKeyDown}
                placeholder="trainer@coolk9.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <FieldError id="email-error" message={errors.email.message} />}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                {...passwordRest}
                ref={(e) => { passwordRhfRef(e); passwordRef.current = e; }}
                onKeyDown={handlePasswordKeyDown}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <FieldError id="password-error" message={errors.password.message} />}
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              S'inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
