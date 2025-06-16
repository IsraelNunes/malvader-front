// front/malvader-frontend/src/app/funcionario/funcionario.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; // Necessário para formulários

// Importar os componentes gerados
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateAccountComponent } from './create-account/create-account.component'; // <-- Importar
import { ListEntitiesComponent } from './list-entities/list-entities.component';   // <-- Importar
import { CreateFuncionarioComponent } from './create-funcionario/create-funcionario.component';
import { CadastroUsuarioFormComponent } from './cadastro-usuario-form/cadastro-usuario-form.component'; // <-- Importar


@NgModule({
  declarations: [
    DashboardComponent,
    CreateAccountComponent, // <-- Declarar
    ListEntitiesComponent,  // <-- Declarar
    CreateFuncionarioComponent, CadastroUsuarioFormComponent // <-- Declarar
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule // <-- Confirmar que está aqui
  ]
})
export class FuncionarioModule { }