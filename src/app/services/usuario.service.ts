// front/malvader-frontend/src/app/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Para obter o token

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
  getAllUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  // Rota GET /api/usuarios/:id (se existir)
  getUsuarioById(id: number): Observable<any> {
    return this.http.get<any>(`<span class="math-inline">\{this\.apiUrl\}/</span>{id}`, { headers: this.getAuthHeaders() });
  }

  // Rotas adicionais para operações de usuário (se houver no backend e necessário no front)
  // Ex: atualizar perfil, etc.
}