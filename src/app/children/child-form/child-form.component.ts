import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonItem, IonInput, IonSelect, IonSelectOption,
  IonLabel, IonNote,
  ModalController
} from '@ionic/angular/standalone';

import { Child } from '../../models/child.model';

@Component({
  selector: 'app-child-form',
  templateUrl: 'child-form.component.html',
  styleUrls:  ['child-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonButton, IonItem, IonInput, IonSelect, IonSelectOption,
    IonLabel, IonNote
  ]
})
export class ChildFormComponent implements OnInit {

  // Modo: 'add' para criar | 'edit' para editar
  @Input() mode: 'add' | 'edit' = 'add';

  // Criança recebida quando mode = 'edit'
  @Input() child?: Child;

  // Controla se tentou salvar (ativa mensagens de erro)
  submitted = false;

  // Modelo do formulário
  form: Child = {
    nome:           '',
    dataNascimento: '',
    sexo:           'M',
    responsavelId:  'user-001' // fixo por enquanto, virá do Auth depois
  };

  // Data máxima: hoje (não aceita nascimento futuro)
  maxDate = new Date().toISOString().split('T')[0];

  private modalController = inject(ModalController);

  ngOnInit() {
    // SUBSTITUIR → preenche o form se for edição
    if (this.mode === 'edit' && this.child) {
      this.form = { ...this.child };
    }
  }

  //  Título dinâmico do modal 
  get titulo(): string {
    return this.mode === 'add' ? 'Nova Criança' : 'Editar Criança';
  }

  //  Validações 

  get nomeValido(): boolean {
    // VALIDAR → nome obrigatório, mínimo 2 caracteres
    return this.form.nome.trim().length >= 2;
  }

  get dataNascimentoValida(): boolean {
    // VALIDAR → data obrigatória e não pode ser futura
    if (!this.form.dataNascimento) return false;
    const data = new Date(this.form.dataNascimento);
    return data <= new Date();
  }

  get sexoValido(): boolean {
    // VALIDAR → deve ser M ou F
    return this.form.sexo === 'M' || this.form.sexo === 'F';
  }

  get formValido(): boolean {
    return this.nomeValido && this.dataNascimentoValida && this.sexoValido;
  }

  //  Salva e fecha o modal 
  async salvar() {
    this.submitted = true;

    // VERIFICAR → bloqueia se inválido
    if (!this.formValido) return;

    // Fecha o modal e devolve os dados para a lista
    await this.modalController.dismiss({ child: this.form });
  }

  //  Cancela sem salvar 
  async cancelar() {
    await this.modalController.dismiss(null);
  }
}