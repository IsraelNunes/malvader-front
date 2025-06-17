import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuncionarioService } from '../../services/funcionario.service';
import { UsuarioService } from '../../services/usuario.service';

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

  initUsuarioForm(): void {
    this.usuarioForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      data_nascimento: ['', Validators.required], // Campo de data
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      
      cargo: ['ESTAGIARIO'], // Cargo padrão, visível se for 'funcionario'
      scoreCredito: [0, Validators.min(0)] // Score, visível se for 'cliente'
    });

    // Limpeza de validadores e controle de exibição com base no tipoCadastro
    if (this.tipoCadastro === 'funcionario') {
        this.usuarioForm.get('cargo')?.setValidators(Validators.required);
        this.usuarioForm.removeControl('scoreCredito');
    } else { // cliente
        this.usuarioForm.get('cargo')?.clearValidators();
        this.usuarioForm.removeControl('cargo'); // Remove o control 'cargo' para cliente
    }
    this.usuarioForm.get('cargo')?.updateValueAndValidity();
    this.usuarioForm.get('scoreCredito')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.usuarioForm.valid) {
      const rawFormData = this.usuarioForm.value;
      console.log(`DEBUG: Dados RAW do formulário:`, rawFormData);

      // --- FORMATAR data_nascimento para YYYY-MM-DD ---
      let formattedDataNascimento = rawFormData.data_nascimento;
      if (rawFormData.data_nascimento) { // Apenas se houver valor
        const date = new Date(rawFormData.data_nascimento);
        // Garante o formato YYYY-MM-DD
        formattedDataNascimento = date.toISOString().slice(0, 10);
      }
      // --- FIM DA FORMATAÇÃO DA DATA ---

      // Constrói o payload para 'usuario'
      const payloadUsuario = {
        nome: rawFormData.nome,
        cpf: rawFormData.cpf,
        email: rawFormData.email,
        data_nascimento: formattedDataNascimento, // Usa a data formatada
        telefone: rawFormData.telefone,
        senha: rawFormData.senha
      };
      
      // Lógica de submissão
      if (this.tipoCadastro === 'cliente') {
        const clientePayload = {
          usuario: payloadUsuario,
          cliente: {
            scoreCredito: rawFormData.scoreCredito
          }
        };
        console.log('DEBUG: Payload FINAL para criar CLIENTE:', clientePayload);

        this.usuarioService.createUsuario(clientePayload).subscribe({
          next: (response) => {
            this.successMessage = response.message || 'Cliente cadastrado com sucesso!';
            console.log('Cliente cadastrado:', response);
            this.usuarioForm.reset({ scoreCredito: 0 }); // Reseta o form, mantendo score padrão
          },
          error: (error) => {
            console.error('Erro ao cadastrar cliente:', error);
            this.errorMessage = error.error?.message || 'Falha ao cadastrar cliente.';
          }
        });
      } else if (this.tipoCadastro === 'funcionario') {
        const funcionarioPayload = {
          usuario: payloadUsuario,
          funcionario: {
            cargo: rawFormData.cargo
          }
        };
        console.log('DEBUG: Payload FINAL para criar FUNCIONARIO:', funcionarioPayload);

        this.funcionarioService.create(funcionarioPayload).subscribe({
          next: (response) => {
            this.successMessage = response.message || 'Funcionário cadastrado com sucesso!';
            console.log('Funcionário cadastrado:', response);
            this.usuarioForm.reset({ cargo: 'ESTAGIARIO' }); // Reseta o form, mantendo cargo padrão
          },
          error: (error) => {
            console.error('Erro ao cadastrar funcionário:', error);
            this.errorMessage = error.error?.message || 'Falha ao cadastrar funcionário.';
          }
        });
      }
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      this.usuarioForm.markAllAsTouched();
      Object.keys(this.usuarioForm.controls).forEach(key => {
        const controlErrors = this.usuarioForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('DEBUG: Erros no campo ' + key + ':', controlErrors);
        }
      });
    }
  }
}
