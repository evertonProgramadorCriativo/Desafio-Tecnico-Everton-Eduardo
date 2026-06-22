// ─────────────────────────────────────────────────────────────────────────────
// Importações do núcleo do Angular
// ─────────────────────────────────────────────────────────────────────────────

// Component : decorator que transforma a classe em componente Angular
// OnInit    : interface que exige a implementação de ngOnInit() (executado após criação)
// inject    : função utilitária para injetar dependências sem usar parâmetro no construtor
import { Component, OnInit, inject } from '@angular/core';

// ─────────────────────────────────────────────────────────────────────────────
// Componentes e serviços Ionic (modo standalone — importação individual obrigatória)
// ─────────────────────────────────────────────────────────────────────────────
import {
  IonHeader, // barra de cabeçalho da página
  IonToolbar, // faixa interna do header (contém título e botões)
  IonTitle, // texto do título dentro da toolbar
  IonContent, // área de conteúdo rolável da página
  IonList, // container de lista estilizado pelo Ionic
  IonButton, // botão estilizado do Ionic
  IonIcon, // ícone vetorial (usa a biblioteca ionicons)
  IonFab, // container do botão de ação flutuante (FAB — posicionado sobre o conteúdo)
  IonFabButton, // botão circular dentro do IonFab (o "+" para adicionar criança)
  IonCard, // cartão com elevação — container visual de cada item da lista
  IonCardContent, // corpo interno do cartão com padding automático
  ModalController, // serviço do Ionic para criar, abrir e fechar modais
  AlertController, // serviço do Ionic para criar caixas de confirmação/alerta nativas
} from '@ionic/angular/standalone';

// addIcons: registra os ícones que serão usados no template via <ion-icon name="...">
// No modo standalone, cada ícone precisa ser registrado explicitamente
import { addIcons } from 'ionicons';

// Ícones individuais da biblioteca ionicons
import {
  addOutline, // ícone de "+" — botão FAB para adicionar criança
  trashOutline, // ícone de lixeira — botão de deletar criança
  createOutline, // ícone de lápis — botão de editar criança
  maleFemaleOutline, // ícone de gênero — exibido no card de cada criança
} from 'ionicons/icons';

// RouterLink: diretiva do Angular Router que transforma elementos HTML em links de navegação
// Usado no template para navegar ao perfil da criança ao clicar no card
import { RouterLink } from '@angular/router';

// ─────────────────────────────────────────────────────────────────────────────
// Importações internas do projeto
// ─────────────────────────────────────────────────────────────────────────────

// ChildService: serviço que encapsula as operações CRUD da criança no Firestore
import { ChildService } from '../../services/child.service';

// Child: interface/modelo que define os campos de uma criança (id, nome, dataNascimento, etc.)
import { Child } from '../../models/child.model';

// CHILDREN_MOCK: array estático com crianças fictícias — usado enquanto o Firestore não está ativo
import { CHILDREN_MOCK } from '../../data/children.mock';

// ChildFormComponent: modal de formulário reutilizável para criar e editar crianças
import { ChildFormComponent } from '../child-form/child-form.component';

// ─────────────────────────────────────────────────────────────────────────────
// Decorator @Component — metadados do componente
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-children-list', // tag usada para instanciar o componente
  templateUrl: 'children-list.page.html', // template HTML associado
  styleUrls: ['children-list.page.scss'], // estilos SCSS associados
  standalone: true, // não precisa de NgModule
  imports: [
    // Tudo que for referenciado no template precisa ser declarado aqui no standalone
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton, // FAB do botão "+"
    IonCard,
    IonCardContent,
    RouterLink, // habilita [routerLink] no template para navegar ao perfil
    // ModalController e AlertController são serviços injetados, NÃO entram em imports
  ],
})
export class ChildrenListPage implements OnInit {
  // ─────────────────────────────────────────────────────────────────────────
  // Estado público — consumido diretamente pelo template via @for
  // ─────────────────────────────────────────────────────────────────────────

  // Array que o template itera para renderizar um IonCard por criança
  // Começa vazio e é populado no ngOnInit()
  children: Child[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // Dependências injetadas — privadas, não acessadas pelo template
  // ─────────────────────────────────────────────────────────────────────────

  // ChildService: CRUD de crianças (addChild, updateChild, deleteChild, getChildren)
  private childService = inject(ChildService);

  // ModalController: cria e gerencia os modais (ChildFormComponent)
  private modalController = inject(ModalController);

  // AlertController: cria o diálogo de confirmação antes de deletar uma criança
  private alertController = inject(AlertController);

  constructor() {
    // Registra os ícones usados no template — obrigatório no modo standalone
    addIcons({ addOutline, trashOutline, createOutline, maleFemaleOutline });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle hook — executado uma vez após Angular inicializar o componente
  // ─────────────────────────────────────────────────────────────────────────
  ngOnInit() {
    // Carrega os dados mock diretamente enquanto a integração com o Firestore não está ativa
    // TODO: substituir pela linha comentada abaixo quando o Firestore estiver pronto
    this.children = CHILDREN_MOCK;

    // Versão reativa com Firestore (descomentar quando o back-end estiver integrado):
    // this.childService.getChildren().subscribe(data => this.children = data);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Métodos utilitários — chamados diretamente pelo template nos cards
  // ─────────────────────────────────────────────────────────────────────────

  // Converte a string de data de nascimento em texto legível de idade
  // Exemplos de saída: "5 meses" | "2 anos" | "3 anos e 4 meses"
  calcularIdade(dataNascimento: string): string {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    // Diferença bruta de anos entre os anos calendário
    const anos = hoje.getFullYear() - nascimento.getFullYear();

    // Diferença bruta de meses (pode ser negativa se o mês de aniversário ainda não chegou)
    const meses = hoje.getMonth() - nascimento.getMonth();

    // Se meses for negativo, o aniversário deste ano ainda não ocorreu:
    // reduz um ano e adiciona 12 aos meses para obter valores positivos corretos
    const anosCompletos = meses < 0 ? anos - 1 : anos;
    const mesesRestantes = meses < 0 ? meses + 12 : meses;

    // Menos de 1 ano: exibe só meses (ex: "8 meses")
    if (anosCompletos === 0) {
      return `${mesesRestantes} meses`;
    }

    // Anos exatos sem meses restantes (ex: "2 anos")
    if (mesesRestantes === 0) {
      return `${anosCompletos} anos`;
    }

    // Caso geral: anos + meses (ex: "1 anos e 3 meses")
    return `${anosCompletos} anos e ${mesesRestantes} meses`;
  }

  // Retorna a inicial maiúscula do nome para exibição no avatar circular do card
  // Ex: "Pedro Henrique" → 'P'
  getInicial(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  // Define a cor de fundo do avatar com base no sexo da criança
  // Usa variáveis CSS do design system VacinaKids para consistência de tema
  // 'M' → verde (--vk-green) | 'F' → laranja (--vk-orange)
  getAvatarColor(sexo: string): string {
    return sexo === 'M' ? 'var(--vk-green)' : 'var(--vk-orange)';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Ações do usuário — disparadas por eventos do template (click)
  // ─────────────────────────────────────────────────────────────────────────

  // Abre o ChildFormComponent no modo 'add' (formulário em branco)
  async openAddModal() {
    // Cria o modal passando o componente de formulário e o modo como componentProps
    const modal = await this.modalController.create({
      component: ChildFormComponent,
      componentProps: { mode: 'add' }, // ChildFormComponent recebe mode='add' via @Input
    });

    await modal.present(); // exibe o modal na tela

    // Aguarda o fechamento do modal e captura os dados devolvidos pelo dismiss()
    // onWillDismiss() resolve antes da animação de saída terminar (mais responsivo)
    const { data } = await modal.onWillDismiss();

    // Se o usuário salvou (não cancelou), data.child conterá o objeto preenchido
    if (data?.child) {
      await this.childService.addChild(data.child); // persiste no Firestore
      this.loadChildren(); // atualiza a lista na tela
    }
  }

  // Abre o ChildFormComponent no modo 'edit' com os dados da criança pré-preenchidos
  async openEditModal(child: Child) {
    const modal = await this.modalController.create({
      component: ChildFormComponent,
      componentProps: {
        mode: 'edit', // informa ao formulário que é edição
        child, // passa o objeto Child para pré-popular os campos via @Input
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    // Atualiza apenas se o usuário salvou E a criança tem um id válido no Firestore
    if (data?.child && child.id) {
      await this.childService.updateChild(child.id, data.child); // atualiza no Firestore
      this.loadChildren(); // recarrega a lista
    }
  }

  // Exibe um alerta de confirmação antes de remover a criança definitivamente
  async deleteChild(child: Child) {
    const alert = await this.alertController.create({
      header: 'Remover criança',
      message: `Deseja remover ${child.nome} da lista?`, // mensagem personalizada com o nome
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel', // fecha o alerta sem executar nenhuma ação
        },
        {
          text: 'Remover',
          role: 'destructive', // estiliza o botão em vermelho (padrão iOS/Android para ação destrutiva)
          handler: async () => {
            // Só deleta se a criança tiver um id (garantia de que existe no Firestore)
            if (child.id) {
              await this.childService.deleteChild(child.id); // remove do Firestore
              this.loadChildren(); // recarrega a lista sem o item removido
            }
          },
        },
      ],
    });

    await alert.present(); // exibe o diálogo de confirmação na tela
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Métodos privados — lógica interna reutilizada pelos métodos públicos acima
  // ─────────────────────────────────────────────────────────────────────────

  // Assina o Observable do Firestore e atualiza o array children com os dados mais recentes
  // Chamado após add, update e delete para manter a lista sempre sincronizada
  // É private pois nenhum elemento externo (template ou pai) precisa chamá-lo diretamente
  private loadChildren() {
    this.childService.getChildren().subscribe((data) => {
      this.children = data; // substituição completa do array — o @for no template re-renderiza
    });
  }
}
