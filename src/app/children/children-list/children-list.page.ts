import { Component, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, 
  IonButton, IonIcon, IonFab, IonFabButton,
  IonCard, IonCardContent,
  ModalController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, createOutline, maleFemaleOutline } from 'ionicons/icons';

import { ChildService }         from '../../services/child.service';
import { Child }                from '../../models/child.model';
import { CHILDREN_MOCK }        from '../../data/children.mock';
import { ChildFormComponent }   from '../child-form/child-form.component';

@Component({
  selector: 'app-children-list',
  templateUrl: 'children-list.page.html',
  styleUrls: ['children-list.page.scss'],
  standalone: true,
imports: [
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList,
  IonButton, IonIcon, IonFab, IonFabButton,
  IonCard, IonCardContent,
]
})
export class ChildrenListPage implements OnInit {

  // Lista de crianças exibida na tela
  children: Child[] = [];

  private childService     = inject(ChildService);
  private modalController  = inject(ModalController);
  private alertController  = inject(AlertController);

  constructor() {
    addIcons({ addOutline, trashOutline, createOutline, maleFemaleOutline });
  }

  ngOnInit() {
    // GUARDAR → carrega lista em tempo real do Firestore
    // Por enquanto usa mock para teste visual
    this.children = CHILDREN_MOCK;

    // Quando o Firestore estiver pronto, trocar por:
    // this.childService.getChildren().subscribe(data => this.children = data);
  }

  //  Calcula idade legível a partir da dataNascimento 
  calcularIdade(dataNascimento: string): string {
    const hoje      = new Date();
    const nascimento = new Date(dataNascimento);

    // CALCULAR anos completos
    const anos  = hoje.getFullYear() - nascimento.getFullYear();
    // CALCULAR meses restantes
    const meses = hoje.getMonth()    - nascimento.getMonth();

    // VERIFICAR se já fez aniversário esse ano
    const anosCompletos = meses < 0 ? anos - 1 : anos;
    const mesesRestantes = meses < 0 ? meses + 12 : meses;

    if (anosCompletos === 0) {
      return `${mesesRestantes} meses`;
    }
    if (mesesRestantes === 0) {
      return `${anosCompletos} anos`;
    }
    return `${anosCompletos} anos e ${mesesRestantes} meses`;
  }

  //  Retorna inicial do nome para o avatar 
  getInicial(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  //  Cor do avatar por sexo 
  getAvatarColor(sexo: string): string {
    return sexo === 'M' ? 'var(--vk-green)' : 'var(--vk-orange)';
  }

  //  Abre modal para adicionar nova criança 
  async openAddModal() {
    const modal = await this.modalController.create({
      component: ChildFormComponent,
      componentProps: { mode: 'add' }
    });

    await modal.present();

    // ESPERAR → resultado quando o modal fechar
    const { data } = await modal.onWillDismiss();
    if (data?.child) {
      await this.childService.addChild(data.child);
      // Recarrega lista após adicionar
      this.loadChildren();
    }
  }

  //  Abre modal para editar criança existente 
  async openEditModal(child: Child) {
    const modal = await this.modalController.create({
      component: ChildFormComponent,
      componentProps: { mode: 'edit', child }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.child && child.id) {
      await this.childService.updateChild(child.id, data.child);
      this.loadChildren();
    }
  }

  //  Confirma e deleta criança 
  async deleteChild(child: Child) {
    const alert = await this.alertController.create({
      header:  'Remover criança',
      message: `Deseja remover ${child.nome} da lista?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          role: 'destructive',
          handler: async () => {
            if (child.id) {
              await this.childService.deleteChild(child.id);
              this.loadChildren();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  //  Carrega crianças do Firestore em tempo real 
  private loadChildren() {
    this.childService.getChildren().subscribe(data => {
      this.children = data;
    });
  }
}