// front/malvader-frontend/src/app/auth/auth.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // <-- Certifique-se que está importado
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component'; // <-- Certifique-se que está importado


@NgModule({
  declarations: [
    LoginComponent,
    OtpVerificationComponent // <-- E aqui, está declarado
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, // <-- E aqui, no array imports
    RouterModule
  ]
})
export class AuthModule { }