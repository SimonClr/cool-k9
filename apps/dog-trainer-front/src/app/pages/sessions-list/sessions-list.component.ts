import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { SessionService } from '../../shared/services/session.service';
import { ExerciseType, Session } from '../../core/models/session.model';
import { TuiBlockStatusComponent, TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExerciseDataPipe } from '../../shared/pipes/exercise-data.pipe';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [
    FormsModule,
    TuiIcon,
    TuiBadge,
    TuiCardLarge,
    TuiHeader,
    TuiTitle,
    DatePipe,
    TuiBlockStatusComponent,
    ExerciseDataPipe,
  ],
  templateUrl: './sessions-list.component.html',
  styleUrls: ['./sessions-list.component.css'],
})
export class SessionsListComponent implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly sessions = signal<Session[]>([]);
  private readonly selectedExerciseType = signal<ExerciseType | ''>('');

  protected readonly filteredSessions = computed(() => {
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

  private loadSessions(): void {
    this.sessionService
      .getSessions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: sessions => this.sessions.set(sessions),
        error: error => console.error('Error loading sessions:', error),
      });
  }
}
