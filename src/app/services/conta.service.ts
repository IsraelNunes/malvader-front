// front/malvader-frontend/src/app/services/conta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Para obter o token

@Injectable({
  providedIn: 'root'
})
export class ContaService {
  private apiUrl = 'http://localhost:3000/api/contas'; // Rota base para contas

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

  // Rotas administrativas (para funcionários)
  createConta(contaData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criar`, contaData, { headers: this.getAuthHeaders() });
  }

  getAllContas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  getContaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // **** NOVO MÉTODO PARA CLIENTE ****
  // GET /api/contas/usuario/:idUsuario - Retorna contas vinculadas a um idUsuario
  // O backend precisa implementar esta rota em contaRoutes.js
  getContasByUsuarioId(idUsuario: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`, { headers: this.getAuthHeaders() });
  }
  // **********************************

  // Rotas de operações financeiras
  realizarDeposito(data: { numeroConta: string, valor: number, descricao?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deposito`, data, { headers: this.getAuthHeaders() });
  }
  realizarSaque(data: { numeroConta: string, valor: number, senha: string, otp: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/saque`, data, { headers: this.getAuthHeaders() });
  }
  realizarTransferencia(data: { idContaOrigem: number, idContaDestino: number, valor: number, senha: string, otp: string, descricao?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transferencia`, data, { headers: this.getAuthHeaders() });
  }
  getExtrato(numeroConta: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/extrato/${numeroConta}`, { headers: this.getAuthHeaders() });
  }
  encerrarConta(idConta: number, data: { senhaAdmin: string, otp: string, motivo: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idConta}/encerrar`, data, { headers: this.getAuthHeaders() });
  }
}