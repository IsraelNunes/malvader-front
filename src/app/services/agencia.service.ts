import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AgenciaService {
  private apiUrl = 'http://localhost:3000/api/agencias';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllAgencias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  getAgenciaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createAgencia(agenciaData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criar`, agenciaData, { headers: this.getAuthHeaders() });
  }
}