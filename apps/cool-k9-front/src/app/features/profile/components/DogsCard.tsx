import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { dogsSchema, type DogsFormValues } from '../models/dogs.schema';

export const DogsCard = forwardRef<CardHandle, { onDirtyChange?: (isDirty: boolean) => void }>(
  function DogsCard({ onDirtyChange }, ref) {
  const { data: dogs, isLoading } = useDogs();
  const createDog = useCreateDog();
  const updateDog = useUpdateDog();

  const [openDateIndex, setOpenDateIndex] = useState<number | null>(null);

  const { register, control, handleSubmit, reset, formState: { isDirty, isValid, dirtyFields } } =
    useForm<DogsFormValues>({
      resolver: zodResolver(dogsSchema),
      defaultValues: { dogs: [] },
    });

  const { fields, append } = useFieldArray({ control, name: 'dogs' });

  useEffect(() => {
    if (!dogs) return;
    reset({
      dogs: dogs.map(d => ({
        id: d.id,
        name: d.name,
        birthDate: d.birthDate.toISOString().split('T')[0],
      })),
    });
  }, [dogs]);

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]);

  useImperativeHandle(ref, () => ({
    isDirty,
    canSave: isDirty && isValid,
    save: handleSubmit(async ({ dogs: rows }) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.id) {
          await createDog.mutateAsync({ name: row.name.trim(), birthDate: new Date(row.birthDate) });
        } else if (dirtyFields.dogs?.[i]) {
          await updateDog.mutateAsync({
            id: row.id,
            name: row.name.trim(),
            birthDate: new Date(row.birthDate),
          });
        }
      }
    }),
  }), [isDirty, isValid, dirtyFields]);

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
            {fields.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 px-1">
                  <Label>Nom</Label>
                  <Label>Date de naissance</Label>
                </div>
                {fields.map((field, i) => (
                  <div key={field.id} className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Rex"
                      maxLength={50}
                      {...register(`dogs.${i}.name`)}
                    />
                    <Controller
                      control={control}
                      name={`dogs.${i}.birthDate`}
                      render={({ field: dateField }) => (
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
                                !dateField.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                              {dateField.value
                                ? format(new Date(dateField.value), 'PPP', { locale: fr })
                                : 'Choisir une date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={dateField.value ? new Date(dateField.value) : undefined}
                              onSelect={d => {
                                if (d) {
                                  dateField.onChange(d.toISOString().split('T')[0]);
                                  setOpenDateIndex(null);
                                }
                              }}
                              locale={fr}
                              captionLayout="dropdown"
                              startMonth={new Date(new Date().getFullYear() - 25, 0)}
                              endMonth={new Date(new Date().getFullYear(), 11)}
                              disabled={d => d > new Date()}
                              classNames={{ root: 'w-full' }}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => append({ name: '', birthDate: '' })}
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
