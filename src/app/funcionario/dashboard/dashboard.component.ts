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
  cargoUsuario: string | null = ''; // Retornará o cargo real do funcionário (GERENTE, ATENDENTE, ESTAGIARIO)
  idUsuario: string | null = '';
  
  // Controla qual seção de conteúdo está visível no dashboard
  // 'createAccount': Abrir Conta
  // 'createClient': Cadastrar Cliente
  // 'createEmployee': Cadastrar Funcionário
  // 'createAgency': Cadastrar Agência
  // 'listUsers': Listar Usuários
  // 'listAccounts': Listar Contas
  // 'reports': Gerar Relatórios
  activeSection: string = 'createAccount'; // Seção padrão ao carregar o dashboard

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Carrega informações do usuário logado para exibição no dashboard
    this.nomeUsuario = this.authService.getUsuarioNome();
    this.cargoUsuario = this.authService.getUsuarioTipo() === 'FUNCIONARIO' ? this.authService.getUsuarioCargo() : null; // Pega o cargo real
    this.idUsuario = this.authService.getUsuarioId();
    console.log('Painel do Funcionário carregado:', {
      id: this.idUsuario,
      nome: this.nomeUsuario,
      tipo: this.authService.getUsuarioTipo(),
      cargo: this.cargoUsuario
    });
  }

  /**
   * Realiza o logout do usuário e redireciona para a tela de login.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
