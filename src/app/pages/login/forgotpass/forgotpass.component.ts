import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { ApisService } from 'src/providers/apis/apis';
import { GlobalProvider } from 'src/providers/globals/globals';

@Component({
  selector: 'app-forgotpass',
  templateUrl: './forgotpass.component.html',
  styleUrls: ['./forgotpass.component.scss'],
})
export class ForgotpassComponent implements OnInit {
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    public apis: ApisService,
    private global: GlobalProvider
  ) { }

  ngOnInit() { }

  setNewPassword(email: string) {
    // this.apis.forgotPasswordApi();
    this.isLoading = true;

    this.loadingCtrl.create({ keyboardClose: true, message: 'Setting new password...' })
      .then(loadingEl => {
        loadingEl.present();
        this.apis.setPassword(email)
          .subscribe((resData: any) => {
            console.log(resData);
            loadingEl.dismiss();
            if (resData.status) {
              this.global.showMsg(resData.message);
            } else {
              this.global.showError(resData.message);
            }
          }, errRes => {
            console.log(errRes);
            this.isLoading = false;
            loadingEl.dismiss();
          });
      });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    this.setNewPassword(email);
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

}
