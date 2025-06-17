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
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  requestOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    const email = this.loginForm.get('email')?.value;

    if (!email || !this.loginForm.get('email')?.valid) {
      this.errorMessage = 'Por favor, insira um email válido para solicitar o OTP.';
      this.loginForm.get('email')?.markAsTouched();
      return;
    }

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

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, senha, otp } = this.loginForm.value;
    this.authService.login(email, senha, otp).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Login bem-sucedido!';
        console.log('Login bem-sucedido:', response);

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
            this.errorMessage = 'Tipo de usuário desconhecido ou token inválido. Por favor, contate o suporte.';
            this.authService.logout();
          }
        }, 1000);
      },
      error: (error) => {
        console.error('Erro no login:', error);
        this.errorMessage = error.error?.message || 'Credenciais ou OTP inválidos.';
      }
    });
  }
}