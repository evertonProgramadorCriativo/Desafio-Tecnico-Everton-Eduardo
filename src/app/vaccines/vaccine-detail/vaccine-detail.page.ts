import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonBadge,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { medkitOutline, calendarOutline, timeOutline } from 'ionicons/icons';

import { VaccineService } from '../../services/vaccine.service';
import { Vaccine } from '../../models/vaccine.model';

@Component({
  selector: 'app-vaccine-detail',
  templateUrl: 'vaccine-detail.page.html',
  styleUrls: ['vaccine-detail.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonBadge,
    IonIcon,
  ],
})
export class VaccineDetailPage implements OnInit {
  vaccine: Vaccine | null = null;

  private route = inject(ActivatedRoute);
  private vaccineService = inject(VaccineService);

  constructor() {
    addIcons({ medkitOutline, calendarOutline, timeOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vaccine = this.vaccineService.getVaccineById(id) ?? null;
      console.log('Vacina carregada:', this.vaccine);
    }
  }

  // ── Converte meses para texto amigável ───────────────────────────────────
  // Exemplo: 0 → "Ao nascer" | 2 → "2 meses" | 15 → "1 ano e 3 meses"

  labelIdade(meses: number): string {
    if (meses === 0) return 'Ao nascer';
    if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    const anos = Math.floor(meses / 12);
    const m = meses % 12;
    const anosLabel = `${anos} ano${anos > 1 ? 's' : ''}`;
    return m === 0
      ? anosLabel
      : `${anosLabel} e ${m} ${m === 1 ? 'mês' : 'meses'}`;
  }
}
