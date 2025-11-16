import { Pipe, PipeTransform } from '@angular/core';
import { EXERCISE_TYPE_LABELS, ExerciseTypeData } from '../../core/models/session.model';
import { ExerciseType } from '@dog-trainer/models';

@Pipe({
  name: 'exerciseDataPipe',
})
export class ExerciseDataPipe implements PipeTransform {
  transform(type: ExerciseType | ''): ExerciseTypeData {
    if (type === '') {
      return { label: 'Tous les types', color: 'default' };
    }
    return EXERCISE_TYPE_LABELS[type];
  }
}
