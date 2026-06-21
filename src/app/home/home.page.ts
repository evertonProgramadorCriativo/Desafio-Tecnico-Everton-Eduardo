import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonBadge,
  IonChip,
  IonLabel,
  IonProgressBar,
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
import { VaccinationRecordService } from '../services/vaccination-record.service';
import { Child } from '../models/child.model';
import { Campaign } from '../models/campaign.model';
import { CHILDREN_MOCK } from '../data/children.mock';
import { VACCINES_MOCK } from '../data/vaccines.mock';
import { CAMPAIGNS_MOCK } from '../data/campaigns.mock';
import { testarCalculadoraResumo } from '../utils/vaccination-summary.calculator';

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
    IonChip,
    IonLabel,
    IonProgressBar,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  readonly children: Child[] = CHILDREN_MOCK;
  criancaAtiva: Child = CHILDREN_MOCK[0];

  resumo: ResumoVacinal = {
    total: 0,
    aplicadas: 0,
    atrasadas: 0,
    pendentes: 0,
    futuras: 0,
    percentual: 0,
  };
  alertas: Alerta[] = [];
  campanhas: Campaign[] = [];

  private sub?: Subscription;
  private vaccineStatus = inject(VaccineStatusService);
  private recordService = inject(VaccinationRecordService); // ← agora funciona

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
    testarCalculadoraResumo();
    this.selecionarCrianca(this.criancaAtiva);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  selecionarCrianca(child: Child) {
    this.criancaAtiva = child;
    this.sub?.unsubscribe();
    this.sub = this.recordService
      .getRecordsByChild(child.id!)
      .subscribe((records) => {
        const fases = this.vaccineStatus.montarCarteirinha(
          child,
          VACCINES_MOCK,
          records,
        );
        const itens: DoseStatusItem[] = fases.reduce<DoseStatusItem[]>(
          (acc, f) => acc.concat(f.doses),
          [],
        );

        this.resumo = this.vaccineStatus.calcularResumoVacinal(itens);
        this.alertas = this.vaccineStatus.gerarAlertas(child, itens);
        this.campanhas = this.vaccineStatus.filtrarCampanhas(
          child,
          CAMPAIGNS_MOCK,
        );
      });
  }

  // resolve TS2532 no track do template
  trackAlerta(_index: number, alerta: Alerta): string {
    return (alerta.vacina?.id ?? '') + String(alerta.dose?.doseNumero ?? '');
  }

  get totalCriancas(): number {
    return this.children.length;
  }

  get mostraChips(): boolean {
    return this.children.length > 1;
  }

  get progressClass(): string {
    const p = this.resumo.percentual;
    if (p >= 80) return 'prog-verde';
    if (p >= 50) return 'prog-amarelo';
    return 'prog-laranja';
  }

  isAtiva(child: Child): boolean {
    return this.criancaAtiva.id === child.id;
  }

  getAvatarColor(sexo: string): string {
    return sexo === 'M' ? 'var(--vk-green)' : 'var(--vk-orange)';
  }

  getInicial(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }
}
