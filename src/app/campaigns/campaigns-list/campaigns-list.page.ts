// ─────────────────────────────────────────────────────────────────────────────
// Importações do núcleo do Angular
// ─────────────────────────────────────────────────────────────────────────────

// Component: decorator que transforma a classe em componente Angular
// OnInit: interface que obriga a implementar o método ngOnInit()
// inject: função utilitária para injetar dependências sem usar o construtor
import { Component, OnInit, inject } from '@angular/core';

// DatePipe: pipe nativo do Angular para formatar datas no template (ex: {{ data | date:'dd/MM/yyyy' }})
import { DatePipe } from '@angular/common';

// ─────────────────────────────────────────────────────────────────────────────
// Importações dos componentes Ionic (modo standalone — sem NgModule)
// ─────────────────────────────────────────────────────────────────────────────
import {
  IonHeader, // barra de cabeçalho da página
  IonToolbar, // faixa interna do header (contém título, botões etc.)
  IonTitle, // texto centralizado dentro da toolbar
  IonContent, // área de conteúdo rolável da página
  IonCard, // cartão com elevação (container visual)
  IonCardContent, // corpo interno do cartão (padding e conteúdo)
  IonIcon, // ícone vetorial (usa a biblioteca ionicons)
} from '@ionic/angular/standalone';

// addIcons: registra os ícones escolhidos para uso no template via <ion-icon name="...">
import { addIcons } from 'ionicons';

// ─────────────────────────────────────────────────────────────────────────────
// Ícones individuais importados da biblioteca ionicons
// Cada um precisa ser registrado explicitamente no modo standalone
// ─────────────────────────────────────────────────────────────────────────────
import {
  megaphoneOutline, // ícone de megafone — representa "campanha"
  calendarOutline, // ícone de calendário — representa período/data
  peopleOutline, // ícone de pessoas — representa público-alvo
  medkitOutline, // ícone de kit médico — representa vacina/saúde
  checkmarkCircleOutline, // ícone de check — representa campanha ativa
  timeOutline, // ícone de relógio — representa prazo/encerramento
  closeCircleOutline, // ícone de X — representa campanha encerrada
} from 'ionicons/icons';

// ─────────────────────────────────────────────────────────────────────────────
// Importações internas do projeto
// ─────────────────────────────────────────────────────────────────────────────

// Campaign: interface/modelo que define o formato de uma campanha de vacinação
import { Campaign } from '../../models/campaign.model';

// CAMPAIGNS_MOCK: array estático com campanhas fictícias para desenvolvimento
import { CAMPAIGNS_MOCK } from '../../data/campaigns.mock';

// CHILDREN_MOCK: array estático com crianças fictícias para cruzamento de dados
import { CHILDREN_MOCK } from '../../data/children.mock';

// VaccineStatusService: serviço com lógicas de negócio (ex: calcular idade em meses)
import { VaccineStatusService } from '../../services/vaccine-status.service';

// ─────────────────────────────────────────────────────────────────────────────
// Interface local — estende Campaign adicionando campos calculados em runtime
// ─────────────────────────────────────────────────────────────────────────────
export interface CampanhaVista extends Campaign {
  paraMinhaFamilia: boolean; // true se ao menos uma criança da família se enquadra na campanha
  criancasElegiveis: string[]; // lista com o primeiro nome das crianças elegíveis
}

// ─────────────────────────────────────────────────────────────────────────────
// Decorator @Component — configura o metadado do componente
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-campaigns-list', // tag HTML usada para inserir este componente
  templateUrl: 'campaigns-list.page.html', // arquivo de template vinculado
  styleUrls: ['campaigns-list.page.scss'], // arquivo de estilos vinculado
  standalone: true, // componente standalone (sem NgModule)
  imports: [
    // Todos os componentes/pipes usados no template precisam ser declarados aqui
    DatePipe, // permite {{ data | date:'...' }} no template
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
  ],
})
export class CampaignsListPage implements OnInit {
  // Propriedade pública: array que o template itera com @for para renderizar os cartões
  campanhas: CampanhaVista[] = [];

  // Injeta o VaccineStatusService usando a função inject() — alternativa ao parâmetro no construtor
  private vaccineStatus = inject(VaccineStatusService);

  constructor() {
    // Registra todos os ícones que serão usados no template
    // Sem isso o <ion-icon> renderiza vazio no modo standalone
    addIcons({
      megaphoneOutline,
      calendarOutline,
      peopleOutline,
      medkitOutline,
      checkmarkCircleOutline,
      timeOutline,
      closeCircleOutline,
    });
  }

  // Executado automaticamente pelo Angular logo após o componente ser criado
  ngOnInit() {
    // Transforma cada campanha bruta em CampanhaVista com dados calculados
    this.campanhas = CAMPAIGNS_MOCK.map((campanha) => {
      // Filtra as crianças que se enquadram na campanha atual
      const criancasElegiveis = CHILDREN_MOCK.filter((child) => {
        // Converte a string de data de nascimento em objeto Date
        // O sufixo 'T00:00:00' evita que o fuso horário desloque o dia para o anterior
        const nascimento = new Date(child.dataNascimento + 'T00:00:00');

        // Calcula quantos meses a criança tem hoje usando o serviço
        const idadeAtualMeses = this.vaccineStatus.calcularIdadeMeses(
          nascimento,
          new Date(), // data de referência = hoje
        );

        // Condição de elegibilidade:
        // 1. A campanha precisa estar com status 'ativa'
        // 2. A idade da criança deve estar dentro da faixa etária definida no publicoAlvo
        return (
          campanha.status === 'ativa' &&
          idadeAtualMeses >= campanha.publicoAlvo.idadeMinMeses && // idade mínima atingida
          idadeAtualMeses <= campanha.publicoAlvo.idadeMaxMeses // idade máxima não ultrapassada
        );
      })
        // Após filtrar, extrai apenas o primeiro nome de cada criança elegível
        // Usado para exibição compacta no cartão (ex: "João, Maria")
        .map((c) => c.nome.split(' ')[0]);

      // Retorna um novo objeto que funde os dados originais da campanha com os campos calculados
      return {
        ...campanha, // copia todas as propriedades originais de Campaign
        paraMinhaFamilia: criancasElegiveis.length > 0, // true se há ao menos 1 criança elegível
        criancasElegiveis, // array de nomes para exibição no template
      };
    })
      // Ordena o array final: campanhas 'ativa' sobem para o topo, 'encerrada' vão para o fim
      // Se os status forem iguais, mantém a ordem original (retorna 0)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'ativa' ? -1 : 1;
        return 0;
      });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Converte um intervalo em meses para texto legível em português
  // Exemplos: (0, 6) → "recém-nascido até 6 meses"
  //           (12, 24) → "1 ano até 2 anos"
  //           (6, 18) → "6 meses até 1 ano e 6 meses"
  // ─────────────────────────────────────────────────────────────────────────
  labelPublicoAlvo(min: number, max: number): string {
    // Função interna que formata um único valor de meses em texto amigável
    const fmt = (m: number): string => {
      if (m === 0) return 'recém-nascido'; // caso especial: zero meses

      if (m < 12) return `${m} meses`; // menos de 1 ano: exibe só meses

      const anos = Math.floor(m / 12); // parte inteira = anos completos
      const meses = m % 12; // resto = meses restantes após os anos
      const aStr = `${anos} ano${anos > 1 ? 's' : ''}`; // pluraliza "ano/anos"

      // Se não sobra meses, retorna só os anos; caso contrário, concatena ambos
      return meses === 0
        ? aStr
        : `${aStr} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`; // pluraliza "mês/meses"
    };

    // Monta a string final com os dois extremos do intervalo
    return `${fmt(min)} até ${fmt(max)}`;
  }

  // Getter — conta quantas campanhas estão com status 'ativa'
  // Usado no "hero" da página para exibir o total de campanhas em andamento
  get totalAtivas(): number {
    return this.campanhas.filter((c) => c.status === 'ativa').length;
  }

  // Getter — conta quantas campanhas são relevantes para a família do usuário
  // Usado para destacar campanhas que têm ao menos uma criança elegível
  get totalParaFamilia(): number {
    return this.campanhas.filter((c) => c.paraMinhaFamilia).length;
  }
}
