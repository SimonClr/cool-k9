import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { AlertCircle, Loader2 } from 'lucide-react';
import { type RegisterFormValues, registerSchema } from './models/register.schema';

export function Register() {
  const { register: authRegister, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const { ref: lastNameRhfRef, ...lastNameRest } = register('lastName');
  const { ref: emailRhfRef, ...emailRest } = register('email');
  const { ref: passwordRhfRef, ...passwordRest } = register('password');
  const { ref: confirmPasswordRhfRef, ...confirmPasswordRest } = register('confirmPassword');

  const onSubmit = async ({ email, password, firstName, lastName }: RegisterFormValues) => {
    try {
      await authRegister(email, password, firstName, lastName);
      navigate('/sessions', { replace: true });
    } catch {
      // error is already set in auth context
    }
  };

  const handleFirstNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lastNameRef.current?.focus();
    }
  };

  const handleLastNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      emailRef.current?.focus();
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmPasswordRef.current?.focus();
    }
  };

  const handleConfirmPasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="Cool K9" className="h-32 w-auto mx-auto mb-2" />
          <CardDescription>Créez votre espace entraîneur</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                  type="text"
                  maxLength={40}
                  {...register('firstName')}
                  onKeyDown={handleFirstNameKeyDown}
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <FieldError id="firstName-error" message={errors.firstName.message} />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  maxLength={30}
                  {...lastNameRest}
                  ref={e => {
                    lastNameRhfRef(e);
                    lastNameRef.current = e;
                  }}
                  onKeyDown={handleLastNameKeyDown}
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <FieldError id="lastName-error" message={errors.lastName.message} />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...emailRest}
                ref={e => {
                  emailRhfRef(e);
                  emailRef.current = e;
                }}
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
                ref={e => {
                  passwordRhfRef(e);
                  passwordRef.current = e;
                }}
                onKeyDown={handlePasswordKeyDown}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'register-password-error' : undefined}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <FieldError id="register-password-error" message={errors.password.message} />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...confirmPasswordRest}
                ref={e => {
                  confirmPasswordRhfRef(e);
                  confirmPasswordRef.current = e;
                }}
                onKeyDown={handleConfirmPasswordKeyDown}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <FieldError id="confirm-password-error" message={errors.confirmPassword.message} />
              )}
            </div>
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isLoading}
              aria-busy={isLoading}
            >
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
