// front/malvader-frontend/src/app/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/api/usuarios'; // Rota base para usuários

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

  // Rota GET /api/usuarios/listar
  // Necessita de token de funcionário (GERENTE, ATENDENTE, ESTAGIARIO)
  getAllUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  // Rota GET /api/usuarios/:id (para buscar detalhes de um usuário específico, se necessário)
  getUsuarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Rota POST /api/usuarios/criar (se o frontend for criar usuários base diretamente)
  createUsuario(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criar`, userData, { headers: this.getAuthHeaders() });
  }
}