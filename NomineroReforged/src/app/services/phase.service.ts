import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Phase } from '../models/phase.model';


@Injectable({
  providedIn: 'root',
})
export class PhasesService {
  private apiUrl = `${environment.apiUrl}/phases`;

  constructor(private http: HttpClient) {}

  getAllPhases(): Observable<Phase[]> {
    return this.http.get<Phase[]>(this.apiUrl);
  }

  createPhase(phase: { name: string }): Observable<Phase> {
    return this.http.post<Phase>(this.apiUrl, phase);
  }

  updatePhase(id_phase: number, phase: string): Observable<Phase> {
    return this.http.put<Phase>(`${this.apiUrl}/${id_phase}`,  phase );
  }

  deletePhase(id_phase: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id_phase}`);
  }
}
