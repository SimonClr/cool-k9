import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiIcon, TuiTextfieldComponent, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSelect, TuiBadge, TuiChevron, TuiInputRange } from '@taiga-ui/kit';
import { SessionService } from '../../services/session.service';
import { Session, ExerciseType, EXERCISE_TYPE_LABELS } from '../../models/session.model';
import { TuiCardLarge } from '@taiga-ui/layout';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [
    FormsModule,
    TuiSelect,
    TuiDataListWrapper,
    TuiIcon,
    TuiBadge,
    TuiTextfieldComponent,
    TuiChevron,
    TuiTextfieldDropdownDirective,
    TuiInputRange,
    TuiCardLarge,
  ],
  templateUrl: './sessions-list.component.html',
  styleUrls: ['./sessions-list.component.css'],
})
export class SessionsListComponent implements OnInit {
  private readonly sessionService = inject(SessionService);

  sessions = signal<Session[]>([]);
  selectedExerciseType = signal<ExerciseType | ''>('');
  exerciseTypes = Object.values(ExerciseType);
  exerciseTypeLabels = EXERCISE_TYPE_LABELS;

  filteredSessions = computed(() => {
    const sessions = this.sessions();
    const selectedType = this.selectedExerciseType();

    if (selectedType) {
      return sessions.filter(session => session.exerciseType === selectedType);
    }
    return sessions;
  });

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.getSessions().subscribe({
      next: sessions => {
        this.sessions.set(sessions);
      },
      error: error => {
        console.error('Error loading sessions:', error);
      },
    });
  }

  getExerciseTypeLabel(type: ExerciseType): string {
    return this.exerciseTypeLabels[type];
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
