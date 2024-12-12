import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { Type } from '../models/types.model';
import { Phase } from '../models/phase.model';


@Injectable({
  providedIn: 'root',
})
export class TypesService {
  private apiUrl = `${environment.apiUrl}/types`;

  constructor(private http: HttpClient) {}

  getAllTypes(): Observable<Type[]> {
    return this.http.get<Type[]>(this.apiUrl);
  }

  createType(phase: Phase): Observable<Type> {
    return this.http.post<Type>(this.apiUrl, phase);
  }

  updateType(id_phase: number, phase: Phase): Observable<Type> {
    return this.http.put<Type>(`${this.apiUrl}/${id_phase}`,  phase );
  }

  deleteType(id_phase: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id_phase}`);
  }
}
