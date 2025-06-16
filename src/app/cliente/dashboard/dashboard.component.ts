// front/malvader-frontend/src/app/cliente/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  nomeUsuario: string | null = '';
  cpfUsuario: string | null = ''; // <-- Adicione esta linha
  idUsuario: string | null = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getUsuarioNome();
    this.cpfUsuario = this.authService.getUsuarioCPF(); // <-- Inicialize esta linha
    this.idUsuario = this.authService.getUsuarioId();
    console.log('Painel do Cliente carregado:', {
      id: this.idUsuario,
      nome: this.nomeUsuario,
      cpf: this.cpfUsuario
    });

    // Se o nome ou CPF não estiverem presentes, pode ser um problema no JWT payload ou na inserção do DB.
    if (!this.nomeUsuario || !this.cpfUsuario) {
      console.warn("Informações de usuário incompletas no dashboard do cliente. Verifique o token JWT.");
      // Opcional: Deslogar ou exibir mensagem de erro para o usuário
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}