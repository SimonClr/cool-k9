import { useState } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui';
import { useAuth } from '@/app/features/auth';
import { apiDeleteMyAccount } from '../api/user.api';
import { DELETE_CONFIRMATION_WORD } from '../constants/account-deletion.constants';

export function DeleteAccountCard() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Deletion is irreversible, so a click alone must not be enough to trigger it:
  // the word has to be typed out.
  const canDelete = confirmation.trim().toUpperCase() === DELETE_CONFIRMATION_WORD;

  const closeDialog = (nextOpen: boolean) => {
    if (deleting) return;
    setOpen(nextOpen);
    if (!nextOpen) setConfirmation('');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDeleteMyAccount();
      // The account is gone, so the local session points at nothing: sign out to
      // clear it and let the router send the user back to the login screen.
      await logout();
    } catch {
      toast.error('La suppression a échoué. Veuillez réessayer.');
      setDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/40">
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="flex items-center gap-2 font-medium text-destructive">
            <TriangleAlert className="h-4 w-4" />
            Supprimer mon compte
          </h2>
          <p className="text-sm text-muted-foreground">
            La suppression efface définitivement votre compte, vos chiens et vos séances
            personnelles. Les séances partagées avec d'autres participants restent accessibles à
            ces derniers, sans que vous y figuriez. Cette action est irréversible.
          </p>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="self-start"
          onClick={() => setOpen(true)}
        >
          Supprimer mon compte
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer définitivement votre compte ?</DialogTitle>
            <DialogDescription>
              Votre compte, vos chiens et vos séances personnelles seront effacés. Cette action est
              irréversible : vous ne pourrez plus vous connecter et aucune récupération n'est
              possible.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-confirmation">
              Pour confirmer, saisissez «&nbsp;{DELETE_CONFIRMATION_WORD}&nbsp;»
            </Label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={event => setConfirmation(event.target.value)}
              autoComplete="off"
              disabled={deleting}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => closeDialog(false)} disabled={deleting}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              aria-busy={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
