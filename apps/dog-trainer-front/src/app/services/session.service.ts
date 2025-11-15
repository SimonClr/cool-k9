import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Session, ExerciseType } from '../models/session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/sessions';

  getSessions(
    userId?: string,
    exerciseType?: ExerciseType
  ): Observable<Session[]> {
    let params = new HttpParams();

    if (userId) {
      params = params.set('userId', userId);
    }

    if (exerciseType) {
      params = params.set('exerciseType', exerciseType);
    }

    return this.http.get<Session[]>(this.apiUrl, { params }).pipe(
      map((sessions) =>
        sessions.map((session) => ({
          ...session,
          date: new Date(session.date),
        }))
      )
    );
  }
}