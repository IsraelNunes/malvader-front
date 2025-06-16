import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';     // <-- Importe
import { ReactiveFormsModule } from '@angular/forms'; // <-- Importe

import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ListEntitiesComponent } from './list-entities/list-entities.component';


@NgModule({
  declarations: [
    DashboardComponent,
    CreateAccountComponent,
    ListEntitiesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,        // <-- Adicione
    ReactiveFormsModule  // <-- Adicione (se for usar formulários no dashboard)
  ]
})
export class FuncionarioModule { }