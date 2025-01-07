import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface LoginResponse {
  message: string;
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users/`;

  constructor(private jwtHelper: JwtHelperService) {}

  async login(email: string, password: string): Promise<Observable<LoginResponse>> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        this.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      if (decodedToken.is_admin == 1 && decodedToken.is_superadmin == 0) {
        return 'Admin';
      } else if (decodedToken.is_admin == 0 && decodedToken.is_superadmin == 1) {
        return 'Superadmin';
      } else {
        return 'Empleado';
      }
    }
    return null;
  }

  getDepartmentIdFromToken(): string | undefined {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.department_id
    }
    return undefined;
  }

  getUserId(): number | null{
    const token = this.getToken();
    if(token){
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.id;
    }
    return null
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }
}
