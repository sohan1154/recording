import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalProvider, ConnectionStatus } from '../../providers/globals/globals';
import { SettingsProvider } from '../../providers/settings/settings';
import { Observable, from } from 'rxjs';
import { tap, map, catchError, timeout } from "rxjs/operators";
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';
import { Subscription } from 'rxjs';

/*
  Generated class for the Apis Service Provider.

  See https://angular.io/guide/dependency-injection for more info on APIs service providers
  and Angular DI.
*/

const API_STORAGE_KEY = 'specialkey';

@Injectable()
export class ApisService {

  baseUrl = 'http://eruditeassociates.com/recording/api/';

  private headers: any;
  connectSubscription: Subscription;
  private timeout: number = (30 * 1000);

  constructor(
    public http: HttpClient,
    public global: GlobalProvider,
    private storage: Storage,
    private settingService: SettingsProvider,
    private network: Network
  ) {
    console.log('APIs service provider is called');
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      this.settingService.checkForEvents().subscribe((resData: any) => {
        console.log('checkForEvents called!');
        console.log(resData);
      });
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    });

    // set defaul headers
    this.headers = new HttpHeaders();
    this.headers.set('Content-Type', 'application/json');
  }

  fetchTerms(page_slug) {
    return this.http.get(this.baseUrl + 'pages?page_slug=' + page_slug);
  }

  signup(params: any) {
    return this.http.post(this.baseUrl + 'register', params);
  }

  login(params) {
    // const mobile = Number(email);
    // if (isNumeric(email)) {
    //   return this.http.post('' , { mobile, password });
    // } else {
    return this.http.post(this.baseUrl + 'login', params);
    // }
  }

  setPassword(email: string) {
    return this.http.post(this.baseUrl + 'forgot-password', { email });
  }

  updateProfile(params: any) {
    return this.http.post(`${this.baseUrl}users/update-profile`, params);
  }

  changePassword(params: any) {
    return this.http.post(`${this.baseUrl}users/change-password`, params);
  }

  updatedPic(params: any) {
    return this.http.post(`${this.baseUrl}users/upload-profile-image`, params);
  }

  uploadRecordingData(formData: any) {
    return this.http.post(`${this.baseUrl}audiofiles`, formData);
  }


  getUsers(forceRefresh: boolean = false): Observable<any[]> {
    if (this.global.getCurrentNetworkStatus() === ConnectionStatus.Offline || !forceRefresh) {
      // Return the cached data from Storage
      return from(this.getLocalData('users'));
    } else {
      // Just to get some "random" data
      let page = Math.floor(Math.random() * Math.floor(6));

      // Return real API data and store it locally
      return this.http.get(`${this.baseUrl}`).pipe(
        map(res => res['data']),
        tap(res => {
          this.setLocalData('users', res);
        })
      )
    }
  }

  updateRecordingData(data): Observable<any> {
    let url = `${this.baseUrl}audiofiles`;
    if (this.global.getCurrentNetworkStatus() === ConnectionStatus.Offline) {
      console.log('updateRecordingData offline is called.');
      console.log(data.getAll('user_id'));
      return from(this.settingService.storeRequest(url, 'POST', data));
    } else {
      console.log('updateRecordingData online is called.');
      console.log(data.getAll('user_id'));
      return this.http.post(url, data).pipe(
        catchError(err => {
          console.log('updateRecordingData online is called.');
          this.settingService.storeRequest(url, 'POST', data);
          throw new Error(err);
        })
      );
    }
  }

  userVerified(id) {
    return this.http.get(`${this.baseUrl}is-verified/${id}`).pipe(timeout(this.timeout));;
  }

  // Save result of API requests
  private setLocalData(key, data) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }

  // Get cached API result
  private getLocalData(key) {
    return this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }

  ngOndestroy() {
    this.connectSubscription.unsubscribe();
  }
}
