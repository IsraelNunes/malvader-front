import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ContaService } from '../../services/conta.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  nomeUsuario: string | null = '';
  cpfUsuario: string | null = '';
  idUsuario: string | null = '';

  activeSection: string = 'saldo';

  clientAccount: any | null = null;
  extrato: any[] = [];

  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private contaService: ContaService
  ) { }

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getUsuarioNome();
    this.cpfUsuario = this.authService.getUsuarioCPF();
    this.idUsuario = this.authService.getUsuarioId();
    console.log('Painel do Cliente carregado:', {
      id: this.idUsuario,
      nome: this.nomeUsuario,
      cpf: this.cpfUsuario
    });

    if (!this.nomeUsuario || !this.cpfUsuario || !this.idUsuario) {
      console.warn("Informações de usuário incompletas no dashboard do cliente. Redirecionando para login.");
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.loadClientAccountAndExtrato();
  }

  loadClientAccountAndExtrato(): void {
    this.errorMessage = '';
    if (!this.idUsuario) {
      this.errorMessage = 'ID do usuário não disponível para carregar conta.';
      return;
    }

    this.contaService.getContasByUsuarioId(this.idUsuario).subscribe({
      next: (accounts) => {
        if (accounts && accounts.length > 0) {
          this.clientAccount = accounts[0];
          console.log('Conta do cliente carregada:', this.clientAccount);

          if (this.clientAccount.numero_conta || this.clientAccount.numeroConta) {
            const accountNumber = this.clientAccount.numero_conta || this.clientAccount.numeroConta;
            this.contaService.getExtrato(accountNumber).subscribe({
              next: (transactions) => {
                this.extrato = transactions;
                console.log('Extrato carregado:', this.extrato);
              },
              error: (err) => {
                console.error('Erro ao carregar extrato:', err);
                this.errorMessage = err.error?.message || 'Falha ao carregar extrato.';
              }
            });
          } else {
            this.errorMessage = 'Número da conta do cliente não encontrado.';
          }
        } else {
          this.errorMessage = 'Nenhuma conta encontrada para este cliente.';
          this.clientAccount = null;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar conta do cliente:', error);
        this.errorMessage = error.error?.message || 'Falha ao carregar conta do cliente.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}