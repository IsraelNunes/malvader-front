import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgenciaService } from '../../services/agencia.service';

@Component({
  selector: 'app-cadastro-agencia-form',
  templateUrl: './cadastro-agencia-form.component.html',
  styleUrls: ['./cadastro-agencia-form.component.scss']
})
export class CadastroAgenciaFormComponent implements OnInit {
  agenciaForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private agenciaService: AgenciaService
  ) { }

  ngOnInit(): void {
    this.initAgenciaForm();
  }

  /**
   * Inicializa a estrutura do formulário reativo para cadastro de agência,
   * contendo EXATAMENTE os campos do JSON fornecido.
   */
  initAgenciaForm(): void {
    this.agenciaForm = this.fb.group({
      // Dados da Agência (do JSON)
      nome: ['', Validators.required],
      codigoAgencia: ['', Validators.required], 

      // Dados do Endereço (do JSON)
      cep: ['', Validators.required],
      local: ['', Validators.required], // Reintegrado
      numeroCasa: [null, [Validators.required, Validators.min(1)]], 
      bairro: ['', Validators.required], // Reintegrado
      cidade: ['', Validators.required], // Reintegrado
      estado: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]], // Reintegrado
      complemento: [''] // Reintegrado (Opcional no JSON)
    });
  }

  /**
   * Manipula a submissão do formulário de criação de agência.
   * O payload é construído EXATAMENTE conforme o JSON fornecido.
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.agenciaForm.valid) {
      const rawFormData = this.agenciaForm.value;
      console.log('DEBUG: Raw agency form data (strict JSON):', rawFormData);

      // Constrói o payload para o objeto 'agencia' (1:1 com o JSON)
      const payloadAgencia = {
        nome: rawFormData.nome,
        codigoAgencia: rawFormData.codigoAgencia
      };

      // Constrói o payload para o objeto 'endereco' (1:1 com o JSON)
      const payloadEndereco = {
        cep: rawFormData.cep,
        local: rawFormData.local,
        numeroCasa: rawFormData.numeroCasa,
        bairro: rawFormData.bairro,
        cidade: rawFormData.cidade,
        estado: rawFormData.estado,
        complemento: rawFormData.complemento || null // Garante null se vazio
      };

      // Constrói o payload FINAL no formato { "agencia": {...}, "endereco": {...} }
      const finalPayload = {
        agencia: payloadAgencia,
        endereco: payloadEndereco
      };

      console.log('DEBUG: FINAL Payload for creating AGENCY (strict JSON):', finalPayload);

      this.agenciaService.createAgencia(finalPayload).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Agência cadastrada com sucesso!';
          console.log('Agency registered:', response);
          this.agenciaForm.reset();
        },
        error: (error) => {
          console.error('Error registering agency:', error);
          this.errorMessage = error.error?.message || 'Falha ao cadastrar agência.';
          // A mensagem abaixo é um lembrete do problema de incompatibilidade com o backend
          // this.errorMessage += " (Verifique logs do backend: campos de endereço podem ser obrigatórios.)";
        }
      });
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      this.agenciaForm.markAllAsTouched();
      console.log('DEBUG: Invalid agency form. Errors per control:');
      Object.keys(this.agenciaForm.controls).forEach(key => {
        const controlErrors = this.agenciaForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('DEBUG: Errors in field ' + key + ':', controlErrors);
        }
      });
    }
  }
}
