import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {
  private apiUrl = 'http://localhost:3000/api/funcionarios';

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

  create(funcionarioData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/criar`, funcionarioData, { headers: this.getAuthHeaders() });
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, { headers: this.getAuthHeaders() });
  }
  update(cpf: string, funcionarioData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${cpf}`, funcionarioData, { headers: this.getAuthHeaders() });
  }
  delete(cpf: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${cpf}`, { headers: this.getAuthHeaders() });
  }
}