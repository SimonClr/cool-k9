import { Pipe, PipeTransform } from '@angular/core';
import {
  EXERCISE_TYPE_LABELS,
  ExerciseType,
  ExerciseTypeData,
} from '../../core/models/session.model';

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
