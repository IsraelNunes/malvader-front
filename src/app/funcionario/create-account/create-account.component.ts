import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContaService } from '../../services/conta.service';
import { UsuarioService } from '../../services/usuario.service';
import { AgenciaService } from '../../services/agencia.service';
import { AuthService } from '../../auth/auth.service';

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

  usuariosClientes: any[] = [];
  agencias: any[] = [];

  constructor(
    private fb: FormBuilder,
    private contaService: ContaService,
    private usuarioService: UsuarioService,
    private agenciaService: AgenciaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initAccountForm();
    this.loadDependencies();

    this.accountForm.get('id_agencia')?.valueChanges.subscribe(value => {
      console.log('DEBUG: id_agencia valor alterado:', value);
      console.log('DEBUG: id_agencia status do controle:', this.accountForm.get('id_agencia')?.status);
      console.log('DEBUG: id_agencia erros:', this.accountForm.get('id_agencia')?.errors);
    });
  }

  initAccountForm(): void {
    this.accountForm = this.fb.group({
      id_cliente: [null, Validators.required],
      id_agencia: [null, Validators.required],
      tipo_conta: ['POUPANCA', Validators.required],
      saldo: [0, [Validators.required, Validators.min(0)]],
      taxa_rendimento: [null],
      ultimo_rendimento: [null],
      limite: [null],
      data_vencimento: [null],
      taxa_manutencao: [null],
      perfil_risco: [null],
      valor_minimo: [null],
      taxa_rendimento_base: [null]
    });

    this.accountForm.get('tipo_conta')?.valueChanges.subscribe(type => {
      this.setConditionalValidators(type);
    });
    this.setConditionalValidators('POUPANCA');
  }

  setConditionalValidators(type: string): void {
    const specificFields = [
      'taxa_rendimento', 'ultimo_rendimento', 'limite', 'data_vencimento',
      'taxa_manutencao', 'perfil_risco', 'valor_minimo', 'taxa_rendimento_base'
    ];

    specificFields.forEach(field => {
      const control = this.accountForm.get(field);
      control?.clearValidators();
      control?.updateValueAndValidity();
      control?.markAsPristine();
      control?.markAsUntouched();
    });

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
    this.accountForm.updateValueAndValidity();
  }

  loadDependencies(): void {
    this.usuarioService.getAllUsuarios().subscribe({
      next: (data) => {
        this.usuariosClientes = data.filter(u => u.tipoUsuario === 'CLIENTE');
        console.log('DEBUG: Clientes carregados (filtrados):', this.usuariosClientes);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.errorMessage = error.error?.message || 'Erro ao carregar clientes. Verifique o backend.';
      }
    });

    this.agenciaService.getAllAgencias().subscribe({
      next: (data) => {
        this.agencias = data;
        console.log('DEBUG: Agências carregadas (direto do backend):', this.agencias);
      },
      error: (error) => {
        console.error('Erro ao carregar agências:', error);
        this.errorMessage = error.error?.message || 'Erro ao carregar agências. Verifique o backend.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    console.log('DEBUG: Tentativa de submissão do formulário.');
    console.log('DEBUG: Status completo do formulário:', this.accountForm.status);
    console.log('DEBUG: Valor completo do formulário:', this.accountForm.value);

    if (this.accountForm.invalid) {
      console.log('DEBUG: Formulário é inválido. Erros por controle:');
      Object.keys(this.accountForm.controls).forEach(key => {
        const control = this.accountForm.get(key);
        console.log(`  Controle: ${key}, Valor: ${control?.value}, Válido: ${control?.valid}, Erros:`, control?.errors);
      });
    }

    if (this.accountForm.valid) {
      const rawFormData = this.accountForm.value;

      const selectedClient = this.usuariosClientes.find(client => client.id_usuario === rawFormData.id_cliente);
      if (!selectedClient || !selectedClient.cpf) {
        this.errorMessage = 'CPF do cliente não encontrado. Selecione um cliente válido.';
        return;
      }

      let dadosEspecificos: any = {};
      const tipoConta = rawFormData.tipo_conta;

      if (tipoConta === 'POUPANCA') {
        dadosEspecificos = {
          taxaRendimento: rawFormData.taxa_rendimento
        };
      } else if (tipoConta === 'CORRENTE') {
        dadosEspecificos = {
          limite: rawFormData.limite,
          dataVencimento: rawFormData.data_vencimento,
          taxaManutencao: rawFormData.taxa_manutencao
        };
      } else if (tipoConta === 'INVESTIMENTO') {
        dadosEspecificos = {
          perfilRisco: rawFormData.perfil_risco,
          valorMinimo: rawFormData.valor_minimo,
          taxaRendimentoBase: rawFormData.taxa_rendimento_base
        };
      }

      const payload = {
        cpfCliente: selectedClient.cpf,
        idAgencia: rawFormData.id_agencia,
        tipoConta: tipoConta,
        saldo: rawFormData.saldo,
        dadosEspecificos: dadosEspecificos
      };

      console.log('DEBUG: Payload FINAL para o backend:', payload);

      this.contaService.createConta(payload).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Conta criada com sucesso!';
          console.log('Conta criada:', response);
          this.accountForm.reset({ tipo_conta: 'POUPANCA', saldo: 0 });
          this.setConditionalValidators('POUPANCA');
        },
        error: (error) => {
          console.error('Erro ao criar conta:', error);
          this.errorMessage = error.error?.message || 'Falha ao criar conta. Verifique os dados e permissões.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      this.accountForm.markAllAsTouched();
    }
  }
}