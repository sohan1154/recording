import { Component } from '@angular/core';
import { GlobalProvider } from '../../../providers/globals/globals';
import { ApisService } from '../../../providers/apis/apis';
import { Storage } from '@ionic/storage';
import { NgForm, FormGroup } from '@angular/forms';
import { NavController, ModalController, LoadingController, AlertController, MenuController, Events } from '@ionic/angular';
import { TermsComponent } from '../terms/terms.component';
import { Router } from '@angular/router';
import { ForgotpassComponent } from './forgotpass/forgotpass.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginform: FormGroup;
  isLoading = false;
  constructor(
    public global: GlobalProvider,
    private storage: Storage,
    public apis: ApisService,
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router,
    public menuCtrl: MenuController,
    public events: Events
  ) {
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  authenticate(params) {
    this.isLoading = true;
    this.loadingCtrl.create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingEl => {
        loadingEl.present();
        this.apis.login(params).subscribe((resData: any) => {
          console.log(resData);
          loadingEl.dismiss();
          if (resData.status) {
            this.storage.set('currentUser', resData.user);
            this.global.setCurrentUser(resData.user);
            this.events.publish('currentUser');
            this.router.navigateByUrl('/dev');
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
    const password = form.value.password;
    console.log(email, password);
    let params = {
      email: form.value.email,
      password: form.value.password
    }
    this.authenticate(params);
  }


  forgotPassword() {
    this.modalCtrl
      .create({ component: ForgotpassComponent })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      });
  }

  termsAndCond() {
    this.modalCtrl
      .create({ component: TermsComponent })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      });
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication Failed!',
        message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
