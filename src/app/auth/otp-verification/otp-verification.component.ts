// front/malvader-frontend/src/app/auth/otp-verification/otp-verification.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss']
})
export class OtpVerificationComponent implements OnInit {
  otpForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  idUsuario: string | null = null;
  tipoUsuario: string | null = null;
  identificador: string | null = null;
  email: string | null = null;
  senha: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadTempLoginInfo();
    // Verifica se há informações temporárias necessárias (email e senha são os mínimos)
    if (!this.email || !this.senha) {
      this.errorMessage = 'Sessão de login expirada ou inválida. Por favor, faça login novamente.';
      this.authService.logout(); // Limpa qualquer resíduo
      this.router.navigate(['/login']);
      return;
    }

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Opcional: Solicitar OTP automaticamente ao carregar a tela, se desejado.
    // this.requestOtp();
  }

  loadTempLoginInfo(): void {
    this.idUsuario = this.authService.getTempIdUsuario();
    this.tipoUsuario = this.authService.getTempTipoUsuario();
    this.identificador = this.authService.getTempIdentificador();
    this.email = this.authService.getTempEmail();
    this.senha = this.authService.getTempSenha();
    console.log('OTP Verification: Informações temporárias carregadas:', {
      id: this.idUsuario, tipo: this.tipoUsuario, ident: this.identificador, email: this.email, senhaExiste: !!this.senha
    });
  }

  requestOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.email) {
      this.errorMessage = 'Email do usuário ausente. Volte ao login.';
      return;
    }

    // Chama o serviço para solicitar OTP, usando o email
    this.authService.requestOtp(this.email).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Novo OTP solicitado com sucesso! Verifique seu email.';
        console.log('OTP solicitado:', response);
      },
      error: (error) => {
        console.error('Erro ao solicitar OTP:', error);
        this.errorMessage = error.error?.message || 'Falha ao solicitar novo OTP.';
      }
    });
  }

  verifyOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Verifica se todas as informações necessárias estão disponíveis
    if (!this.email || !this.senha || !this.otpForm.get('otp')?.value) {
      this.errorMessage = 'Dados incompletos para verificação de OTP.';
      return;
    }

    const otp = this.otpForm.get('otp')?.value;

    // Chama o método final de login no AuthService para verificar OTP e obter o token JWT
    this.authService.verifyOtpLogin(this.email, this.senha, otp).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Login concluído com sucesso!';
        console.log('Verificação de OTP bem-sucedida e login finalizado:', response);

        // Obtém o tipo de usuário e cargo do AuthService (que já os buscou do JWT/LocalStorage)
        const userType = this.authService.getUsuarioTipo();
        const userCargo = this.authService.getUsuarioCargo();

        setTimeout(() => {
          if (userType === 'FUNCIONARIO') {
            this.router.navigate(['/funcionario/dashboard']);
          } else if (userType === 'CLIENTE') {
            this.router.navigate(['/cliente/dashboard']);
          } else {
            // Caso raro: se o tipo de usuário não for reconhecido mesmo após o login final
            this.errorMessage = 'Tipo de usuário desconhecido ou token inválido. Por favor, contate o suporte.';
            this.authService.logout();
          }
        }, 1000);
      },
      error: (error) => {
        console.error('Erro ao verificar OTP ou finalizar login:', error);
        this.errorMessage = error.error?.message || 'Código OTP inválido ou expirado.';
      }
    });
  }
}