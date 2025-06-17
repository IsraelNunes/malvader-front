import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) { }

  requestOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitar-otp`, { email });
  }

  login(email: string, senha: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, senha, otp }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.setToken(response.token);
          if (response.usuario) {
            this.setUsuarioInfo(response.usuario);
          } else {
            console.warn("AuthService: Objeto 'usuario' ausente na resposta do login. As informações serão obtidas do token JWT.");
            const decodedToken = this.parseJwt(response.token);
            if (decodedToken) {
              const userFromToken = {
                idUsuario: decodedToken.idUsuario,
                nome: decodedToken.nome || '',
                CPF: decodedToken.CPF || '',
                email: decodedToken.email,
                tipo_usuario: decodedToken.tipo_usuario,
                cargo: decodedToken.cargo || null
              };
              this.setUsuarioInfo(userFromToken);
            }
          }
        }
      })
    );
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("AuthService: Erro ao decodificar JWT:", e);
      return null;
    }
  }

  setToken(token: string) {
    localStorage.setItem('malvaderAuthToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('malvaderAuthToken');
  }

  setUsuarioInfo(usuario: any) {
    localStorage.setItem('malvaderUsuarioId', usuario.idUsuario);
    localStorage.setItem('malvaderUsuarioNome', usuario.nome);
    localStorage.setItem('malvaderUsuarioTipo', usuario.tipo_usuario);
    localStorage.setItem('malvaderUsuarioCPF', usuario.CPF || '');
    localStorage.setItem('malvaderUsuarioCargo', usuario.cargo || '');
    localStorage.setItem('malvaderUsuarioEmail', usuario.email);
  }

  getUsuarioId(): string | null {
    let id = localStorage.getItem('malvaderUsuarioId');
    if (!id) { const token = this.getToken(); if (token) { const decoded = this.parseJwt(token); if (decoded && decoded.idUsuario) { localStorage.setItem('malvaderUsuarioId', decoded.idUsuario); id = decoded.idUsuario; } } }
    return id;
  }
  getUsuarioNome(): string | null {
    let nome = localStorage.getItem('malvaderUsuarioNome');
    if (!nome) { const token = this.getToken(); if (token) { const decoded = this.parseJwt(token); if (decoded && decoded.nome) { localStorage.setItem('malvaderUsuarioNome', decoded.nome); nome = decoded.nome; } } }
    return nome;
  }
  getUsuarioTipo(): string | null {
    let tipo = localStorage.getItem('malvaderUsuarioTipo');
    if (!tipo) { const token = this.getToken(); if (token) { const decoded = this.parseJwt(token); if (decoded && decoded.tipo_usuario) { localStorage.setItem('malvaderUsuarioTipo', decoded.tipo_usuario); tipo = decoded.tipo_usuario; } } }
    return tipo;
  }
  getUsuarioCPF(): string | null {
    let cpf = localStorage.getItem('malvaderUsuarioCPF');
    if (!cpf) { const token = this.getToken(); if (token) { const decoded = this.parseJwt(token); if (decoded && decoded.CPF) { localStorage.setItem('malvaderUsuarioCPF', decoded.CPF); cpf = decoded.CPF; } } }
    return cpf;
  }
  getUsuarioCargo(): string | null {
    let cargo = localStorage.getItem('malvaderUsuarioCargo');
    if (!cargo) { const token = this.getToken(); if (token) { const decoded = this.parseJwt(token); if (decoded && decoded.cargo) { localStorage.setItem('malvaderUsuarioCargo', decoded.cargo); cargo = decoded.cargo; } } }
    return cargo;
  }
  getUsuarioEmail(): string | null {
    let email = localStorage.getItem('malvaderUsuarioEmail');
    if (!email) { const token = this.getToken(); if (token) { const decoded = this.parseJwt(token); if (decoded && decoded.email) { localStorage.setItem('malvaderUsuarioEmail', decoded.email); email = decoded.email; } } }
    return email;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUsuarioId() !== null;
  }

  logout() {
    localStorage.removeItem('malvaderAuthToken');
    localStorage.removeItem('malvaderUsuarioId');
    localStorage.removeItem('malvaderUsuarioNome');
    localStorage.removeItem('malvaderUsuarioTipo');
    localStorage.removeItem('malvaderUsuarioCPF');
    localStorage.removeItem('malvaderUsuarioCargo');
    localStorage.removeItem('malvaderUsuarioEmail');
    console.log('AuthService: Usuário deslogado. Informações removidas do Local Storage.');
  }
}