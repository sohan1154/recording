import { Component } from '@angular/core';
import { GlobalProvider } from "../../../providers/globals/globals";
import { ApisService } from "../../../providers/apis/apis";

import { Platform, MenuController, ModalController, AlertController } from '@ionic/angular';

import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { CandidateInfoComponent } from './candidate-info/candidate-info.component';

import { Network } from '@ionic-native/network/ngx';
import { Storage } from '@ionic/storage';

import { BehaviorSubject } from 'rxjs';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

export enum ConnectionStatus {
  Online,
  Offline
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  recording: boolean = false;
  filePath: string;
  fileName: string;
  audio: MediaObject;
  audioList: any[] = [];
  fileExtension: string;
  userId;
  candidate_name: string;
  candidate_email: string;
  candidate_mobile: string;
  recording_datetime = null;
  recording_duration;
  address: string;
  lat;
  lon;

  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
  recordingTimer: any = 0;
  time: number = 0;
  timerDisplay: any;
  interval;
  seconds = 0 + '' + 0;
  minutes = 0 + '' + 0;
  hours = 0 + '' + 0;

  showToggle: boolean = true;
  isPaused: boolean = false;
  recording_start_datetime;
  recording_end_datetime;

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);

  constructor(
    private media: Media,
    private file: File,
    private platform: Platform,
    public menuCtrl: MenuController,
    public global: GlobalProvider,
    public apis: ApisService,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private network: Network,
    private storage: Storage,
    private androidPermissions: AndroidPermissions
  ) {

  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    this.getAudioList();
  }

  getCurrentUser() {
    this.userId = this.global.currentUser.id;
    console.log(this.userId);
  }

  getAudioList() {
    if (localStorage.getItem("audiolist")) {
      this.audioList = JSON.parse(localStorage.getItem("audiolist"));
      console.log(this.audioList);
    }
  }

  getGeolocation() {
    console.log("getGeolocation is called::::");
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lon = resp.coords.longitude;
      console.log('latitude::::::', this.lat);
      console.log('longitude::::::', this.lon);
      this.getGeoencoder(this.lat, this.lon);
    }).catch((error) => {
      console.log("error",JSON.stringify(error));
      // alert('Error getting location' + JSON.stringify(error));
    });
  }

  getGeoencoder(latitude: number, longitude: number) {
    this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.address = this.generateAddress(result[0]);
        console.log(this.address);
      })
      .catch((error: any) => {
        console.log("error",JSON.stringify(error));
        //alert('Error getting location' + JSON.stringify(error));
      });
  }

  generateAddress(addressObj) {
    let obj = [];
    let address = "";
    for (let key in addressObj) {
      obj.push(addressObj[key]);
    }
    obj.reverse();
    for (let val in obj) {
      if (obj[val].length)
        address += obj[val] + ', ';
    }
    return address.slice(0, -2);
  }

  getCandidateInfo() {
    this.modalCtrl
      .create({ component: CandidateInfoComponent })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then(resultData => {
        this.candidate_name = resultData.data.name;
        this.candidate_email = resultData.data.email;
        this.candidate_mobile = resultData.data.mobile;
        this.startRecord();
        console.log(resultData.data);
      });
  }

  startRecord() {
    // if (this.platform.is('ios')) {
    //   this.filePath = this.file.documentsDirectory;
    //   this.fileExtension = '.m4a';
    // } else if (this.platform.is('android')) {
    //   this.filePath = this.file.externalDataDirectory;
    //   this.fileExtension = '.mp3';
    // }
    this.recording_start_datetime = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + '-' + new Date().getHours() + '-' + new Date().getMinutes() + '-' + new Date().getSeconds();
    console.log("this.recording_start_datetime:::", this.recording_start_datetime);
    this.filePath = this.file.externalDataDirectory;
    this.fileExtension = '.mp3';

    this.fileName = 'recording' + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds() + this.fileExtension;

    this.getCurrentUser();
    this.getGeolocation();
    this.startTimer();
    console.log("start Recording::::");
    // if (this.filePath) {
    this.file.createFile(this.filePath, this.fileName, true).then((entry: FileEntry) => {
      this.audio = this.media.create(entry.toInternalURL());
      this.audio.startRecord();
      this.recording = true;
    });

    this.storage.set('fileInfo', { fileName: this.fileName, filePath: this.filePath });
    // }

    // if (this.platform.is('ios')) {
    //   this.fileName = 'record' + new Date().getDate() + new Date().getMonth() + new Date().getFullYear() + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds()+'.mp3';
    //   this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + this.fileName;
    //   this.audio = this.media.create(this.filePath);
    // } else if (this.platform.is('android')) {
    //   this.fileName = 'record' + new Date().getDate() + new Date().getMonth() + new Date().getFullYear() + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds()+'.mp3';
    //   this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + this.fileName;
    //   this.audio = this.media.create(this.filePath);
    // }
    // this.audio.startRecord();
    // this.recording = true;
  }

  startTimer() {
    console.log("startTimer is called::::");
    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.time++;
        this.timerDisplay = this.getDisplayTimer(this.time);
        this.hours = this.timerDisplay.hours.digit1 + '' + this.timerDisplay.hours.digit2;
        this.minutes = this.timerDisplay.minutes.digit1 + '' + this.timerDisplay.minutes.digit2;
        this.seconds = this.timerDisplay.seconds.digit1 + '' + this.timerDisplay.seconds.digit2;
      }
    }, 1000);
  }

  async presentConfirm() {
    const alert = await this.alertCtrl.create({
      header: 'End Recording',
      message: 'Do you want to end recording?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'ok',
          handler: () => {
            this.stopRecord();
            console.log('ok clicked');
          }
        }
      ]
    });
    await alert.present();
  }

  stopTimer() {
    clearInterval(this.interval);
    this.recording_duration = this.hours + ':' + this.minutes + ':' + this.seconds;
    console.log(this.recording_duration);
    this.time = 0;
    // this.timerDisplay = 0;
    this.hours = 0 + '' + 0;
    this.minutes = 0 + '' + 0;
    this.seconds = 0 + '' + 0;
  }

  showToggleFun() {
    if (this.showToggle == true) {
      this.showToggle = false;
      this.audio.pauseRecord();
      this.isPaused = true;
    } else {
      this.showToggle = true;
      this.audio.resumeRecord();
      this.isPaused = false;
    }
  }

  stopRecord() {
    this.recording_end_datetime = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + '-' + new Date().getHours() + '-' + new Date().getMinutes() + '-' + new Date().getSeconds();
    console.log("recording_end_datetime::::",this.recording_end_datetime)
    console.log('stop record is called ::::');
    this.audio.stopRecord();
    this.stopTimer();
    let position = this.audio.getCurrentPosition();
    console.log(position);
    let data = { filename: this.fileName };
    this.audioList.push(data);
    localStorage.setItem("audiolist", JSON.stringify(this.audioList));
    this.recording = false;
    this.getAudioList();

    console.log(this.audio.getDuration());
    // this.recording_datetime = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() + '-' + new Date().getHours() + '-' + new Date().getMinutes() + '-' + new Date().getSeconds();
    let formData: FormData = new FormData();
    console.log(this.recording_duration);
    formData.append('user_id', this.userId);
    formData.append('candidate_name', this.candidate_name);
    formData.append('candidate_email', this.candidate_email);
    formData.append('candidate_mobile', this.candidate_mobile);
    formData.append('recording_duration', this.recording_duration);
    formData.append('address', this.address);
    formData.append('lat', this.lat);
    formData.append('lon', this.lon);
    formData.append('filename', this.fileName);
    formData.append('recording_start_datetime', this.recording_start_datetime);
    formData.append('recording_end_datetime', this.recording_end_datetime);
    console.log("recording_duration:::::",formData.get('recording_duration'));
    console.log("recording_start_datetime:::::",formData.get('recording_start_datetime'));
    console.log("recording_end_datetime:::::",formData.get('recording_end_datetime'));
    console.log(formData.get('user_id'));

    this.file.readAsArrayBuffer(this.filePath, this.fileName).then((data) => {
      console.log('inside readAsArrayBuffer');

      const audioBlob = new Blob([data], { type: '.mp3' });
      formData.append('file_name', audioBlob, this.fileName);
      formData.append('filePath', this.filePath);
      let file = formData.get('file_name');
      console.log(file);
      console.log(formData);
      this.apis.updateRecordingData(formData).subscribe((resData: any) => {
        console.log(resData);
        if (resData.status) {
          this.global.showMsg(resData.message);
        }
      }, (err: any) => {
        this.global.showMsg(err);
        console.log(err);
      });
    });
    console.log('stop record function ends:::');
  }

  getDisplayTimer(time: number) {
    const hours = '0' + Math.floor(time / 3600);
    const minutes = '0' + Math.floor(time % 3600 / 60);
    const seconds = '0' + Math.floor(time % 3600 % 60);

    return {
      hours: { digit1: hours.slice(-2, -1), digit2: hours.slice(-1) },
      minutes: { digit1: minutes.slice(-2, -1), digit2: minutes.slice(-1) },
      seconds: { digit1: seconds.slice(-2, -1), digit2: seconds.slice(-1) },
    };
  }


  // playAudio(file, idx) {
  //   if (this.platform.is('ios')) {
  //     this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + file;
  //     this.audio = this.media.create(this.filePath);
  //   } else if (this.platform.is('android')) {
  //     this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + file;
  //     this.audio = this.media.create(this.filePath);
  //   }
  //   this.audio.play();
  //   this.audio.setVolume(0.8);
  // }

}
