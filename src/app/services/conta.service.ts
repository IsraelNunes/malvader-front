// front/malvader-frontend/src/app/services/conta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

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
  // POST /api/contas/criar
  createConta(contaData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criar`, contaData, { headers: this.getAuthHeaders() });
  }

  // GET /api/contas/listar
  getAllContas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  // GET /api/contas/:id
  getContaById(id: number): Observable<any> {
    return this.http.get<any>(`<span class="math-inline">\{this\.apiUrl\}/</span>{id}`, { headers: this.getAuthHeaders() });
  }

  // Rotas de operações financeiras (para clientes/funcionários)
  // POST /api/contas/deposito
  realizarDeposito(data: { numeroConta: string, valor: number, descricao?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deposito`, data, { headers: this.getAuthHeaders() });
  }

  // POST /api/contas/saque
  realizarSaque(data: { numeroConta: string, valor: number, senha: string, otp: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/saque`, data, { headers: this.getAuthHeaders() });
  }

  // POST /api/contas/transferencia
  realizarTransferencia(data: { idContaOrigem: number, idContaDestino: number, valor: number, senha: string, otp: string, descricao?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transferencia`, data, { headers: this.getAuthHeaders() });
  }

  // GET /api/contas/extrato/:numeroConta
  getExtrato(numeroConta: string): Observable<any[]> {
    return this.http.get<any[]>(`<span class="math-inline">\{this\.apiUrl\}/extrato/</span>{numeroConta}`, { headers: this.getAuthHeaders() });
  }

  // Outras operações se existirem (ex: encerrar conta)
  // PUT /api/contas/:id/encerrar (exemplo de rota)
  encerrarConta(idConta: number, data: { senhaAdmin: string, otp: string, motivo: string }): Observable<any> {
    return this.http.put<any>(`<span class="math-inline">\{this\.apiUrl\}/</span>{idConta}/encerrar`, data, { headers: this.getAuthHeaders() });
  }
}