// front/malvader-frontend/src/app/funcionario/create-account/create-account.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContaService } from '../../services/conta.service'; // Importa ContaService
import { UsuarioService } from '../../services/usuario.service'; // Importa UsuarioService
import { AgenciaService } from '../../services/agencia.service'; // Importa AgenciaService

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
  usuarios: any[] = []; // Para listar usuários existentes para vincular a conta
  agencias: any[] = []; // Para listar agências disponíveis

  constructor(
    private fb: FormBuilder,
    private contaService: ContaService,
    private usuarioService: UsuarioService,
    private agenciaService: AgenciaService
  ) { }

  ngOnInit(): void {
    this.initAccountForm();
    this.loadDependencies(); // Carrega usuários e agências
  }

  initAccountForm(): void {
    this.accountForm = this.fb.group({
      id_cliente: ['', Validators.required], // FK para o cliente
      id_agencia: ['', Validators.required], // FK para a agência
      tipo_conta: ['POUPANCA', Validators.required],
      saldo: [0, [Validators.required, Validators.min(0)]],
      // Campos específicos por tipo de conta
      taxa_rendimento: [null], // Poupança
      ultimo_rendimento: [null], // Poupança
      limite: [null], // Corrente
      data_vencimento: [null], // Corrente
      taxa_manutencao: [null], // Corrente
      perfil_risco: [null], // Investimento
      valor_minimo: [null], // Investimento
      taxa_rendimento_base: [null] // Investimento
    });

    // Adiciona validações condicionais baseadas no tipo de conta
    this.accountForm.get('tipo_conta')?.valueChanges.subscribe(type => {
      this.setConditionalValidators(type);
    });
  }

  setConditionalValidators(type: string): void {
    // Limpa validações para todos os campos específicos
    ['taxa_rendimento', 'ultimo_rendimento', 'limite', 'data_vencimento',
     'taxa_manutencao', 'perfil_risco', 'valor_minimo', 'taxa_rendimento_base'].forEach(field => {
      this.accountForm.get(field)?.clearValidators();
      this.accountForm.get(field)?.updateValueAndValidity();
    });

    if (type === 'POUPANCA') {
      this.accountForm.get('taxa_rendimento')?.setValidators([Validators.required, Validators.min(0)]);
      // this.accountForm.get('ultimo_rendimento')?.setValidators([Validators.required]); // Opcional, pode ser gerado pelo DB
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
    this.usuarioService.getAllUsuarios().subscribe({ // Assumindo que essa rota retorna todos os usuários (cliente e funcionario)
      next: (data) => {
        this.usuarios = data.filter(u => u.tipo_usuario === 'CLIENTE'); // Filtra apenas clientes
        console.log('Clientes carregados:', this.usuarios);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.errorMessage = 'Erro ao carregar clientes.';
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
        this.errorMessage = 'Erro ao carregar agências.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      console.log('Dados da nova conta:', formData);

      this.contaService.createConta(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Conta criada com sucesso!';
          console.log('Conta criada:', response);
          this.accountForm.reset({ tipo_conta: 'POUPANCA', saldo: 0 }); // Limpa e reseta defaults
          this.setConditionalValidators('POUPANCA'); // Reseta validações para o tipo padrão
        },
        error: (error) => {
          console.error('Erro ao criar conta:', error);
          this.errorMessage = error.error?.message || 'Falha ao criar conta.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      // Opcional: Marcar campos como touched para exibir erros
      this.accountForm.markAllAsTouched();
    }
  }
}