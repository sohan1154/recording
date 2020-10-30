import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-candidate-info',
  templateUrl: './candidate-info.component.html',
  styleUrls: ['./candidate-info.component.scss'],
})
export class CandidateInfoComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    let params = {
      name: form.value.name,
      email: form.value.email,
      mobile: form.value.mobileNo
    }
    this.modalCtrl.dismiss(params);
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
