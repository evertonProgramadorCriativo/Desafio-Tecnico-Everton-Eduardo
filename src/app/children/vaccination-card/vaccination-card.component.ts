import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';

import { Subscription } from 'rxjs';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonBadge,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  calendarOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

import {
  VaccineStatusService,
  FaseEtaria,
  DoseStatusItem,
} from '../../services/vaccine-status.service';
import { VaccinationRecordService } from '../../services/vaccination-record.service';
import { RegisterVaccinationModal } from '../register-vaccination/register-vaccination.modal';
import { Child } from '../../models/child.model';
import { DoseStatus } from '../../models/dose-status.enum';
import { VACCINES_MOCK } from '../../data/vaccines.mock';

type Filtro = 'todas' | 'aplicadas' | 'pendentes' | 'atrasadas';

@Component({
  selector: 'app-vaccination-card',
  templateUrl: 'vaccination-card.component.html',
  styleUrls: ['vaccination-card.component.scss'],
  standalone: true,
  imports: [IonSegment, IonSegmentButton, IonLabel, IonIcon, IonBadge],
})
export class VaccinationCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) child!: Child;

  fases: FaseEtaria[] = [];
  filtro: Filtro = 'todas';
  readonly DoseStatus = DoseStatus;

  private sub?: Subscription;
  private vaccineStatus = inject(VaccineStatusService);
  private recordService = inject(VaccinationRecordService);
  private modalController = inject(ModalController);

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      calendarOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit() {
    this.sub = this.recordService
      .getRecordsByChild(this.child.id!)
      .subscribe((records) => {
        this.fases = this.vaccineStatus.montarCarteirinha(
          this.child,
          VACCINES_MOCK,
          records,
        );
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onFiltroChange(event: Event) {
    this.filtro = (event as CustomEvent).detail.value as Filtro;
  }

  get fasesVisiveis(): FaseEtaria[] {
    if (this.filtro === 'todas') return this.fases;

    return this.fases
      .map((fase) => ({
        ...fase,
        doses: fase.doses.filter((d) => {
          switch (this.filtro) {
            case 'aplicadas':
              return d.status === DoseStatus.APLICADA;
            case 'pendentes':
              return (
                d.status === DoseStatus.PENDENTE ||
                d.status === DoseStatus.ATRASADA
              );
            case 'atrasadas':
              return d.status === DoseStatus.ATRASADA;
            default:
              return true;
          }
        }),
      }))
      .filter((fase) => fase.doses.length > 0);
  }

  async onDoseClick(item: DoseStatusItem) {
    if (item.status === DoseStatus.FUTURA) return;

    const mode = item.status === DoseStatus.APLICADA ? 'view' : 'register';

    const modal = await this.modalController.create({
      component: RegisterVaccinationModal,
      componentProps: { child: this.child, doseItem: item, mode },
    });

    await modal.present();
  }

  getLabelStatus(status: DoseStatus): string {
    const labels: Record<DoseStatus, string> = {
      [DoseStatus.APLICADA]: 'Aplicada',
      [DoseStatus.PENDENTE]: 'Pendente',
      [DoseStatus.ATRASADA]: 'Atrasada',
      [DoseStatus.FUTURA]: 'Futura',
    };
    return labels[status];
  }

  getStatusIcon(status: DoseStatus): string {
    switch (status) {
      case DoseStatus.APLICADA:
        return 'checkmark-circle-outline';
      case DoseStatus.PENDENTE:
        return 'time-outline';
      case DoseStatus.ATRASADA:
        return 'alert-circle-outline';
      default:
        return 'calendar-outline';
    }
  }

  isClickable(status: DoseStatus): boolean {
    return status !== DoseStatus.FUTURA;
  }
}
