import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { Storage } from '@ionic/storage';
import { GlobalProvider } from 'src/providers/globals/globals';
import { ApisService } from 'src/providers/apis/apis';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { ActionSheetController, NavController, ModalController, MenuController, ToastController, Platform, LoadingController, Events } from '@ionic/angular';
import { WebView } from '@ionic-native/ionic-webview/ngx';

const STORAGE_KEY = 'profile_main_image';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  @ViewChild('fileBtn', {static: false}) fileBtn: {
    nativeElement: HTMLInputElement
  };
  form: FormGroup;
  images: any = [];  // Images array to store multiple image data.
  email: string = '';
  mobileNo: string = '';
  userId;
  name: string = '';
  public currentUser: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private storage: Storage,
    public global: GlobalProvider,
    public apis: ApisService,
    public menuCtrl: MenuController,
    private filePath: FilePath,
    private camera: Camera,
    private file: File,
    private webview: WebView,
    private actionSheetController: ActionSheetController,
    private plt: Platform,
    private ref: ChangeDetectorRef,
    public events: Events
    ) { 
      this.currentUser = this.global.currentUser;
      console.log(this.currentUser);
      this.email = this.currentUser.email;
      this.mobileNo = this.currentUser.mobile;
      this.userId = this.global.currentUser.id;
      this.name = this.global.currentUser.name;
    }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('profileId')) {
        this.navCtrl.navigateBack('/home');
        return;
      }
    });
    this.form = new FormGroup({
      name: new FormControl(this.name, {
        updateOn: 'blur',
        validators: [Validators.required,  Validators.min(2)]
      }),
      email: new FormControl({value: this.email, disabled: true}, {}),
      mobileNo: new FormControl(this.mobileNo, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.minLength(10), Validators.maxLength(10)]
      })
    });
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  updatedProfilePic() {
    this.fileBtn.nativeElement.click();
  }

  uploadPic(event) {
    // const files = event.target.files;
    // const image = files[0];
    // console.log(files);
    // console.log(files[0]);
    // const data = new FormData();
    // data.append('file', files[0]);
    // data.append('user_id', this.global.currentUser.id);
    // console.log(data);
    // this.apis.updatedPic(this.currentUser.id , image).subscribe(eventData => {  // Api to update profile pic
    //   console.log(eventData);
    // });
  }

  onUpdateProfile() {
    if (!this.form.valid) {
      return;
    }
    // this.form.get('Name').setValue(this.name);
    let params = {
      name: this.form.value.name,
      mobile: this.form.value.mobileNo,
      user_id: this.currentUser.id
    }
    this.loadingCtrl.create({
      message: 'Updating Profile...'
    }).then(loadingEl => {
      loadingEl.present();
      this.apis.updateProfile(params)
        .subscribe((resData: any) => {
          loadingEl.dismiss();
          console.log(resData);
          if (resData.status) {
            this.storage.set('currentUser', resData.user);
            this.global.setCurrentUser(resData.user);
            this.events.publish('currentUser');
            this.router.navigate(['/home']);
            this.global.showMsg(resData.message);
          } else {
            this.global.showMsg(resData.message);
          }
        });
      console.log(this.form);
    });
  }

  changePassword() {
    this.modalCtrl
      .create({component: ChangePassComponent})
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      });
  }

  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          let resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
      if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    });
  }

  createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    console.log('namePath:', namePath)
    console.log('currentName:', currentName)
    console.log('newFileName:', newFileName)
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
    }, error => {
      this.global.showMsg('Error while storing file.');
    });
  }

  updateStoredImages(name) {
    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      // if (!arr) {
      let newImages = [name];
      this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      // } else {
      //   arr.push(name);
      //   this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      // }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
        name: name,
        path: resPath,
        filePath: filePath
      };

      this.images = [newEntry, ...this.images];
      this.ref.detectChanges(); // trigger change detection cycle

      // direct upload image 
      this.startUpload(newEntry);
    });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      let filtered = arr.filter(name => name != imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

      var correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);

      this.file.removeFile(correctPath, imgEntry.name).then(res => {
        this.global.showMsg('File removed.');
      });
    });
  }

  startUpload(imgEntry) {
    this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
      .then(entry => {
        (<FileEntry>entry).file(file => this.readFile(file))
      })
      .catch(err => {
        console.log('err:::::::::', err)
        this.global.showMsg('Error while reading file.');
      });
  }

  readFile(file: any) {
    console.log('read file function is called');
    const reader = new FileReader();
    reader.onload = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });

      // append all info into form 
      formData.append('image', imgBlob, file.name);
      formData.append('user_id', this.global.currentUser.id);

      console.log('Final Form Data::::::::', formData);

      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {

    this.global.showloading();

    this.apis.updatedPic(formData).subscribe(
      (result: any) => {
        this.storage.set('currentUser', result.user);
        this.global.setCurrentUser(result.user);
        this.events.publish('currentUser');
        console.log(result);
        this.global.hideloading();
        this.global.showMsg(result.message);

        if (result.status) {
          this.storage.remove(STORAGE_KEY);
        }
      },
      (err: any) => {
        this.global.hideloading();
        this.global.showMsg(err);
        console.log(err);
      });
  }

}
