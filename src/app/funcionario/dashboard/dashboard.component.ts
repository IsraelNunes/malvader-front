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
  cargoUsuario: string | null = '';
  idUsuario: string | null = '';

  activeSection: string = 'createAccount';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getUsuarioNome();
    this.cargoUsuario = this.authService.getUsuarioTipo() === 'FUNCIONARIO' ? this.authService.getUsuarioCargo() : null;
    this.idUsuario = this.authService.getUsuarioId();
    console.log('Painel do Funcionário carregado:', {
      id: this.idUsuario,
      nome: this.nomeUsuario,
      tipo: this.authService.getUsuarioTipo(),
      cargo: this.cargoUsuario
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}