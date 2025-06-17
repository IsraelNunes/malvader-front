import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Importar os componentes necessários
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ListEntitiesComponent } from './list-entities/list-entities.component';
import { CadastroUsuarioFormComponent } from './cadastro-usuario-form/cadastro-usuario-form.component';
import { CadastroAgenciaFormComponent } from './cadastro-agencia-form/cadastro-agencia-form.component'; // <-- Importe esta linha


@NgModule({
  declarations: [
    DashboardComponent,
    CreateAccountComponent,
    ListEntitiesComponent,
    CadastroUsuarioFormComponent,
    CadastroAgenciaFormComponent // <-- Declare este componente aqui
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class FuncionarioModule { }
