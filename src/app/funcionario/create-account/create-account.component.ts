// front/malvader-frontend/src/app/funcionario/create-account/create-account.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContaService } from '../../services/conta.service'; // Serviço para operações de conta
import { UsuarioService } from '../../services/usuario.service'; // Serviço para buscar usuários (clientes)
import { AgenciaService } from '../../services/agencia.service'; // Serviço para buscar agências
import { AuthService } from '../../auth/auth.service'; // Serviço de autenticação

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {
  accountForm!: FormGroup; // FormGroup para o formulário de conta
  errorMessage: string = ''; // Mensagem de erro para o usuário
  successMessage: string = ''; // Mensagem de sucesso para o usuário

  // Opções para os dropdowns e validações
  tiposConta: string[] = ['POUPANCA', 'CORRENTE', 'INVESTIMENTO'];
  perfisRisco: string[] = ['BAIXO', 'MEDIO', 'ALTO'];
  
  // Listas de dados do backend para popular dropdowns
  usuariosClientes: any[] = []; // Armazena usuários do tipo CLIENTE
  agencias: any[] = []; // Armazena agências

  constructor(
    private fb: FormBuilder, // Injetor de FormBuilder para criar o formulário
    private contaService: ContaService, // Injetor do serviço de contas
    private usuarioService: UsuarioService, // Injetor do serviço de usuários
    private agenciaService: AgenciaService, // Injetor do serviço de agências
    private authService: AuthService // Injetor do serviço de autenticação
  ) { }

  ngOnInit(): void {
    this.initAccountForm(); // Inicializa a estrutura do formulário
    this.loadDependencies(); // Carrega os dados de clientes e agências
  }

  /**
   * Inicializa a estrutura do formulário reativo com campos e validações.
   */
  initAccountForm(): void {
    this.accountForm = this.fb.group({
      // Campos obrigatórios para todas as contas
      id_cliente: [null, Validators.required], // ID do cliente (FK)
      id_agencia: [null, Validators.required], // ID da agência (FK)
      tipo_conta: ['POUPANCA', Validators.required], // Tipo de conta, com valor inicial 'POUPANCA'
      saldo: [0, [Validators.required, Validators.min(0)]], // Saldo inicial, mínimo 0

      // Campos específicos para cada tipo de conta (inicializados como null)
      taxa_rendimento: [null], // Poupança
      ultimo_rendimento: [null], // Poupança
      limite: [null], // Corrente
      data_vencimento: [null], // Corrente
      taxa_manutencao: [null], // Corrente
      perfil_risco: [null], // Investimento
      valor_minimo: [null], // Investimento
      taxa_rendimento_base: [null] // Investimento
    });

    // Observa mudanças no campo 'tipo_conta' para aplicar validações condicionais
    this.accountForm.get('tipo_conta')?.valueChanges.subscribe(type => {
      this.setConditionalValidators(type);
    });
    // Define as validações iniciais para o tipo de conta padrão (POUPANCA)
    this.setConditionalValidators('POUPANCA'); 
  }

  /**
   * Define validadores para campos específicos do formulário com base no tipo de conta selecionado.
   * @param type O tipo de conta selecionado ('POUPANCA', 'CORRENTE', 'INVESTIMENTO').
   */
  setConditionalValidators(type: string): void {
    // Lista de todos os campos específicos para limpar validadores
    const specificFields = [
      'taxa_rendimento', 'ultimo_rendimento', 'limite', 'data_vencimento',
      'taxa_manutencao', 'perfil_risco', 'valor_minimo', 'taxa_rendimento_base'
    ];

    // Limpa validadores, atualiza status de validade e reseta estado visual para todos os campos específicos
    specificFields.forEach(field => {
      const control = this.accountForm.get(field);
      control?.clearValidators();
      control?.updateValueAndValidity();
      control?.markAsPristine(); // Limpa estado 'dirty'
      control?.markAsUntouched(); // Limpa estado 'touched'
    });

    // Define novos validadores com base no tipo de conta
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
    // Revalida o formulário completo após a mudança dos validadores
    this.accountForm.updateValueAndValidity(); 
  }

  /**
   * Carrega a lista de clientes e agências do backend para popular os dropdowns.
   */
  loadDependencies(): void {
    // Carrega usuários (filtrando apenas clientes)
    this.usuarioService.getAllUsuarios().subscribe({
      next: (data) => {
        // Filtra os usuários retornados da API para incluir apenas aqueles com tipo_usuario === 'CLIENTE'
        // A propriedade no JSON do backend é 'tipoUsuario' (camelCase)
        this.usuariosClientes = data.filter(u => u.tipoUsuario === 'CLIENTE'); 
        console.log('Clientes carregados:', this.usuariosClientes);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.errorMessage = error.error?.message || 'Erro ao carregar clientes. Verifique o backend.';
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
        this.errorMessage = error.error?.message || 'Erro ao carregar agências. Verifique o backend.';
      }
    });
  }

  /**
   * Manipula a submissão do formulário de criação de conta.
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      console.log('Dados da nova conta para envio:', formData);

      // Chama o serviço de contas para criar a conta no backend
      this.contaService.createConta(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Conta criada com sucesso!';
          console.log('Conta criada:', response);
          // Limpa o formulário e redefine os valores padrão após o sucesso
          this.accountForm.reset({ tipo_conta: 'POUPANCA', saldo: 0 }); 
          this.setConditionalValidators('POUPANCA'); // Re-define validações para o tipo padrão
        },
        error: (error) => {
          console.error('Erro ao criar conta:', error);
          this.errorMessage = error.error?.message || 'Falha ao criar conta. Verifique os dados e permissões.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      // Marca todos os campos como "touched" para exibir mensagens de erro ao usuário
      this.accountForm.markAllAsTouched(); 
    }
  }
}
