import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { GlobalProvider } from 'src/providers/globals/globals';
import { ApisService } from 'src/providers/apis/apis';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.page.html',
  styleUrls: ['./dev.page.scss'],
})
export class DevPage implements OnInit {
  public currentUser: any = {};
  isVerified: any = {};
  mySubscription: Subscription;

  constructor(
    private router: Router,
    private androidPermissions: AndroidPermissions,
    private platform: Platform,
    private storage: Storage,
    private global: GlobalProvider,
    public apis: ApisService
  ) {
    this.currentUser = this.global.currentUser;
    platform.ready().then(() => {
      
      // this.userVerification();
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );
      androidPermissions.requestPermissions(
        [
          androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
          androidPermissions.PERMISSION.CAMERA,
          androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
          androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
          androidPermissions.PERMISSION.RECORD_AUDIO
        ]
      );
    });
  }

  ngOnInit() {
    this.apis.userVerified(this.currentUser.id).subscribe((result: any) => {
      console.log(result);
      this.isVerified = result;
    });
    
    setTimeout(() => {
      if (this.isVerified.status) {
        console.log('redirect to home::::');
        this.router.navigateByUrl('/home');
      } else {
        this.global.showMsg(this.isVerified.message);
        this.userVerification();
      } 
    }, 3000);
  }

  userVerification() {
    this.mySubscription = interval(30000).subscribe(x => {
      this.apis.userVerified(this.currentUser.id).subscribe((result: any) => {
        console.log(result);
        this.isVerified = result;
        if (this.isVerified.message === 'You account is verified.') {
          this.router.navigateByUrl('/home');
          this.mySubscription.unsubscribe();
        }
      });
    });
  }

  ionViewWillEnter() {
  }
}
