import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { medkitOutline, chevronForwardOutline } from 'ionicons/icons';

import { VaccineService } from '../../services/vaccine.service';
import { Vaccine } from '../../models/vaccine.model';

@Component({
  selector: 'app-vaccines-list',
  templateUrl: 'vaccines-list.page.html',
  styleUrls: ['vaccines-list.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
  ],
})
export class VaccinesListPage implements OnInit {
  // Catálogo completo (fonte da verdade)
  allVaccines: Vaccine[] = [];

  // Lista exibida na tela (filtrada em tempo real)
  filteredVaccines: Vaccine[] = [];

  private vaccineService = inject(VaccineService);

  constructor() {
    addIcons({ medkitOutline, chevronForwardOutline });
  }

  ngOnInit() {
    // GUARDAR -> carrega catálogo completo
    this.allVaccines = this.vaccineService.getVaccines();
    // GUARDAR -> exibe tudo inicialmente
    this.filteredVaccines = [...this.allVaccines];
  }

  //  Regra 8: Busca no catálogo
  //
  // ESPERAR   -> usuário digitar no campo
  // EXTRAIR   -> texto digitado
  // PERCORRER -> catálogo de vacinas
  // VERIFICAR -> nome ou sigla contém o texto (case-insensitive)
  // FILTRAR   -> só as que passaram
  // GUARDAR   -> lista filtrada para exibir

  onSearch(event: Event) {
    // EXTRAIR -> texto do campo de busca
    const termo = ((event as CustomEvent).detail.value ?? '')
      .toLowerCase()
      .trim();

    if (!termo) {
      // SUBSTITUIR -> sem texto = exibe tudo
      this.filteredVaccines = [...this.allVaccines];
      return;
    }

    // FILTRAR -> nome ou sigla contém o termo
    this.filteredVaccines = this.allVaccines.filter(
      (v) =>
        v.nome.toLowerCase().includes(termo) ||
        v.sigla.toLowerCase().includes(termo),
    );
  }
}
