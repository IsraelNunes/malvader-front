import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { OtpVerificationComponent } from './auth/otp-verification/otp-verification.component'; // <-- Importe
import { funcionarioGuard } from './guards/funcionario.guard';
import { clienteGuard } from './guards/cliente.guard';

// Importa os componentes de Dashboard
import { DashboardComponent as FuncionarioDashboardComponent } from './funcionario/dashboard/dashboard.component';
import { DashboardComponent as ClienteDashboardComponent } from './cliente/dashboard/dashboard.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'verificar-otp', component: OtpVerificationComponent }, // <-- Nova rota para verificação de OTP
  {
    path: 'funcionario/dashboard',
    component: FuncionarioDashboardComponent,
    canActivate: [funcionarioGuard],
  },
  {
    path: 'cliente/dashboard',
    component: ClienteDashboardComponent,
    canActivate: [clienteGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }