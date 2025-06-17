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

  initAgenciaForm(): void {
    this.agenciaForm = this.fb.group({
      nome: ['', Validators.required],
      codigoAgencia: ['', Validators.required],

      cep: ['', Validators.required],
      local: ['', Validators.required],
      numeroCasa: [null, [Validators.required, Validators.min(1)]],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
      complemento: ['']
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.agenciaForm.valid) {
      const rawFormData = this.agenciaForm.value;
      console.log('DEBUG: Raw agency form data (strict JSON):', rawFormData);

      const payloadAgencia = {
        nome: rawFormData.nome,
        codigoAgencia: rawFormData.codigoAgencia
      };

      const payloadEndereco = {
        cep: rawFormData.cep,
        local: rawFormData.local,
        numeroCasa: rawFormData.numeroCasa,
        bairro: rawFormData.bairro,
        cidade: rawFormData.cidade,
        estado: rawFormData.estado,
        complemento: rawFormData.complemento || null
      };

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