import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private usuariosApiUrl = 'http://localhost:3000/api/usuarios';

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

  getAllUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usuariosApiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.usuariosApiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createUsuario(payload: any): Observable<any> {
    return this.http.post<any>(this.clientesCriarApiUrl, payload, { headers: this.getAuthHeaders() });
  }
}