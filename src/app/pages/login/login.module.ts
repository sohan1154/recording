import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login.page';
import { TermsComponent } from '../terms/terms.component';
import { ForgotpassComponent } from './forgotpass/forgotpass.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: LoginPage
      }
    ]),
    ReactiveFormsModule
  ],
  declarations: [LoginPage, TermsComponent, ForgotpassComponent],
  entryComponents: [TermsComponent, ForgotpassComponent]
})
export class LoginPageModule {}
