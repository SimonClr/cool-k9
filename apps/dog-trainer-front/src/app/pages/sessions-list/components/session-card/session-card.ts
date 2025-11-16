import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { ExerciseDataPipe } from '@shared/pipes/exercise-data.pipe';
import { DatePipe } from '@angular/common';
import { Session } from '@dog-trainer/models';

@Component({
  selector: 'app-session-card',
  standalone: true,
  imports: [TuiHeader, TuiTitle, TuiBadge, TuiIcon, ExerciseDataPipe, DatePipe, TuiCardLarge],
  templateUrl: './session-card.html',
  styleUrl: './session-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionCard {
  public readonly session = input.required<Session>();
}
