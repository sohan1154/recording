import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { GlobalProvider } from '../../../providers/globals/globals';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  userId;

  public currentUser: any = {};

  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Edit Profile',
      url: '/edit-profile/:profileId',
      icon: 'create'
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private storage: Storage,
    public global: GlobalProvider,
    public navCtrl: NavController,
    public events: Events
  ) {
      // get user information
      this.storage.get('currentUser').then((user) => {
        if (user) {
          this.currentUser = user;
        }
        this.userId = this.currentUser.id;
        console.log(this.currentUser);
      });

      events.subscribe('currentUser', () => {
        console.log('currentUser:::::', this.global.currentUser)
        this.currentUser = this.global.currentUser;
      });
    }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('profileId')) {
        this.navCtrl.navigateBack('/home');
        return;
      }
    });
  }

  logout() {
    this.global.presentAlertConfirm('Are you sure you want to logout!', (cancel, confirmed) => {
      if (cancel) {
        return false;
      } else {
        this.storage.clear().then(() => {
          this.navCtrl.navigateBack('/login');
        });
      }
    });
  }

}
