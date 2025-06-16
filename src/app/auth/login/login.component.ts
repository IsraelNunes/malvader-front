// front/malvader-frontend/src/app/auth/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Campos do formulário: email, senha, otp
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]] // OTP de 6 dígitos
    });
  }

  // Método para solicitar OTP (chamado pelo botão "Gerar OTP")
  requestOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    const email = this.loginForm.get('email')?.value;

    if (!email || !this.loginForm.get('email')?.valid) { // Garante que o email é válido antes de solicitar OTP
      this.errorMessage = 'Por favor, insira um email válido para solicitar o OTP.';
      return;
    }

    // Chama o serviço de autenticação para gerar OTP no backend
    this.authService.requestOtp(email).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'OTP solicitado! Verifique seu email.';
        console.log('OTP solicitado:', response);
      },
      error: (error) => {
        console.error('Erro ao solicitar OTP:', error);
        this.errorMessage = error.error?.message || 'Falha ao solicitar OTP. Verifique o email.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.valid) {
      const { email, senha, otp } = this.loginForm.value; // Todos os campos necessários

      // Chamada de login ÚNICA e COMPLETA
      this.authService.login(email, senha, otp).subscribe({ // Usando o método 'login' do AuthService
        next: (response) => {
          this.successMessage = response.message || 'Login bem-sucedido!';
          console.log('Login bem-sucedido:', response);

          // Obtém o tipo de usuário e cargo diretamente do AuthService (já armazenados pelo tap)
          const userType = this.authService.getUsuarioTipo();
          const userCargo = this.authService.getUsuarioCargo();

          setTimeout(() => {
            if (userType === 'FUNCIONARIO') {
              console.log('Redirecionando para Painel do Funcionário (Cargo:', userCargo, ')');
              this.router.navigate(['/funcionario/dashboard']);
            } else if (userType === 'CLIENTE') {
              console.log('Redirecionando para Painel do Cliente');
              this.router.navigate(['/cliente/dashboard']);
            } else {
              // Esta condição agora só deve ocorrer se o JWT não contiver tipo_usuario ou for inválido
              this.errorMessage = 'Tipo de usuário desconhecido ou token inválido. Por favor, contate o suporte.';
              this.authService.logout(); // Desloga caso o tipo seja inválido
            }
          }, 1000);
        },
        error: (error) => {
          console.error('Erro no login:', error);
          this.errorMessage = error.error?.message || 'Credenciais ou OTP inválidos.';
        }
      });

    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }
}