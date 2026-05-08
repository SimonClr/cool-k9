import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Dog, Loader2, Plus, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/utils/cn.utils';
import { useDogs, useCreateDog, useUpdateDog } from '@/app/features/dogs/hooks/useDogs';
import { type CardHandle } from '../models/profile.model';

type DogRow = {
  id?: string;
  name: string;
  birthDate: string; // ISO date string YYYY-MM-DD
  isNew: boolean;
};

export const DogsCard = forwardRef<CardHandle, { onDirtyChange?: () => void }>(
  function DogsCard({ onDirtyChange }, ref) {
  const { data: dogs, isLoading } = useDogs();
  const createDog = useCreateDog();
  const updateDog = useUpdateDog();

  const [dogRows, setDogRows] = useState<DogRow[]>([]);
  const [originalRows, setOriginalRows] = useState<DogRow[]>([]);
  const [openDateIndex, setOpenDateIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!dogs) return;
    const rows: DogRow[] = dogs.map(d => ({
      id: d.id,
      name: d.name,
      birthDate: d.birthDate.toISOString().split('T')[0],
      isNew: false,
    }));
    setDogRows(rows);
    setOriginalRows(rows);
  }, [dogs]);

  const isDirty = dogRows.some(row => {
    if (row.isNew) return true;
    const orig = originalRows.find(r => r.id === row.id);
    return orig && (orig.name !== row.name || orig.birthDate !== row.birthDate);
  });

  const canSave = isDirty && dogRows.every(row => row.name.trim() !== '' && row.birthDate !== '');

  useEffect(() => { onDirtyChange?.(); }, [isDirty]);

  useImperativeHandle(ref, () => ({
    isDirty,
    canSave,
    save: async () => {
      for (const row of dogRows) {
        if (row.isNew) {
          await createDog.mutateAsync({ name: row.name.trim(), birthDate: new Date(row.birthDate) });
        } else {
          const orig = originalRows.find(r => r.id === row.id);
          if (orig && (orig.name !== row.name || orig.birthDate !== row.birthDate)) {
            await updateDog.mutateAsync({
              id: row.id!,
              name: row.name.trim(),
              birthDate: new Date(row.birthDate),
            });
          }
        }
      }
    },
  }), [isDirty, canSave, dogRows, originalRows]);

  const updateRowName = (index: number, value: string) => {
    setDogRows(prev => prev.map((row, i) => (i === index ? { ...row, name: value } : row)));
  };

  const updateRowDate = (index: number, date: Date) => {
    const iso = date.toISOString().split('T')[0];
    setDogRows(prev => prev.map((row, i) => (i === index ? { ...row, birthDate: iso } : row)));
    setOpenDateIndex(null);
  };

  const addNewRow = () => {
    setDogRows(prev => [...prev, { name: '', birthDate: '', isNew: true }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes chiens</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dogRows.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 px-1">
                  <Label>Nom</Label>
                  <Label>Date de naissance</Label>
                </div>
                {dogRows.map((row, i) => (
                  <div key={row.id ?? `new-${i}`} className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Rex"
                      value={row.name}
                      onChange={e => updateRowName(i, e.target.value)}
                      maxLength={50}
                    />
                    <Popover
                      open={openDateIndex === i}
                      onOpenChange={open => setOpenDateIndex(open ? i : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'w-full justify-start text-left font-normal bg-transparent',
                            !row.birthDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          {row.birthDate
                            ? format(new Date(row.birthDate), 'PPP', { locale: fr })
                            : 'Choisir une date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={row.birthDate ? new Date(row.birthDate) : undefined}
                          onSelect={d => { if (d) updateRowDate(i, d); }}
                          locale={fr}
                          captionLayout="dropdown"
                          startMonth={new Date(new Date().getFullYear() - 25, 0)}
                          endMonth={new Date(new Date().getFullYear(), 11)}
                          disabled={d => d > new Date()}
                          classNames={{ root: 'w-full' }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addNewRow}
              className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-border py-3 text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
            >
              <Dog className="h-4 w-4" aria-hidden="true" />
              <Plus className="h-3 w-3" aria-hidden="true" />
              Ajouter un chien
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
