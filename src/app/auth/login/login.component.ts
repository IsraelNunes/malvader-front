import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UsuarioService } from '../../services/usuario.service'; // Serviço para cadastrar cliente

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  currentMode: 'login' | 'registerClient' = 'login'; // Controla o modo: 'login' ou 'registerClient'

  constructor(
    private fb: FormBuilder, // Para construir o formulário reativo
    private router: Router, // Para navegação entre rotas
    private authService: AuthService, // Serviço de autenticação
    private usuarioService: UsuarioService // Serviço para criar usuários (clientes neste contexto)
  ) { }

  ngOnInit(): void {
    this.initForm(); // Inicializa o formulário com todos os controles
    this.switchMode('login'); // Define o modo inicial como 'login' e aplica as validações
  }

  /**
   * Inicializa a estrutura do formulário com todos os campos possíveis para ambos os modos.
   * Validações iniciais são mínimas, serão ajustadas em `switchMode`.
   */
  initForm(): void {
    this.loginForm = this.fb.group({
      // Campos comuns a ambos os modos (login e cadastro)
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],

      // Campo específico do modo login
      otp: [''], // Campo OTP, não obrigatório por padrão, validação condicional

      // Campos específicos do modo registerClient (cadastro de cliente)
      nome: [''],
      cpf: [''],
      data_nascimento: [''], // Input type="date" retorna "YYYY-MM-DD" ou outro formato
      telefone: [''],
      scoreCredito: ['']
    });
  }

  /**
   * Alterna entre os modos de Login e Cadastro de Cliente.
   * Aplica/remove validadores e limpa o formulário ao trocar de modo.
   * @param mode O modo a ser ativado ('login' ou 'registerClient').
   */
  switchMode(mode: 'login' | 'registerClient'): void {
    this.currentMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset(); // Limpa todos os campos do formulário ao trocar de modo

    // Redefine validadores para campos comuns a ambos os modos
    this.loginForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.loginForm.get('senha')?.setValidators(Validators.required);
    
    // Configura validadores e valores padrão para o modo 'login'
    if (mode === 'login') {
      this.loginForm.get('otp')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);

      // Remove validadores e limpa campos específicos do cadastro de cliente
      ['nome', 'cpf', 'data_nascimento', 'telefone', 'scoreCredito'].forEach(field => {
        this.loginForm.get(field)?.clearValidators();
        this.loginForm.get(field)?.markAsPristine();
        this.loginForm.get(field)?.markAsUntouched();
      });
      
    } else { // mode === 'registerClient'
      this.loginForm.get('otp')?.clearValidators(); // OTP não é necessário para cadastro de cliente
      this.loginForm.get('otp')?.markAsPristine();
      this.loginForm.get('otp')?.markAsUntouched();

      // Adiciona validadores para campos de cadastro de cliente
      this.loginForm.get('nome')?.setValidators(Validators.required);
      this.loginForm.get('cpf')?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
      this.loginForm.get('data_nascimento')?.setValidators(Validators.required);
      this.loginForm.get('telefone')?.setValidators([Validators.required, Validators.pattern(/^\d{10,11}$/)]);
      this.loginForm.get('scoreCredito')?.setValidators([Validators.required, Validators.min(0)]);
    }

    // Atualiza a validade de todos os controles impactados pela mudança de modo
    ['email', 'senha', 'otp', 'nome', 'cpf', 'data_nascimento', 'telefone', 'scoreCredito'].forEach(field => {
      this.loginForm.get(field)?.updateValueAndValidity();
    });
  }

  /**
   * Solicita um código OTP ao backend, usando o e-mail do usuário.
   * Este método é chamado apenas no modo 'login'.
   */
  requestOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    const email = this.loginForm.get('email')?.value;

    if (!email || !this.loginForm.get('email')?.valid) {
      this.errorMessage = 'Por favor, insira um e-mail válido para solicitar o OTP.';
      // Marca o campo como touched para exibir erros de validação visualmente
      this.loginForm.get('email')?.markAsTouched();
      return;
    }

    // Chama o serviço de autenticação para gerar OTP no backend
    this.authService.requestOtp(email).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'OTP solicitado! Verifique seu e-mail.';
        console.log('OTP solicitado:', response);
      },
      error: (error) => {
        console.error('Erro ao solicitar OTP:', error);
        this.errorMessage = error.error?.message || 'Falha ao solicitar OTP. Verifique o e-mail.';
      }
    });
  }

  /**
   * Manipula a submissão do formulário, realizando login ou cadastro de cliente.
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Verifica se o formulário é inválido (qualquer campo obrigatório não preenchido ou com formato errado)
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      this.loginForm.markAllAsTouched(); // Marca todos os campos como "touched" para exibir erros
      console.log('Formulário inválido na submissão:', this.loginForm.errors);
      return;
    }

    // Lógica para Login
    if (this.currentMode === 'login') {
      const { email, senha, otp } = this.loginForm.value; // Coleta os 3 campos para login

      // Chama o método 'login' do AuthService para autenticação completa (Email, Senha, OTP)
      this.authService.login(email, senha, otp).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Login bem-sucedido!';
          console.log('Login bem-sucedido:', response);

          // Obtém o tipo de usuário e cargo do AuthService (que já os armazena do JWT)
          const userType = this.authService.getUsuarioTipo();
          const userCargo = this.authService.getUsuarioCargo();

          // Redireciona para o painel apropriado após um pequeno delay
          setTimeout(() => {
            if (userType === 'FUNCIONARIO') {
              console.log('Redirecionando para Painel do Funcionário (Cargo:', userCargo, ')');
              this.router.navigate(['/funcionario/dashboard']);
            } else if (userType === 'CLIENTE') {
              console.log('Redirecionando para Painel do Cliente');
              this.router.navigate(['/cliente/dashboard']);
            } else {
              // Caso o tipo de usuário seja desconhecido (JWT inválido ou payload incompleto)
              this.errorMessage = 'Tipo de usuário desconhecido ou token inválido. Por favor, contate o suporte.';
              this.authService.logout(); // Desloga o usuário
            }
          }, 1000);
        },
        error: (error) => {
          console.error('Erro no login:', error);
          this.errorMessage = error.error?.message || 'Credenciais ou OTP inválidos.';
        }
      });
    } else { // currentMode === 'registerClient' - Lógica para Cadastro de Cliente
      const rawFormData = this.loginForm.value;

      // Formata a data de nascimento para YYYY-MM-DD, conforme esperado pelo MySQL/backend
      let formattedDataNascimento = rawFormData.data_nascimento;
      if (rawFormData.data_nascimento instanceof Date) {
          formattedDataNascimento = rawFormData.data_nascimento.toISOString().slice(0, 10);
      } else if (typeof rawFormData.data_nascimento === 'string' && rawFormData.data_nascimento.includes('-')) {
          // Já está no formato YYYY-MM-DD
          formattedDataNascimento = rawFormData.data_nascimento;
      } else if (typeof rawFormData.data_nascimento === 'string' && rawFormData.data_nascimento.includes('/')) {
          // Converte de MM/DD/YYYY ou DD/MM/YYYY para YYYY-MM-DD (assumindo MM/DD/YYYY do input type="date")
          const parts = rawFormData.data_nascimento.split('/');
          if (parts.length === 3) {
              formattedDataNascimento = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
      }

      // Constrói o payload para 'usuario'
      const payloadUsuario = {
        nome: rawFormData.nome,
        cpf: rawFormData.cpf,
        email: rawFormData.email,
        data_nascimento: formattedDataNascimento, // Usa a data formatada
        telefone: rawFormData.telefone,
        senha: rawFormData.senha
      };

      // Constrói o payload para 'cliente'
      const payloadCliente = {
        scoreCredito: rawFormData.scoreCredito
      };

      // Payload FINAL para o backend, conforme o modelo { usuario: {...}, cliente: {...} }
      const finalPayload = {
        usuario: payloadUsuario,
        cliente: payloadCliente
      };

      console.log('DEBUG: Payload FINAL para criar CLIENTE:', finalPayload);

      // Chama o serviço para criar o cliente
      // Assumindo que usuarioService.createUsuario chama POST /api/clientes/criar
      this.usuarioService.createUsuario(finalPayload).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Cliente cadastrado com sucesso! Faça login.';
          console.log('Cliente cadastrado:', response);
          this.switchMode('login'); // Volta para o modo login após o cadastro
        },
        error: (error) => {
          console.error('Erro ao cadastrar cliente:', error);
          this.errorMessage = error.error?.message || 'Falha ao cadastrar cliente.';
        }
      });
    }
  }
}
