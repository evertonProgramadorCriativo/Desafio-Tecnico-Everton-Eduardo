// Importa os recursos básicos do Angular
import { Component, OnInit ,inject } from '@angular/core';

// Importa componentes visuais do Ionic utilizados na página
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular/standalone';

import { ChildService } from '../services/child.service';
import { Child } from '../models/child.model';

// Importa os modelos (interfaces) utilizados na aplicação
/*import { Child }             from '../models/child.model';
import { Vaccine }           from '../models/vaccine.model';
import { VaccinationRecord } from '../models/vaccination-record.model';
import { Campaign }          from '../models/campaign.model';*/

// Importa o enum que representa os possíveis status de uma dose
import { DoseStatus }        from '../models/dose-status.enum';

@Component({
  // Nome utilizado para identificar o componente no HTML
  selector: 'app-home',

  // Arquivo HTML associado ao componente
  //templateUrl: 'home.page.html',
   template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Início</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Testando ChildService no console...</p>
    </ion-content>
  `,

  // Define o componente como standalone (não precisa de módulo)
  standalone: true,

  // Componentes Ionic disponíveis no template
  imports: [IonHeader, IonToolbar, IonTitle, IonContent]
})
export class HomePage implements OnInit {





    // Injeta o serviço via inject() — padrão moderno
  private childService = inject(ChildService);

  /**
   * Método executado automaticamente
   * quando a página é inicializada.
   */

async ngOnInit() {
    // 1. CREATE — adiciona criança de teste
        const novaCrianca: Child = {
      nome:           'Teste Child',
      dataNascimento: '2023-01-10',
      sexo:           'M',
      responsavelId:  'user-teste'
    };

    const docRef = await this.childService.addChild(novaCrianca);
    console.log(' CREATE — criança adicionada, ID:', docRef.id);

     // 2. READ — lista todas as crianças em tempo real
    this.childService.getChildren().subscribe(children => {
      console.log(' READ — crianças no Firestore:', children);
      console.log(`   Total: ${children.length}`);
    });



    
  }
}