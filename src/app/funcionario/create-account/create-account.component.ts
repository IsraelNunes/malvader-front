// front/malvader-frontend/src/app/funcionario/create-account/create-account.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContaService } from '../../services/conta.service';
import { UsuarioService } from '../../services/usuario.service'; // Importa UsuarioService
import { AgenciaService } from '../../services/agencia.service'; // Importa AgenciaService
import { AuthService } from '../../auth/auth.service'; // Para obter dados do usuário logado

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {
  accountForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  tiposConta: string[] = ['POUPANCA', 'CORRENTE', 'INVESTIMENTO'];
  perfisRisco: string[] = ['BAIXO', 'MEDIO', 'ALTO'];
  usuariosClientes: any[] = []; // Para listar usuários do tipo CLIENTE
  agencias: any[] = []; // Para listar agências disponíveis

  constructor(
    private fb: FormBuilder,
    private contaService: ContaService,
    private usuarioService: UsuarioService, // Injete
    private agenciaService: AgenciaService, // Injete
    private authService: AuthService // Injete (se precisar de dados do usuário logado aqui, ex: id do funcionário)
  ) { }

  ngOnInit(): void {
    this.initAccountForm();
    this.loadDependencies(); // Carrega clientes e agências ao iniciar o componente
  }

  initAccountForm(): void {
    this.accountForm = this.fb.group({
      id_cliente: [null, Validators.required], // FK para o cliente
      id_agencia: [null, Validators.required], // FK para a agência
      tipo_conta: ['POUPANCA', Validators.required],
      saldo: [0, [Validators.required, Validators.min(0)]],
      // Campos específicos por tipo de conta - inicializados como null
      taxa_rendimento: [null],
      ultimo_rendimento: [null],
      limite: [null],
      data_vencimento: [null],
      taxa_manutencao: [null],
      perfil_risco: [null],
      valor_minimo: [null],
      taxa_rendimento_base: [null]
    });

    // Adiciona validações condicionais baseadas no tipo de conta
    this.accountForm.get('tipo_conta')?.valueChanges.subscribe(type => {
      this.setConditionalValidators(type);
    });
    this.setConditionalValidators('POUPANCA'); // Define validações iniciais para o tipo padrão
  }

  setConditionalValidators(type: string): void {
    // Limpa validações e reseta estado para todos os campos específicos
    ['taxa_rendimento', 'ultimo_rendimento', 'limite', 'data_vencimento',
     'taxa_manutencao', 'perfil_risco', 'valor_minimo', 'taxa_rendimento_base'].forEach(field => {
      const control = this.accountForm.get(field);
      control?.clearValidators();
      control?.updateValueAndValidity();
      control?.markAsPristine(); // Limpa estado de touched/dirty
      control?.markAsUntouched();
    });

    // Define novas validações baseadas no tipo selecionado
    if (type === 'POUPANCA') {
      this.accountForm.get('taxa_rendimento')?.setValidators([Validators.required, Validators.min(0)]);
    } else if (type === 'CORRENTE') {
      this.accountForm.get('limite')?.setValidators([Validators.required, Validators.min(0)]);
      this.accountForm.get('data_vencimento')?.setValidators([Validators.required]);
      this.accountForm.get('taxa_manutencao')?.setValidators([Validators.required, Validators.min(0)]);
    } else if (type === 'INVESTIMENTO') {
      this.accountForm.get('perfil_risco')?.setValidators([Validators.required]);
      this.accountForm.get('valor_minimo')?.setValidators([Validators.required, Validators.min(0)]);
      this.accountForm.get('taxa_rendimento_base')?.setValidators([Validators.required, Validators.min(0)]);
    }
    this.accountForm.updateValueAndValidity(); // Revalida o formulário
  }


  loadDependencies(): void {
    // Carrega usuários (clientes)
    this.usuarioService.getAllUsuarios().subscribe({
      next: (data) => {
        // Assume que a rota /listar retorna todos os usuários (FUNCIONARIO e CLIENTE)
        // O cliente para vincular a conta é o id_usuario da tabela 'usuario'
        this.usuariosClientes = data.filter(u => u.tipo_usuario === 'CLIENTE');
        console.log('Clientes carregados:', this.usuariosClientes);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.errorMessage = error.error?.message || 'Erro ao carregar clientes.';
      }
    });

    // Carrega agências
    this.agenciaService.getAllAgencias().subscribe({
      next: (data) => {
        this.agencias = data;
        console.log('Agências carregadas:', this.agencias);
      },
      error: (error) => {
        console.error('Erro ao carregar agências:', error);
        this.errorMessage = error.error?.message || 'Erro ao carregar agências.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      console.log('Dados da nova conta para envio:', formData);

      this.contaService.createConta(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Conta criada com sucesso!';
          console.log('Conta criada:', response);
          this.accountForm.reset({ tipo_conta: 'POUPANCA', saldo: 0 }); // Limpa e reseta defaults
          this.setConditionalValidators('POUPANCA'); // Re-define validações para o tipo padrão
        },
        error: (error) => {
          console.error('Erro ao criar conta:', error);
          this.errorMessage = error.error?.message || 'Falha ao criar conta.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      this.accountForm.markAllAsTouched(); // Marca todos os campos como "touched" para exibir erros
    }
  }
}