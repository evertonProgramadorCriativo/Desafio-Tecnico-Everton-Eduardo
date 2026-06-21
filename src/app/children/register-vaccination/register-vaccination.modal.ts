import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonNote,
  IonBadge,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  calendarOutline,
  locationOutline,
  barcodeOutline,
  personOutline,
} from 'ionicons/icons';

import { VaccinationRecordService } from '../../services/vaccination-record.service';
import { DoseStatusItem } from '../../services/vaccine-status.service';
import { Child } from '../../models/child.model';
import { VaccinationRecord } from '../../models/vaccination-record.model';
import { DoseStatus } from '../../models/dose-status.enum';

@Component({
  selector: 'app-register-vaccination',
  templateUrl: 'register-vaccination.modal.html',
  styleUrls: ['register-vaccination.modal.scss'],
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonItem,
    IonInput,
    IonLabel,
    IonNote,
    IonBadge,
    IonIcon,
  ],
})
export class RegisterVaccinationModal implements OnInit {
  // Criança dona da dose
  @Input({ required: true }) child!: Child;

  // Dose que está sendo registrada ou visualizada
  @Input({ required: true }) doseItem!: DoseStatusItem;

  // 'view': visualiza registro existente (dose aplicada)
  // 'register': formulário de registro (dose pendente/atrasada)
  @Input() mode: 'view' | 'register' = 'register';

  // Controla mensagens de validação
  submitted = false;

  // Modelo do formulário
  form: Partial<VaccinationRecord> = {
    dataAplicacao: '',
    local: '',
    lote: '',
    profissional: '',
  };

  // Data máxima = hoje (não aceita data futura)
  maxDate = new Date().toISOString().split('T')[0];

  // Data mínima = nascimento da criança
  minDate = '';

  private modalController = inject(ModalController);
  private recordService = inject(VaccinationRecordService);

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      calendarOutline,
      locationOutline,
      barcodeOutline,
      personOutline,
    });
  }

  ngOnInit() {
    this.minDate = this.child.dataNascimento;

    // SUBSTITUIR → preenche o form se for visualização
    if (this.mode === 'view' && this.doseItem.registro) {
      this.form = { ...this.doseItem.registro };
    }
  }

  //  Validações ─

  get dataValida(): boolean {
    if (!this.form.dataAplicacao) return false;
    const data = new Date(this.form.dataAplicacao);
    return data <= new Date();
  }

  get formValido(): boolean {
    return this.dataValida;
  }

  //  Título dinâmico

  get titulo(): string {
    return this.mode === 'view'
      ? `${this.doseItem.vacina.sigla} — Dose ${this.doseItem.dose.doseNumero}`
      : `Registrar ${this.doseItem.vacina.sigla}`;
  }

  //  Salva e fecha o modal

  async salvar() {
    this.submitted = true;

    // VERIFICAR → bloqueia se inválido
    if (!this.formValido) return;

    // ADICIONAR → monta o objeto VaccinationRecord
    const novoRegistro: VaccinationRecord = {
      childId: this.child.id!,
      vaccineId: this.doseItem.vacina.id!,
      doseNumero: this.doseItem.dose.doseNumero,
      dataAplicacao: this.form.dataAplicacao!,
      local: this.form.local,
      lote: this.form.lote,
      profissional: this.form.profissional,
    };

    // ADICIONAR → persiste no service (BehaviorSubject → Firestore futuramente)
    await this.recordService.addRecord(novoRegistro);

    // Fecha o modal e informa que houve atualização
    await this.modalController.dismiss({ updated: true });
  }

  async fechar() {
    await this.modalController.dismiss(null);
  }
}
