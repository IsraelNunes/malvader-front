// front/malvader-frontend/src/app/services/usuario.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // A URL base para outras rotas (como /listar)
  private apiUrl = 'http://localhost:3000/api/clientes/criar';

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
  getAllUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  // Rota GET /api/usuarios/:id
  getUsuarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // MÉTODO PARA CRIAR CLIENTE - CHAMANDO A ROTA ESPECÍFICA DE CLIENTES
  // O frontend enviará { "usuario": {...}, "cliente": {...} }
  createUsuario(payload: any): Observable<any> {
    // ESTA É A URL EXATA QUE O BACKEND ESPERA PARA CRIAR CLIENTES:
    // http://localhost:3000/api/clientes/criar
    return this.http.post<any>('http://localhost:3000/api/clientes/criar', payload, { headers: this.getAuthHeaders() });
  }
}
