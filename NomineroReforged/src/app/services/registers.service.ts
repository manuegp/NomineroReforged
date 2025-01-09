import { Injectable, Type } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { Register } from '../models/register.model';
import { Project } from './projects.service';
import { Phase } from '../models/phase.model';

@Injectable({
  providedIn: 'root',
})
export class RegistersService {
  private apiUrl = `${environment.apiUrl}/registers`;

  constructor(private http: HttpClient) {}

  public static colors = {
    green: '#6aa84f',
    yellow: '#f1c232',
    red: '#cc4125',
    gray: '#808080',
    blue: '#2e78d6',
  };

  getEvents(
    userId: number,
    from: DayPilot.Date,
    to: DayPilot.Date
  ): Observable<Register[]> {
    return this.http.get<Register[]>(
      `${this.apiUrl}/${userId}?from=${from.toString(
        'yyyy-MM-dd'
      )}+&to=${to.toString('yyyy-MM-dd')}`
    );
  }

  addRegister(register: Register): Observable<Register> {
    return this.http.post<Register>(`${this.apiUrl}`, register);
  }

  updateRegister(idRegister: number, register: Register): Observable<Register> {
    return this.http.put<Register>(`${this.apiUrl}/${idRegister}`, register);
  }

  deleteRegister(idRegister: number): Observable<Register> {
    return this.http.delete<Register>(`${this.apiUrl}/${idRegister}`);
  }

  /**
   * Convierte los registros a eventos de DayPilot
   * @param result Lista de registros desde el backend
   * @returns Lista de datos de eventos de DayPilot
   */
  parseToEvents(
    result: Register[],
    phases: Phase[],
    projects: Project[]
  ): DayPilot.EventData[] {
    return result.map((register) => {
      const startDate = new DayPilot.Date(register.date); // Fecha de inicio
      const endDate = startDate.addHours(register.time!); // Suma las horas de 'time' al inicio

      return {
        id: register.id!,
        text: ``, // Texto para mostrar en el evento
        start: startDate, // Fecha de inicio
        end: endDate, // Fecha de fin calculada
        project: register.project,
        phase: register.phase,
        user: register.user,
        time: register.time,
        isExtra: register.is_extra,
        coment: register.coment,
        backColor: RegistersService.colors.blue,
        fontColor: 'white',
        borderColor: 'white',
      };
    });
  }

  getName(array: (Phase | Project)[], id: number): string {
    const item = array.find((x: Phase | Project) => x.id === id);
    return item?.name ?? '';
  }

  getColors(): any[] {
    const colors = [
      { name: 'Green', id: RegistersService.colors.green },
      { name: 'Yellow', id: RegistersService.colors.yellow },
      { name: 'Red', id: RegistersService.colors.red },
      { name: 'Gray', id: RegistersService.colors.gray },
      { name: 'Blue', id: RegistersService.colors.blue },
    ];
    return colors;
  }
}
