import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuncionarioService } from '../../services/funcionario.service';
import { UsuarioService } from '../../services/usuario.service'; // Usado para criar cliente

@Component({
  selector: 'app-cadastro-usuario-form',
  templateUrl: './cadastro-usuario-form.component.html',
  styleUrls: ['./cadastro-usuario-form.component.scss']
})
export class CadastroUsuarioFormComponent implements OnInit {
  @Input() tipoCadastro: 'cliente' | 'funcionario' = 'cliente'; // Define o tipo de cadastro
  
  usuarioForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  cargosFuncionario: string[] = ['ESTAGIARIO', 'ATENDENTE', 'GERENTE'];

  constructor(
    private fb: FormBuilder,
    private funcionarioService: FuncionarioService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.initUsuarioForm();
  }

  /**
   * Inicializa a estrutura do formulário reativo.
   * CAMPOS DE ENDEREÇO ESTÃO REMOVIDOS DE ACORDO COM SUA INSTRUÇÃO ANTERIOR.
   * Se o backend exige endereço, isso causará um erro 500.
   */
  initUsuarioForm(): void {
    this.usuarioForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      data_nascimento: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      
      // Campos específicos para funcionário
      codigo_funcionario: ['', Validators.required], // <-- REINTEGRADO AQUI E AGORA OBRIGATÓRIO NO FRONT
      cargo: ['ESTAGIARIO'], 

      // Campo específico para cliente
      scoreCredito: [0, Validators.min(0)]
    });

    // Lógica para aplicar/remover validadores conforme o tipo de cadastro
    if (this.tipoCadastro === 'funcionario') {
        this.usuarioForm.get('codigo_funcionario')?.setValidators(Validators.required); // Garante que é obrigatório para funcionário
        this.usuarioForm.get('cargo')?.setValidators(Validators.required);
        this.usuarioForm.removeControl('scoreCredito'); // Remove o controle de score para funcionário
    } else { // cliente
        this.usuarioForm.get('codigo_funcionario')?.clearValidators(); // Não obrigatório para cliente
        this.usuarioForm.removeControl('codigo_funcionario'); // Remove o controle de código para cliente
        this.usuarioForm.get('cargo')?.clearValidators();
        this.usuarioForm.removeControl('cargo'); // Remove o controle de cargo para cliente
    }
    // Atualiza a validade de todos os controles impactados
    this.usuarioForm.get('codigo_funcionario')?.updateValueAndValidity();
    this.usuarioForm.get('cargo')?.updateValueAndValidity();
    this.usuarioForm.get('scoreCredito')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.usuarioForm.valid) {
      const rawFormData = this.usuarioForm.value;
      console.log(`DEBUG: Dados RAW do formulário:`, rawFormData);

      // --- FORMATAÇÃO DA DATA DE NASCIMENTO PARA YYYY-MM-DD ---
      let formattedDataNascimento = rawFormData.data_nascimento;
      if (rawFormData.data_nascimento) {
        const date = new Date(rawFormData.data_nascimento);
        formattedDataNascimento = date.toISOString().slice(0, 10);
      }
      // --- FIM DA FORMATAÇÃO DA DATA ---

      // Constrói o payload para 'usuario'
      const payloadUsuario = {
        nome: rawFormData.nome,
        cpf: rawFormData.cpf,
        email: rawFormData.email,
        data_nascimento: formattedDataNascimento,
        telefone: rawFormData.telefone,
        senha: rawFormData.senha
      };

      // Payload 'endereco' NÃO SERÁ CONSTRUÍDO AQUI (conforme sua instrução anterior de remover)
      
      // Lógica de submissão
      if (this.tipoCadastro === 'cliente') {
        const clientePayload = {
          usuario: payloadUsuario,
          cliente: { scoreCredito: rawFormData.scoreCredito }
          // ENDEREÇO NÃO INCLUÍDO NO PAYLOAD
        };
        console.log('DEBUG: Payload FINAL para criar CLIENTE:', clientePayload);

        this.usuarioService.createUsuario(clientePayload).subscribe({
          next: (response) => {
            this.successMessage = response.message || 'Cliente cadastrado com sucesso!';
            console.log('Cliente cadastrado:', response);
            this.usuarioForm.reset({ scoreCredito: 0 });
          },
          error: (error) => {
            console.error('Erro ao cadastrar cliente:', error);
            this.errorMessage = error.error?.message || 'Falha ao cadastrar cliente.';
            this.errorMessage += " (Verifique se o backend exige campos de endereço.)"; // Aviso
          }
        });
      } else if (this.tipoCadastro === 'funcionario') {
        const funcionarioPayload = {
          usuario: payloadUsuario,
          funcionario: {
            codigo_funcionario: rawFormData.codigo_funcionario, // <-- INCLUÍDO NO PAYLOAD
            cargo: rawFormData.cargo
          }
          // ENDEREÇO NÃO INCLUÍDO NO PAYLOAD
        };
        console.log('DEBUG: Payload FINAL para criar FUNCIONARIO:', funcionarioPayload);

        this.funcionarioService.create(funcionarioPayload).subscribe({
          next: (response) => {
            this.successMessage = response.message || 'Funcionário cadastrado com sucesso!';
            console.log('Funcionário cadastrado:', response);
            this.usuarioForm.reset({ cargo: 'ESTAGIARIO' });
          },
          error: (error) => {
            console.error('Erro ao cadastrar funcionário:', error);
            this.errorMessage = error.error?.message || 'Falha ao cadastrar funcionário.';
            this.errorMessage += " (Verifique se o backend exige campos de endereço.)"; // Aviso
          }
        });
      }
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      this.usuarioForm.markAllAsTouched();
      console.log('DEBUG: Formulário inválido. Erros por controle:');
      Object.keys(this.usuarioForm.controls).forEach(key => {
        const controlErrors = this.usuarioForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('DEBUG: Errors in field ' + key + ':', controlErrors);
        }
      });
    }
  }
}
