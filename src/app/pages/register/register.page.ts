import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApisService } from 'src/providers/apis/apis';
import { GlobalProvider } from 'src/providers/globals/globals';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
})
export class RegisterPage {

  constructor(
    private router: Router,
    private apis: ApisService,
    public menuCtrl: MenuController,
    public global: GlobalProvider,
  ) {
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    let params = {
      name: form.value.name,
      email: form.value.email,
      mobile: form.value.mobileNo,
      password: form.value.password,
      c_password: form.value.confirmPass
    }

    this.apis.signup(params).subscribe((resData: any) => {
      console.log('Server Response:::::::', resData);
      if (resData.status) {
        this.global.showMsg(resData.message);
        this.router.navigateByUrl('/login');
      } else {
        this.global.showError(resData.message);
      }
    });
  }

}
