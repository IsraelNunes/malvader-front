// front/malvader-frontend/src/app/services/agencia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AgenciaService {
  private apiUrl = 'http://localhost:3000/api/agencias'; // Rota base para agências

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

  // Rota GET /api/agencias/listar
  // Necessita de token de funcionário (GERENTE, ATENDENTE, ESTAGIARIO)
  getAllAgencias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  // Rota GET /api/agencias/:id (para buscar detalhes de uma agência específica)
  getAgenciaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Rota POST /api/agencias/criar (se o frontend for criar agências)
  createAgencia(agenciaData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criar`, agenciaData, { headers: this.getAuthHeaders() });
  }
}