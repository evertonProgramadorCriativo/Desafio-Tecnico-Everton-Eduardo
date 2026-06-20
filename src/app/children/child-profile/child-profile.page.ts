import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
} from '../../services/vaccine-status.service';
import { Child } from '../../models/child.model';
import { CHILDREN_MOCK } from '../../data/children.mock';
import { VACCINES_MOCK } from '../../data/vaccines.mock';
import { RECORDS_MOCK } from '../../data/records.mock';

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
  ],
})
export class ChildProfilePage implements OnInit {
  child: Child | null = null;
  idadeFormatada = '';

  // Resumo real calculado pelo VaccineStatusService (Regra 4)
  resumoVacinal: ResumoVacinal = {
    total: 0,
    aplicadas: 0,
    atrasadas: 0,
    pendentes: 0,
    futuras: 0,
    percentual: 0,
  };

  private route = inject(ActivatedRoute);
  private vaccineStatus = inject(VaccineStatusService);

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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadChild(id);
  }

  // ── Carrega criança e calcula resumo vacinal real ────────────────────────

  private loadChild(id: string) {
    const found = CHILDREN_MOCK.find((c) => c.id === id);

    if (!found) {
      console.warn('Criança não encontrada para ID:', id);
      return;
    }

    this.child = found;
    this.idadeFormatada = this.calcularIdade(found.dataNascimento);

    // Regra 2 → monta carteirinha completa
    const fases = this.vaccineStatus.montarCarteirinha(
      found,
      VACCINES_MOCK,
      RECORDS_MOCK,
    );

    // Flatten de todas as doses das fases
    const itens: DoseStatusItem[] = fases.flatMap((f) => f.doses);

    // Regra 4 → resumo real (substitui o placeholder anterior)
    this.resumoVacinal = this.vaccineStatus.calcularResumoVacinal(itens);

    console.log('Criança carregada:', found.nome);
    console.log('Resumo vacinal:', this.resumoVacinal);
  }

  // ── Calcula idade em anos e meses para exibição ──────────────────────────

  calcularIdade(dataNascimento: string): string {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento + 'T00:00:00');

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    const totalMeses = anos * 12 + meses;

    if (totalMeses < 12) return `${totalMeses} meses`;
    if (meses === 0) return `${anos} ano${anos > 1 ? 's' : ''}`;
    return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }

  // ── Getters auxiliares ───────────────────────────────────────────────────

  get percentualAplicadas(): number {
    return this.resumoVacinal.percentual;
  }

  getInicial(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  getAvatarColor(sexo: string): string {
    return sexo === 'M' ? 'var(--vk-green)' : 'var(--vk-orange)';
  }
}
