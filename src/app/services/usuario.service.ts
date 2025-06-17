// front/malvader-frontend/src/app/services/usuario.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // URL base para operações GERAIS de usuários (como listar)
  // Baseado no seu `server.js` que faz `app.use('/api/usuarios', usuarioRoutes);`
  private usuariosApiUrl = 'http://localhost:3000/api/usuarios';

  // URL específica para a criação de clientes
  private clientesCriarApiUrl = 'http://localhost:3000/api/clientes/criar';

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

  // Rota GET /api/usuarios/listar (para listar todos os usuários)
  getAllUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usuariosApiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  // Rota GET /api/usuarios/:id
  getUsuarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.usuariosApiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Rota POST para criar um usuário/cliente
  // Chamará http://localhost:3000/api/clientes/criar
  createUsuario(payload: any): Observable<any> {
    return this.http.post<any>(this.clientesCriarApiUrl, payload, { headers: this.getAuthHeaders() });
  }
}
