// front/malvader-frontend/src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module'; // <-- Importe aqui
import { AppComponent } from './app.component';
import { ClienteModule } from './cliente/cliente.module';
import { FuncionarioModule } from './funcionario/funcionario.module';
import { AuthModule } from './auth/auth.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // <-- Adicione/Confirme que está aqui
    ReactiveFormsModule,
    AuthModule,
    FuncionarioModule,
    ClienteModule
  ],
  providers: [
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }