import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { CHILDREN_MOCK }  from './data/children.mock';
import { VACCINES_MOCK }  from './data/vaccines.mock';
import { CAMPAIGNS_MOCK } from './data/campaigns.mock';
import { RECORDS_MOCK }   from './data/records.mock';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
   ngOnInit() {
    console.log('Children:',  CHILDREN_MOCK);
    console.log('Vaccines:',  VACCINES_MOCK);
    console.log('Campaigns:', CAMPAIGNS_MOCK);
    console.log('Records:',   RECORDS_MOCK);

    console.log('Resumo');
    
    console.log(`Total crianças:  ${CHILDREN_MOCK.length}`);
    console.log(`Total vacinas:   ${VACCINES_MOCK.length}`);
    console.log(`Total campanhas: ${CAMPAIGNS_MOCK.length}`);
    console.log(`Total registros: ${RECORDS_MOCK.length}`);
  }
}
 