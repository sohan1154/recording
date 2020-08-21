import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { GlobalProvider, ConnectionStatus } from '../providers/globals/globals';
import { ApisService } from '../providers/apis/apis';
import { Storage } from '@ionic/storage';
import { SettingsProvider } from 'src/providers/settings/settings';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public global: GlobalProvider,
    private storage: Storage,
    public apis: ApisService,
    public navCtrl: NavController,
    private settingProvide: SettingsProvider
  ) {
    console.log('00000000000');
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.global.onNetworkChange().subscribe((status: ConnectionStatus) => {
        if (status == ConnectionStatus.Online) {
          this.settingProvide.checkForEvents();
        }
      });
      this.isLoggedIn();
    });
  }

  isLoggedIn() {
    // get user information
    this.storage.get('currentUser').then((user) => {
      console.log('##################### user:', user);

      if (user) {
        // set user information
        this.global.setCurrentUser(user);
        if (user.email && user.email !== null && user.email !== '' && user.is_verified == '1') {
          this.navCtrl.navigateRoot('/');
        } else {
          this.navCtrl.navigateRoot('/dev');
        }
      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }

}
