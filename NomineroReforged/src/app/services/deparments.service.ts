import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Department } from '../models/department.model';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/departments`; // URL base del endpoint de departamentos

  constructor(private http: HttpClient) { }

  // Obtener todos los departamentos
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl).pipe(
      catchError(this.handleError) // Manejo de errores
    );
  }

  // Obtener un departamento por ID
  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError) // Manejo de errores
    );
  }

  // Crear un nuevo departamento
  createDepartment(department: string): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, {name: department}).pipe(
      catchError(this.handleError) // Manejo de errores
    );
  }

  // Actualizar un departamento existente
  updateDepartment(id: number, department: string): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, {name: department}).pipe(
      catchError(this.handleError) // Manejo de errores
    );
  }

  // Eliminar un departamento
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError) // Manejo de errores
    );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente o de red
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Error del backend
      errorMessage = `Server-side error: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage)); // Retorna un error observable
  }
}
