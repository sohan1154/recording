import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ApisService } from 'src/providers/apis/apis';
import { GlobalProvider } from 'src/providers/globals/globals';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.scss'],
})
export class ChangePassComponent implements OnInit {
  isLoading = false;
  userId: any;
  public currentUser: any = {};

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private storage: Storage,
    private apis: ApisService,
    public global: GlobalProvider
  ) { 
    this.currentUser = this.global.currentUser;
    this.userId = this.currentUser.id;
  }

  ngOnInit() {}

  setChangedPassword(params) {
    this.isLoading = true;

    this.loadingCtrl.create({keyboardClose: true, message: 'Changing new password...'})
    .then(loadingEl => {
      loadingEl.present();
      this.apis.changePassword(params)
        .subscribe((resData: any) => {
          console.log(resData);
          if (resData.status) {
            this.global.showMsg(resData.message);
            this.modalCtrl.dismiss();
          } else {
            this.global.showMsg(resData.message);
          }
        }, errRes => {
          console.log(errRes);
          this.isLoading = false;
          loadingEl.dismiss();
        });
      loadingEl.dismiss();  
    });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    let params = {
      current_password: form.value.oldPassword,
      password: form.value.password,
      confirm_password: form.value.confirmPassword,
      user_id: this.currentUser.id
    }

    this.setChangedPassword(params);
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

}
