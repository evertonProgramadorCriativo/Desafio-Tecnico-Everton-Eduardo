import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonProgressBar,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  personOutline,
  medkitOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  timeOutline,
} from 'ionicons/icons';
import { DatePipe } from '@angular/common';

import {
  VaccineStatusService,
  DoseStatusItem,
  ResumoVacinal,
  Alerta,
} from '../../services/vaccine-status.service';
import { VaccinationRecordService } from '../../services/vaccination-record.service';
import { VaccinationCardComponent } from '../vaccination-card/vaccination-card.component';
import { Child } from '../../models/child.model';
import { CHILDREN_MOCK } from '../../data/children.mock';
import { VACCINES_MOCK } from '../../data/vaccines.mock';
import { CAMPAIGNS_MOCK } from '../../data/campaigns.mock';
import { testarCalculadoraDose } from '../../utils/dose-status.calculator';

@Component({
  selector: 'app-child-profile',
  templateUrl: 'child-profile.page.html',
  styleUrls: ['child-profile.page.scss'],
  standalone: true,
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonProgressBar,
    IonBadge,
    VaccinationCardComponent,
  ],
})
export class ChildProfilePage implements OnInit, OnDestroy {
  child: Child | null = null;
  idadeFormatada = '';

  resumoVacinal: ResumoVacinal = {
    total: 0,
    aplicadas: 0,
    atrasadas: 0,
    pendentes: 0,
    futuras: 0,
    percentual: 0,
  };

  // Alertas de doses atrasadas/próximas para a lista abaixo da barra
  alertas: Alerta[] = [];

  private sub?: Subscription;
  private route = inject(ActivatedRoute);
  private vaccineStatus = inject(VaccineStatusService);
  private recordService = inject(VaccinationRecordService);

  constructor() {
    addIcons({
      calendarOutline,
      personOutline,
      medkitOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      timeOutline,
    });
  }

  ngOnInit() {
    // Testa os calculadores puros (abre o console para ver os resultados)
    testarCalculadoraDose();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadChild(id);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  //  Carrega criança e assina atualizações reativas ─

  private loadChild(id: string) {
    const found = CHILDREN_MOCK.find((c) => c.id === id);
    if (!found) {
      console.warn('Criança não encontrada:', id);
      return;
    }

    this.child = found;
    this.idadeFormatada = this.calcularIdade(found.dataNascimento);

    // GUARDAR → recalcula sempre que um novo registro for adicionado
    this.sub = this.recordService.getRecordsByChild(id).subscribe((records) => {
      const fases = this.vaccineStatus.montarCarteirinha(
        found,
        VACCINES_MOCK,
        records,
      );
      const itens: DoseStatusItem[] = fases.reduce(
        (todos, fase) => todos.concat(fase.doses),
        [] as DoseStatusItem[],
      );

      this.resumoVacinal = this.vaccineStatus.calcularResumoVacinal(itens);
      this.alertas = this.vaccineStatus.gerarAlertas(found, itens);

      console.log('Resumo:', this.resumoVacinal);
    });
  }

  //  Getters

  get percentualAplicadas(): number {
    return this.resumoVacinal.percentual;
  }

  // Cor da barra de progresso: verde | amarelo | laranja
  get progressClass(): string {
    const pct = this.resumoVacinal.percentual;
    if (pct >= 80) return 'prog-verde';
    if (pct >= 50) return 'prog-amarelo';
    return 'prog-laranja';
  }

  // Texto descritivo da cor
  get statusTexto(): string {
    const pct = this.resumoVacinal.percentual;
    if (pct >= 80) return 'Em dia';
    if (pct >= 50) return 'Atenção';
    return 'Urgente';
  }

  // Alertas apenas das doses atrasadas (urgência alta)
  get alertasAtrasados(): Alerta[] {
    return this.alertas.filter((a) => a.urgencia === 'alta');
  }

  getInicial(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  getAvatarColor(sexo: string): string {
    return sexo === 'M' ? 'var(--vk-green)' : 'var(--vk-orange)';
  }

  calcularIdade(dataNascimento: string): string {
    const hoje = new Date();
    const nasc = new Date(dataNascimento + 'T00:00:00');
    let anos = hoje.getFullYear() - nasc.getFullYear();
    let meses = hoje.getMonth() - nasc.getMonth();
    if (meses < 0) {
      anos--;
      meses += 12;
    }
    const totalMeses = anos * 12 + meses;
    if (totalMeses < 12) return `${totalMeses} meses`;
    if (meses === 0) return `${anos} ano${anos > 1 ? 's' : ''}`;
    return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }
}
