import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { HttpClientModule } from '@angular/common/http';
import { CandidateInfoComponent } from './candidate-info/candidate-info.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: HomePage }]),
    HttpClientModule,
    ReactiveFormsModule
  ],
  declarations: [HomePage, CandidateInfoComponent],
  entryComponents: [CandidateInfoComponent]
})
export class HomePageModule {}
