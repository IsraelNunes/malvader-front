// front/malvader-frontend/src/app/funcionario/cadastro-usuario-form/cadastro-usuario-form.component.ts

import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuncionarioService } from '../../services/funcionario.service';
import { UsuarioService } from '../../services/usuario.service'; // Usado para criar cliente (se backend tiver rota)
// import { ClienteService } from '../../services/cliente.service'; // Descomente se tiver um ClienteService dedicado

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
    private funcionarioService: FuncionarioService, // Para criar funcionário
    private usuarioService: UsuarioService // Para criar cliente (se a rota for por aqui)
    // private clienteService: ClienteService // Para criar cliente se tiver serviço específico
  ) { }

  ngOnInit(): void {
    this.initUsuarioForm();
  }

  initUsuarioForm(): void {
    this.usuarioForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      data_nascimento: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      
      // Campos específicos para funcionário (visíveis apenas se tipoCadastro for 'funcionario')
      // codigo_funcionario é gerado no backend, não precisa de validação aqui para criação
      cargo: ['ESTAGIARIO'] 
    });

    // Validações condicionais e ajuste de campos para tipos específicos
    if (this.tipoCadastro === 'funcionario') {
        this.usuarioForm.get('cargo')?.setValidators(Validators.required);
        // O campo 'codigo_funcionario' não é enviado pelo front, mas é bom ter o controle (mesmo sem validadores)
        this.usuarioForm.addControl('codigo_funcionario', this.fb.control('')); // Adiciona o control aqui se não existir no formGroup inicial
    } else { // cliente
        this.usuarioForm.get('cargo')?.clearValidators();
        this.usuarioForm.removeControl('codigo_funcionario'); // Remove o control se for cliente e já tiver sido adicionado
    }
    this.usuarioForm.get('cargo')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.usuarioForm.valid) {
      const rawFormData = this.usuarioForm.value;
      console.log(`Dados para ${this.tipoCadastro} para envio (RAW):`, rawFormData);

      // Construir o payload para 'usuario'
      const payloadUsuario = {
        nome: rawFormData.nome,
        cpf: rawFormData.cpf,
        email: rawFormData.email,
        data_nascimento: rawFormData.data_nascimento, // Formato "YYYY-MM-DD"
        telefone: rawFormData.telefone,
        senha: rawFormData.senha
      };
      
      // Lógica de submissão
      if (this.tipoCadastro === 'cliente') {
        const clientePayload = {
          usuario: payloadUsuario
          // Endereço não incluído aqui, conforme seu modelo de backend
        };

        // Assumindo que POST /api/clientes/criar é o endpoint e UsuarioService.createUsuario o método
        this.usuarioService.createUsuario(clientePayload).subscribe({ // Assumindo que usuarioService.createUsuario existe
          next: (response) => {
            this.successMessage = response.message || 'Cliente cadastrado com sucesso!';
            console.log('Cliente cadastrado:', response);
            this.usuarioForm.reset({ cargo: 'ESTAGIARIO' }); // Reseta o form, mantendo cargo padrão
          },
          error: (error) => {
            console.error('Erro ao cadastrar cliente:', error);
            this.errorMessage = error.error?.message || 'Falha ao cadastrar cliente.';
          }
        });
      } else if (this.tipoCadastro === 'funcionario') {
        // Construir o payload para 'funcionario' (cargo)
        const payloadFuncionario = {
          cargo: rawFormData.cargo
          // codigo_funcionario é gerado no backend
          // id_supervisor pode ser nulo ou ter uma lógica separada
        };

        const funcionarioPayload = {
          usuario: payloadUsuario,
          funcionario: payloadFuncionario
          // Endereço não incluído aqui
        };

        this.funcionarioService.create(funcionarioPayload).subscribe({
          next: (response) => {
            this.successMessage = response.message || 'Funcionário cadastrado com sucesso!';
            console.log('Funcionário cadastrado:', response);
            this.usuarioForm.reset({ cargo: 'ESTAGIARIO' });
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
    }
  }
}