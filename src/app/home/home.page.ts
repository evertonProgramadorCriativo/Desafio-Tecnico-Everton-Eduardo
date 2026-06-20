import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle,
  alertCircleOutline,
  timeOutline,
  checkmarkCircle,
  peopleOutline,
  megaphoneOutline,
  chevronForwardOutline,
  medkitOutline,
} from 'ionicons/icons';

import {
  VaccineStatusService,
  Alerta,
  DoseStatusItem,
  ResumoVacinal,
} from '../services/vaccine-status.service';
import { Child } from '../models/child.model';
import { Campaign } from '../models/campaign.model';
import { CHILDREN_MOCK } from '../data/children.mock';
import { VACCINES_MOCK } from '../data/vaccines.mock';
import { CAMPAIGNS_MOCK } from '../data/campaigns.mock';
import { RECORDS_MOCK } from '../data/records.mock';

interface ChildResumo {
  child: Child;
  resumo: ResumoVacinal;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonBadge,
  ],
})
export class HomePage implements OnInit {
  alertas: Alerta[] = [];
  childrenResumos: ChildResumo[] = [];
  campanhas: Campaign[] = [];

  private vaccineStatus = inject(VaccineStatusService);

  constructor() {
    addIcons({
      alertCircle,
      alertCircleOutline,
      timeOutline,
      checkmarkCircle,
      peopleOutline,
      megaphoneOutline,
      chevronForwardOutline,
      medkitOutline,
    });
  }

  ngOnInit() {
    this.calcularDashboard();
  }

  private calcularDashboard() {
    const todosAlertas: Alerta[] = [];

    for (const child of CHILDREN_MOCK) {
      const fases = this.vaccineStatus.montarCarteirinha(
        child,
        VACCINES_MOCK,
        RECORDS_MOCK,
      );

      const itens: DoseStatusItem[] = fases.reduce<DoseStatusItem[]>(
        (acc, f) => acc.concat(f.doses),
        [],
      );

      const resumo = this.vaccineStatus.calcularResumoVacinal(itens);
      this.childrenResumos.push({ child, resumo });

      const alertasChild = this.vaccineStatus.gerarAlertas(child, itens);
      todosAlertas.push(...alertasChild);

      const campanhasChild = this.vaccineStatus.filtrarCampanhas(
        child,
        CAMPAIGNS_MOCK,
      );

      for (const c of campanhasChild) {
        if (!this.campanhas.find((x) => x.id === c.id)) {
          this.campanhas.push(c);
        }
      }
    }

    this.alertas = todosAlertas.sort((a, b) => {
      if (a.urgencia !== b.urgencia) return a.urgencia === 'alta' ? -1 : 1;
      return a.dataPrevista.getTime() - b.dataPrevista.getTime();
    });
  }

  get totalCriancas(): number {
    return CHILDREN_MOCK.length;
  }

  getAvatarColor(sexo: string): string {
    return sexo === 'M' ? 'var(--vk-green)' : 'var(--vk-orange)';
  }

  getInicial(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }
}
