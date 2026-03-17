import { FormEvent, useRef, useState } from 'react';
import { useCreateDog } from '../hooks/useDogs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AddDogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDogModal({ open, onOpenChange }: AddDogModalProps) {
  const ageRef = useRef<HTMLInputElement>(null);
  const createDog = useCreateDog();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; age?: string }>({});

  const reset = () => {
    setName('');
    setAge('');
    setApiError(null);
    setFieldErrors({});
  };

  const validate = () => {
    const errors: { name?: string; age?: string } = {};
    if (!name.trim()) errors.name = 'Le nom est obligatoire';
    if (!age) {
      errors.age = "L'âge est obligatoire";
    } else {
      const parsed = parseInt(age, 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 30) {
        errors.age = "L'âge doit être compris entre 0 et 30 ans";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError(null);
    createDog.mutate(
      { name: name.trim(), age: parseInt(age, 10) },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
        onError: () => setApiError("Erreur lors de l'ajout du chien. Veuillez réessayer."),
      }
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajouter un chien</DialogTitle>
          <DialogDescription>Renseignez les informations de votre chien</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {apiError && (
            <div role="alert" className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dog-name">Nom</Label>
            <Input
              id="dog-name"
              type="text"
              placeholder="Rex"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  ageRef.current?.focus();
                }
              }}
              autoComplete="off"
              autoFocus
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'dog-name-error' : undefined}
              className={fieldErrors.name ? 'border-destructive' : ''}
            />
            {fieldErrors.name && (
              <p id="dog-name-error" role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
                <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dog-age">Âge (en années)</Label>
            <Input
              id="dog-age"
              type="number"
              placeholder="3"
              min={0}
              max={30}
              ref={ageRef}
              value={age}
              onChange={e => {
                setAge(e.target.value);
                if (fieldErrors.age) setFieldErrors(prev => ({ ...prev, age: undefined }));
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e as unknown as FormEvent);
                }
              }}
              aria-invalid={!!fieldErrors.age}
              aria-describedby={fieldErrors.age ? 'dog-age-error' : undefined}
              className={fieldErrors.age ? 'border-destructive' : ''}
            />
            {fieldErrors.age && (
              <p id="dog-age-error" role="alert" className="flex items-center gap-1.5 text-destructive text-xs">
                <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                {fieldErrors.age}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={createDog.isPending} aria-busy={createDog.isPending}>
            {createDog.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Ajout en cours...
              </>
            ) : (
              'Ajouter'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
