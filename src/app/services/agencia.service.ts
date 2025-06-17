// front/malvader-frontend/src/app/services/agencia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Para obter o token de autenticação

@Injectable({
  providedIn: 'root'
})
export class AgenciaService {
  // AJUSTE ESTA URL para a rota base das suas agências no backend
  private apiUrl = 'http://localhost:3000/api/agencias'; 

  constructor(
    private http: HttpClient,
    private authService: AuthService // Injetor do serviço de autenticação
  ) { }

  /**
   * Obtém os cabeçalhos de autenticação com o token JWT.
   * @returns HttpHeaders com Content-Type e Authorization Bearer token.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Inclui o token JWT nas requisições
    });
  }

  /**
   * Lista todas as agências do backend.
   * Rota: GET /api/agencias/listar
   * Acesso: Necessita de token de funcionário (GERENTE, ATENDENTE, ESTAGIARIO).
   * @returns Um Observable com um array de agências.
   */
  getAllAgencias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }

  /**
   * Obtém os detalhes de uma agência específica por ID.
   * Rota: GET /api/agencias/:id
   * Acesso: Necessita de token de funcionário (GERENTE, ATENDENTE, ESTAGIARIO).
   * @param id O ID da agência.
   * @returns Um Observable com os detalhes da agência.
   */
  getAgenciaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /**
   * Cria uma nova agência no backend.
   * Rota: POST http://localhost:3000/api/agencias/criar
   * Acesso: Necessita de token de funcionário (GERENTE).
   * O backend espera o JSON no formato { "agencia": {...}, "endereco": {...} }.
   * @param agenciaData Os dados da agência e do endereço para criação.
   * @returns Um Observable com a resposta da criação.
   */
  createAgencia(agenciaData: any): Observable<any> {
    // A rota completa é http://localhost:3000/api/agencias/criar
    return this.http.post<any>(`${this.apiUrl}/criar`, agenciaData, { headers: this.getAuthHeaders() });
  }
}
