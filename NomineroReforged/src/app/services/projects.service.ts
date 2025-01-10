import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { User } from '../models/user.model';
import { Project } from '../models/proyect.model';



@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/proyects`;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }
  getProjectsFromEmployee(userId:number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/employee/${userId}`);
  }


  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: Partial<Project>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getEmployeesByProject(projectId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${projectId}/employees`);
  }

  assignEmployeesToProject(projectId: number, users: User[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${projectId}/assign-employees`, { users });
  }

  deleteEmployeeFromProject(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/employees/${userId}`);
  }
  
}
