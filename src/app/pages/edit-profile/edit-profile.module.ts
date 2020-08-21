import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditProfilePageRoutingModule } from './edit-profile-routing.module';

import { EditProfilePage } from './edit-profile.page';
import { ChangePassComponent } from './change-pass/change-pass.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    EditProfilePageRoutingModule,
    FormsModule      
  ],
  declarations: [EditProfilePage, ChangePassComponent],
  entryComponents: [ChangePassComponent]
})
export class EditProfilePageModule {}
