import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { GlobalProvider } from "../providers/globals/globals";
import { ApisService } from "../providers/apis/apis";
import { SideMenuComponent } from './components/side-menu/side-menu.component';

import { Camera } from '@ionic-native/Camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

import { Media } from '@ionic-native/media/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

import { Network } from '@ionic-native/network/ngx';
import { SettingsProvider } from 'src/providers/settings/settings';

import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
 
// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [AppComponent, SideMenuComponent],
  entryComponents: [],
  imports: [
    IonicStorageModule.forRoot({
      name: '__trucksingh',
      driverOrder: ['sqlite', 'indexeddb', 'websql']
    }),
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    GlobalProvider,
    ApisService,
    SettingsProvider,
    Camera,
    File,
    WebView,
    FilePath,
    Media,
    MediaCapture,
    Geolocation,
    NativeGeocoder,
    Network,
    NativeStorage,
    AndroidPermissions
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
