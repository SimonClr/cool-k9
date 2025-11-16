import { Component, input } from '@angular/core';
import { Session } from '../../../../core/models/session.model';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { ExerciseDataPipe } from '../../../../shared/pipes/exercise-data.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-session-card',
  imports: [TuiCardLarge, TuiHeader, TuiTitle, TuiBadge, TuiIcon, ExerciseDataPipe, DatePipe],
  templateUrl: './session-card.html',
  styleUrl: './session-card.css',
})
export class SessionCard {
  public readonly session = input.required<Session>();
}
