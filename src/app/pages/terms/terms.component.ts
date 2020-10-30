import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApisService } from 'src/providers/apis/apis';
import { GlobalProvider } from 'src/providers/globals/globals';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit {
  private pageContent: any = {};
  constructor(
    private modalCtrl: ModalController,
    private apis: ApisService,
    private global: GlobalProvider
    ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.apis.fetchTerms('terms-of-use').subscribe((resData:any) => {
      if (resData.status) {
        this.pageContent = resData.data;
      } else {
        this.global.showError(resData.message);
      }
    });
  }
  
  selectTerms() {
    this.modalCtrl.dismiss({message: 'You have accepted our Terms and Conditions'}, 'confirm');
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

}
