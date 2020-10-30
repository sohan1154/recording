import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController, Platform } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx'
import { BehaviorSubject, Observable } from 'rxjs';

export enum ConnectionStatus {
  Online,
  Offline
}
/*
  Generated class for the Global Provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalProvider {

  public language: string = 'en';
  public footermsg: boolean = false;
  public networkStatus: boolean = true;
  public fmsg: string;
  public classcolor: string;
  public loading: any;
  public currentUser: any;

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);


  constructor(
    public loadingCtrl: LoadingController,
    public plt: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private network: Network
  ) {
    this.plt.ready().then(() => {
      this.initializeNetworkEvents();
      let status =  this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    });
  }
  
  async setCurrentUser(user: any) {
    this.currentUser = user;
  }

  async showMsg(error: any) {

    let message;

    if (typeof error === 'object')
      message = error.message;
    else
      message = error;

    const alert = await this.alertCtrl.create({
      header: 'Alert',
      //subHeader: 'Subtitle',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async showError(error: any) {

    let message;

    if (typeof error === 'object')
      message = error.message;
    else
      message = error;

    let alert = await this.alertCtrl.create({
      subHeader: 'Fail',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async showCaution(error: any) {

    let message;

    if (typeof error === 'object')
      message = error.message;
    else
      message = error;

    let alert = await this.alertCtrl.create({
      subHeader: 'Caution',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentAlertConfirm(message, callback) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            callback(1, 0);
          }
        }, {
          text: 'Confirm',
          handler: () => {
            callback(0, 1);
          }
        }
      ]
    });

    await alert.present();
  }

  async showloading() {
    
    return await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 30000,
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
      });
    });
  }

  async hideloading() {
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  // async presentTrueToast(msg) {
  //   let toast = await this.toastCtrl.create({
  //     message: msg,
  //     duration: 5000,
  //     cssClass: "trueToast",
  //     showCloseButton: true,
  //     closeButtonText: 'OK',
  //     position: 'bottom',
  //     dismissOnPageChange: false
  //   });

  //   toast.onDidDismiss(() => {
  //     console.log('Dismissed true toast');
  //   });

  //   await toast.present();
  // }

  // presentFalseToast(msg) {
  //   let toast = await this.toastCtrl.create({
  //     message: msg,
  //     duration: 5000,
  //     cssClass: "falseToast",
  //     showCloseButton: true,
  //     closeButtonText: 'Cancel',
  //     position: 'bottom',
  //     dismissOnPageChange: false
  //   });

  //   toast.onDidDismiss(() => {
  //     console.log('Dismissed false toast');
  //   });

  //   await toast.present();
  // }

  // presentInfoToast(msg) {
  //   let toast = await this.toastCtrl.create({
  //     message: msg,
  //     duration: 3000,
  //     cssClass: "infoToast",
  //     position: 'middle',
  //     dismissOnPageChange: false
  //   });

  //   toast.onDidDismiss(() => {
  //     console.log('Dismissed info toast');
  //   });

  //   await toast.present();
  // }

  // public exitApp() {
  //   let alert = await this.alertCtrl.create({
  //     title: 'Confirm Exit',
  //     message: 'Are you sure you want to exit?',
  //     cssClass: 'myExitApp',
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: () => {
  //           console.log('Cancel clicked');
  //         }
  //       },
  //       {
  //         text: 'OK',
  //         handler: () => {
  //           this.plt.exitApp(); //Exit from app
  //         }
  //       }
  //     ]
  //   });

  //   await alert.present();
  // }

  public matchingPasswords(passwordKey, confirmPasswordKey) {
    return (group): { [key: string]: any } => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];

      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

 
  public initializeNetworkEvents() {
 
    this.network.onDisconnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Online) {
        console.log('WE ARE OFFLINE');
        this.updateNetworkStatus(ConnectionStatus.Offline);
      }
    });
 
    this.network.onConnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Offline) {
        console.log('WE ARE ONLINE');
        this.updateNetworkStatus(ConnectionStatus.Online);
      }
    });
  }
 
  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);
 
    let connection = status == ConnectionStatus.Offline ? 'Offline' : 'Online';
    let toast = this.toastCtrl.create({
      message: `You are now ${connection}`,
      duration: 3000,
      position: 'bottom'
    });
    toast.then(toast => toast.present());
  }
 
  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }
 
  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }

}


