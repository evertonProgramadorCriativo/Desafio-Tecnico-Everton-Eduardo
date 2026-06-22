// Importa decorators e funções do Angular
// Component -> transforma a classe em um componente Angular
// Input -> permite receber dados do componente pai
// OnInit -> interface para executar código na inicialização
// OnDestroy -> interface para executar código ao destruir o componente
// inject -> nova forma de injeção de dependências sem usar constructor
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';

// Importa Subscription do RxJS
// Usada para controlar inscrições (subscribe) em Observables
import { Subscription } from 'rxjs';

// Componentes do Ionic utilizados na interface
import {
  IonSegment, // Controle de seleção semelhante a abas
  IonSegmentButton, // Botão individual do Segment
  IonLabel, // Exibe textos
  IonIcon, // Exibe ícones
  IonBadge, // Exibe indicadores ou contadores
  ModalController, // Responsável por abrir e fechar modais
} from '@ionic/angular/standalone';

// Função para registrar ícones do Ionicons
import { addIcons } from 'ionicons';

// Ícones utilizados pelo componente
import {
  checkmarkCircleOutline,
  timeOutline,
  alertCircleOutline,
  calendarOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

// Serviço responsável por calcular status das vacinas
// e montar a carteirinha de vacinação
import {
  VaccineStatusService,
  FaseEtaria,
  DoseStatusItem,
} from '../../services/vaccine-status.service';

// Serviço responsável pelos registros de vacinação
import { VaccinationRecordService } from '../../services/vaccination-record.service';

// Modal utilizado para registrar ou visualizar vacinação
import { RegisterVaccinationModal } from '../register-vaccination/register-vaccination.modal';

// Modelo da criança
import { Child } from '../../models/child.model';

// Enum com os possíveis status de uma dose
import { DoseStatus } from '../../models/dose-status.enum';

// Dados mockados das vacinas
import { VACCINES_MOCK } from '../../data/vaccines.mock';

// Tipo personalizado para os filtros disponíveis
type Filtro = 'todas' | 'aplicadas' | 'pendentes' | 'atrasadas';

@Component({
  // Nome da tag HTML do componente
  selector: 'app-vaccination-card',

  // Arquivo HTML do componente
  templateUrl: 'vaccination-card.component.html',

  // Arquivo SCSS do componente
  styleUrls: ['vaccination-card.component.scss'],

  // Define como componente standalone
  standalone: true,

  // Componentes Ionic utilizados no template
  imports: [IonSegment, IonSegmentButton, IonLabel, IonIcon, IonBadge],
})
export class VaccinationCardComponent implements OnInit, OnDestroy {
  // Recebe a criança do componente pai
  // required:true significa que o valor é obrigatório
  @Input({ required: true }) child!: Child;

  // Lista das fases etárias exibidas na tela
  fases: FaseEtaria[] = [];

  // Filtro atual selecionado pelo usuário
  filtro: Filtro = 'todas';

  // Disponibiliza o enum no HTML
  readonly DoseStatus = DoseStatus;

  // Armazena a inscrição do Observable
  private sub?: Subscription;

  // Injeta o serviço responsável pelos cálculos de status
  private vaccineStatus = inject(VaccineStatusService);

  // Injeta o serviço de registros de vacinação
  private recordService = inject(VaccinationRecordService);

  // Injeta o controlador de modais
  private modalController = inject(ModalController);

  // Executado ao criar o componente
  constructor() {
    // Registra os ícones para uso no template
    addIcons({
      checkmarkCircleOutline,
      timeOutline,
      alertCircleOutline,
      calendarOutline,
      chevronForwardOutline,
    });
  }

  // Executado automaticamente após a inicialização do componente
  ngOnInit() {
    // Busca os registros de vacinação da criança
    this.sub = this.recordService

      // Obtém os registros pelo ID da criança
      .getRecordsByChild(this.child.id!)

      // Escuta alterações dos registros
      .subscribe((records) => {
        // Monta a carteirinha de vacinação
        // calculando quais vacinas estão:
        // aplicadas, pendentes, atrasadas ou futuras
        this.fases = this.vaccineStatus.montarCarteirinha(
          this.child,
          VACCINES_MOCK,
          records,
        );
      });
  }

  // Executado quando o componente é destruído
  ngOnDestroy() {
    // Cancela a inscrição para evitar vazamento de memória
    this.sub?.unsubscribe();
  }

  // Executado quando o usuário altera o filtro
  onFiltroChange(event: Event) {
    // Obtém o valor selecionado e atualiza o filtro
    this.filtro = (event as CustomEvent).detail.value as Filtro;
  }

  // Getter que retorna apenas as fases visíveis
  // conforme o filtro selecionado
  get fasesVisiveis(): FaseEtaria[] {
    // Se o filtro for "todas", retorna tudo
    if (this.filtro === 'todas') return this.fases;

    // Percorre cada fase etária
    return (
      this.fases

        // Cria uma nova lista filtrando apenas as doses desejadas
        .map((fase) => ({
          ...fase,

          // Filtra as doses da fase
          doses: fase.doses.filter((d) => {
            // Analisa o filtro atual
            switch (this.filtro) {
              // Mostra apenas vacinas aplicadas
              case 'aplicadas':
                return d.status === DoseStatus.APLICADA;

              // Mostra pendentes e atrasadas
              case 'pendentes':
                return (
                  d.status === DoseStatus.PENDENTE ||
                  d.status === DoseStatus.ATRASADA
                );

              // Mostra apenas atrasadas
              case 'atrasadas':
                return d.status === DoseStatus.ATRASADA;

              // Caso padrão
              default:
                return true;
            }
          }),
        }))

        // Remove fases sem nenhuma dose após o filtro
        .filter((fase) => fase.doses.length > 0)
    );
  }

  // Executado ao clicar em uma dose
  async onDoseClick(item: DoseStatusItem) {
    // Não permite ação para vacinas futuras
    if (item.status === DoseStatus.FUTURA) return;

    // Define o modo do modal:
    // view = visualizar
    // register = registrar aplicação
    const mode = item.status === DoseStatus.APLICADA ? 'view' : 'register';

    // Cria o modal
    const modal = await this.modalController.create({
      // Componente que será aberto
      component: RegisterVaccinationModal,

      // Dados enviados para o modal
      componentProps: {
        child: this.child,
        doseItem: item,
        mode,
      },
    });

    // Exibe o modal na tela
    await modal.present();
  }

  // Retorna o texto correspondente ao status
  getLabelStatus(status: DoseStatus): string {
    // Mapeamento de status para texto
    const labels: Record<DoseStatus, string> = {
      [DoseStatus.APLICADA]: 'Aplicada',
      [DoseStatus.PENDENTE]: 'Pendente',
      [DoseStatus.ATRASADA]: 'Atrasada',
      [DoseStatus.FUTURA]: 'Futura',
    };

    // Retorna o texto correspondente
    return labels[status];
  }

  // Retorna o nome do ícone correspondente ao status
  getStatusIcon(status: DoseStatus): string {
    switch (status) {
      // Ícone de sucesso
      case DoseStatus.APLICADA:
        return 'checkmark-circle-outline';

      // Ícone de relógio
      case DoseStatus.PENDENTE:
        return 'time-outline';

      // Ícone de alerta
      case DoseStatus.ATRASADA:
        return 'alert-circle-outline';

      // Ícone padrão para futuras
      default:
        return 'calendar-outline';
    }
  }

  // Verifica se a dose pode ser clicada
  isClickable(status: DoseStatus): boolean {
    // Apenas doses futuras não podem ser clicadas
    return status !== DoseStatus.FUTURA;
  }
}
