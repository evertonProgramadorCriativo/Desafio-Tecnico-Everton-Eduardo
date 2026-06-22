// Importa recursos fundamentais do Angular
// Component -> transforma a classe em componente Angular
// OnInit -> executa código quando o componente é iniciado
// OnDestroy -> executa código quando o componente é destruído
// inject -> realiza injeção de dependências sem usar constructor
import { Component, OnInit, OnDestroy, inject } from '@angular/core';

// Pipe Angular para formatação de datas
// Exemplo: 2026-06-16 -> 16/06/2026
import { DatePipe } from '@angular/common';

// Diretiva para navegação entre rotas
import { RouterLink } from '@angular/router';

// Classe utilizada para controlar subscriptions do RxJS
import { Subscription } from 'rxjs';

// Componentes visuais do Ionic utilizados na tela
import {
  IonHeader, // Cabeçalho da página
  IonToolbar, // Barra superior
  IonTitle, // Título da página
  IonContent, // Área principal da página
  IonCard, // Card visual
  IonCardContent, // Conteúdo interno do card
  IonIcon, // Exibição de ícones
  IonBadge, // Indicador numérico ou textual
  IonChip, // Pequenas etiquetas clicáveis
  IonLabel, // Texto
  IonProgressBar, // Barra de progresso
} from '@ionic/angular/standalone';

// Função responsável por registrar ícones do Ionicons
import { addIcons } from 'ionicons';

// Ícones utilizados na página
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

// Serviço responsável pelas regras de negócio das vacinas
// e também pelos tipos utilizados na página
import {
  VaccineStatusService,
  Alerta,
  DoseStatusItem,
  ResumoVacinal,
} from '../services/vaccine-status.service';

// Serviço responsável por acessar registros de vacinação
import { VaccinationRecordService } from '../services/vaccination-record.service';

// Modelo de dados de uma criança
import { Child } from '../models/child.model';

// Modelo de campanha de vacinação
import { Campaign } from '../models/campaign.model';

// Lista mockada de crianças
import { CHILDREN_MOCK } from '../data/children.mock';

// Lista mockada de vacinas
import { VACCINES_MOCK } from '../data/vaccines.mock';

// Lista mockada de campanhas
import { CAMPAIGNS_MOCK } from '../data/campaigns.mock';

// Função utilitária usada para testar a calculadora de resumo
import { testarCalculadoraResumo } from '../utils/vaccination-summary.calculator';

@Component({
  // Nome da tag HTML do componente
  selector: 'app-home',

  // Arquivo HTML associado
  templateUrl: 'home.page.html',

  // Arquivo SCSS associado
  styleUrls: ['home.page.scss'],

  // Componente standalone (não precisa de módulo)
  standalone: true,

  // Dependências utilizadas dentro do template
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
  // Lista de crianças carregada dos mocks
  readonly children: Child[] = CHILDREN_MOCK;

  // Criança selecionada inicialmente
  criancaAtiva: Child = CHILDREN_MOCK[0];

  // Objeto que armazena o resumo vacinal
  resumo: ResumoVacinal = {
    // Quantidade total de doses
    total: 0,

    // Quantidade aplicada
    aplicadas: 0,

    // Quantidade atrasada
    atrasadas: 0,

    // Quantidade pendente
    pendentes: 0,

    // Quantidade futura
    futuras: 0,

    // Percentual de vacinação
    percentual: 0,
  };

  // Lista de alertas gerados para a criança
  alertas: Alerta[] = [];

  // Lista de campanhas válidas para a criança
  campanhas: Campaign[] = [];

  // Armazena o subscribe para posterior limpeza
  private sub?: Subscription;

  // Injeta serviço responsável pelas regras de vacinação
  private vaccineStatus = inject(VaccineStatusService);

  // Injeta serviço de registros de vacinação
  private recordService = inject(VaccinationRecordService);

  // Executado quando o componente é criado
  constructor() {
    // Registra os ícones utilizados no template
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

  // Executado automaticamente após a criação do componente
  ngOnInit() {
    // Executa testes da calculadora de resumo
    testarCalculadoraResumo();

    // Carrega os dados da criança inicial
    this.selecionarCrianca(this.criancaAtiva);
  }

  // Executado quando o componente é removido da memória
  ngOnDestroy() {
    // Cancela o subscribe para evitar memory leak
    this.sub?.unsubscribe();
  }

  /**
   * Seleciona uma criança e atualiza os dados da tela
   */
  selecionarCrianca(child: Child) {
    // Atualiza a criança atualmente selecionada
    this.criancaAtiva = child;

    // Remove subscribe anterior
    this.sub?.unsubscribe();

    // Busca registros de vacinação da criança
    this.sub = this.recordService

      // Consulta registros pelo ID da criança
      .getRecordsByChild(child.id!)

      // Escuta alterações dos registros
      .subscribe((records) => {
        // Monta toda a carteirinha de vacinação
        const fases = this.vaccineStatus.montarCarteirinha(
          child,
          VACCINES_MOCK,
          records,
        );

        // Converte as fases em uma lista única de doses
        const itens: DoseStatusItem[] = fases.reduce<DoseStatusItem[]>(
          // Concatena todas as doses em um único array
          (acc, f) => acc.concat(f.doses),

          // Array inicial vazio
          [],
        );

        // Calcula resumo estatístico das vacinas
        this.resumo = this.vaccineStatus.calcularResumoVacinal(itens);

        // Gera alertas para exibir na tela
        this.alertas = this.vaccineStatus.gerarAlertas(child, itens);

        // Filtra campanhas compatíveis com a criança
        this.campanhas = this.vaccineStatus.filtrarCampanhas(
          child,
          CAMPAIGNS_MOCK,
        );
      });
  }

  /**
   * Método utilizado pelo Angular no trackBy do template
   * Evita renderizações desnecessárias.
   */
  trackAlerta(_index: number, alerta: Alerta): string {
    // Cria um identificador único para cada alerta
    return (alerta.vacina?.id ?? '') + String(alerta.dose?.doseNumero ?? '');
  }

  /**
   * Retorna quantidade total de crianças cadastradas
   */
  get totalCriancas(): number {
    return this.children.length;
  }

  /**
   * Define se os chips de seleção devem aparecer
   */
  get mostraChips(): boolean {
    // Exibe apenas se houver mais de uma criança
    return this.children.length > 1;
  }

  /**
   * Retorna a classe CSS da barra de progresso
   * conforme o percentual vacinal.
   */
  get progressClass(): string {
    // Percentual atual
    const p = this.resumo.percentual;

    // Acima de 80%
    if (p >= 80) return 'prog-verde';

    // Entre 50% e 79%
    if (p >= 50) return 'prog-amarelo';

    // Abaixo de 50%
    return 'prog-laranja';
  }

  /**
   * Verifica se uma criança está selecionada
   */
  isAtiva(child: Child): boolean {
    return this.criancaAtiva.id === child.id;
  }

  /**
   * Retorna a cor do avatar conforme o sexo
   */
  getAvatarColor(sexo: string): string {
    // Masculino = verde
    // Feminino = laranja
    return sexo === 'M' ? 'var(--vk-green)' : 'var(--vk-orange)';
  }

  /**
   * Retorna a primeira letra do nome em maiúsculo
   */
  getInicial(nome: string): string {
    // Pega o primeiro caractere e converte para maiúsculo
    return nome.charAt(0).toUpperCase();
  }
}
