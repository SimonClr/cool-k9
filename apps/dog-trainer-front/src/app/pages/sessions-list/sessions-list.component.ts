import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { SessionService } from '../../shared/services/session.service';
import { TuiBlockStatusComponent, TuiHeader } from '@taiga-ui/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SessionCard } from './components/session-card/session-card';
import { ExerciseType, Session } from '@dog-trainer/models';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [FormsModule, TuiIcon, TuiHeader, TuiTitle, TuiBlockStatusComponent, SessionCard],
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
