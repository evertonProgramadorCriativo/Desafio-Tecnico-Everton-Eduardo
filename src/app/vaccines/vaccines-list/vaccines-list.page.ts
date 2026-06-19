import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-vaccines-list',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Vacinas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p> Em construção</p>
    </ion-content>
  `,
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent]
})
export class VaccinesListPage {}