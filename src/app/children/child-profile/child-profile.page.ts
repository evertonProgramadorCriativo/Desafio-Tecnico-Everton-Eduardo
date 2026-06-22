// ─────────────────────────────────────────────────────────────────────────────
// Importações do núcleo do Angular
// ─────────────────────────────────────────────────────────────────────────────

// Component  : decorator que transforma a classe em componente Angular
// OnInit     : interface que exige a implementação de ngOnInit() (após criação)
// OnDestroy  : interface que exige a implementação de ngOnDestroy() (antes de destruir)
// inject     : função utilitária para injetar dependências sem usar o construtor
import { Component, OnInit, OnDestroy, inject } from '@angular/core';

// ActivatedRoute: serviço que expõe os parâmetros da rota ativa (ex: /child/:id)
// Usado para ler o 'id' da criança diretamente da URL
import { ActivatedRoute } from '@angular/router';

// Subscription: tipo retornado pelo .subscribe() do RxJS
// Armazenado para poder cancelar (unsubscribe) quando o componente for destruído
// Evita memory leak caso o componente seja removido enquanto o Observable ainda emite
import { Subscription } from 'rxjs';

// ─────────────────────────────────────────────────────────────────────────────
// Componentes Ionic (modo standalone — cada um importado individualmente)
// ─────────────────────────────────────────────────────────────────────────────
import {
  IonHeader, // barra de cabeçalho da página
  IonToolbar, // faixa interna do header (título + botões)
  IonTitle, // texto centralizado na toolbar
  IonContent, // área de conteúdo rolável da página
  IonButtons, // container de agrupamento de botões na toolbar
  IonBackButton, // botão "voltar" com comportamento nativo de navegação
  IonIcon, // ícone vetorial (usa a biblioteca ionicons)
  IonCard, // cartão com elevação (container visual)
  IonCardContent, // corpo interno do cartão com padding
  IonCardHeader, // cabeçalho interno do cartão (contém IonCardTitle)
  IonCardTitle, // título dentro do IonCardHeader
  IonProgressBar, // barra de progresso horizontal (usado para percentual vacinal)
  IonBadge, // pílula colorida para exibir contadores (doses atrasadas etc.)
} from '@ionic/angular/standalone';

// addIcons: registra os ícones escolhidos para uso via <ion-icon name="..."> no template
import { addIcons } from 'ionicons';

// Ícones individuais — cada um precisa ser registrado explicitamente no modo standalone
import {
  calendarOutline, // ícone de calendário — representa data de nascimento/agenda
  personOutline, // ícone de pessoa — representa dados do perfil
  medkitOutline, // ícone de kit médico — representa vacinas
  checkmarkCircleOutline, // ícone de check — representa doses aplicadas
  alertCircleOutline, // ícone de alerta — representa doses atrasadas
  timeOutline, // ícone de relógio — representa doses próximas/pendentes
} from 'ionicons/icons';

// DatePipe: pipe nativo do Angular para formatar datas no template ({{ data | date:'...' }})
import { DatePipe } from '@angular/common';

// ─────────────────────────────────────────────────────────────────────────────
// Importações internas do projeto — serviços e modelos
// ─────────────────────────────────────────────────────────────────────────────

// VaccineStatusService : serviço central de negócio vacinal
// DoseStatusItem       : representa o status de uma dose individual (aplicada, pendente, atrasada…)
// ResumoVacinal        : objeto agregado com totais e percentual de cobertura vacinal
// Alerta               : objeto que descreve um alerta de dose atrasada ou próxima
import {
  VaccineStatusService,
  DoseStatusItem,
  ResumoVacinal,
  Alerta,
} from '../../services/vaccine-status.service';

// VaccinationRecordService: serviço que expõe um Observable reativo com os registros de vacinação
// Quando um novo registro é adicionado, emite automaticamente para todos os subscribers
import { VaccinationRecordService } from '../../services/vaccination-record.service';

// VaccinationCardComponent: componente filho que renderiza a carteirinha de vacinação completa
import { VaccinationCardComponent } from '../vaccination-card/vaccination-card.component';

// Child: interface/modelo que define os campos de uma criança
import { Child } from '../../models/child.model';

// Dados mock estáticos usados enquanto o back-end (Firestore) não está integrado
import { CHILDREN_MOCK } from '../../data/children.mock'; // lista de crianças fictícias
import { VACCINES_MOCK } from '../../data/vaccines.mock'; // lista de vacinas fictícias
import { CAMPAIGNS_MOCK } from '../../data/campaigns.mock'; // lista de campanhas fictícias

// Funções de teste dos calculadores puros — executadas no ngOnInit para validar lógica no console
import { testarCalculadoraDose } from '../../utils/dose-status.calculator';
import { testarCalculadoraResumo } from '../../utils/vaccination-summary.calculator';

// ─────────────────────────────────────────────────────────────────────────────
// Decorator @Component — metadados do componente
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-child-profile', // tag usada para instanciar o componente
  templateUrl: 'child-profile.page.html', // template HTML associado
  styleUrls: ['child-profile.page.scss'], // estilos SCSS associados
  standalone: true, // não precisa de NgModule
  imports: [
    DatePipe, // habilita o pipe de data no template
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
    IonProgressBar, // barra de progresso do percentual vacinal
    IonBadge, // badges coloridos dos contadores de status
    VaccinationCardComponent, // componente filho da carteirinha — recebe dados via @Input
  ],
})
export class ChildProfilePage implements OnInit, OnDestroy {
  // ─────────────────────────────────────────────────────────────────────────
  // Estado público — consumido diretamente pelo template via binding
  // ─────────────────────────────────────────────────────────────────────────

  // Criança carregada a partir do id da rota; null até o loadChild() ser executado
  child: Child | null = null;

  // Texto formatado da idade (ex: "8 meses", "2 anos e 3 meses") — exibido no perfil
  idadeFormatada = '';

  // Objeto com os totais e percentual de cobertura vacinal da criança
  // Inicializado com zeros para evitar erros de binding antes da resposta assíncrona
  resumoVacinal: ResumoVacinal = {
    total: 0, // total de doses esperadas para a criança
    aplicadas: 0, // doses já vacinadas com registro
    atrasadas: 0, // doses que já deveriam ter sido aplicadas mas não foram
    pendentes: 0, // doses dentro do prazo ainda não aplicadas
    futuras: 0, // doses que só serão devidas no futuro
    percentual: 0, // (aplicadas / total) * 100 — alimenta o IonProgressBar
  };

  // Lista de alertas gerados para doses atrasadas ou próximas do vencimento
  // Exibidos abaixo da barra de progresso no template
  alertas: Alerta[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // Estado privado — controle interno, não acessado pelo template
  // ─────────────────────────────────────────────────────────────────────────

  // Referência à assinatura reativa do recordService
  // O '?' indica que pode ser undefined se loadChild() nunca for chamado
  // Necessária para o unsubscribe() no ngOnDestroy() — evita memory leak
  private sub?: Subscription;

  // ActivatedRoute: permite ler os parâmetros da URL ativa (ex: /child/abc123)
  private route = inject(ActivatedRoute);

  // VaccineStatusService: lógica de negócio — monta carteirinha, calcula resumo e alertas
  private vaccineStatus = inject(VaccineStatusService);

  // VaccinationRecordService: fonte de dados reativa dos registros de vacinação
  private recordService = inject(VaccinationRecordService);

  constructor() {
    // Registra os ícones que serão usados no template via <ion-icon name="...">
    // Obrigatório no modo standalone; sem isso os ícones renderizam invisíveis
    addIcons({
      calendarOutline,
      personOutline,
      medkitOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      timeOutline,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle hooks
  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit() {
    // Executa os testes dos calculadores puros no console — útil durante o desenvolvimento
    // para confirmar que as regras de negócio estão corretas antes de integrar com a UI
    testarCalculadoraDose();
    testarCalculadoraResumo();

    // Lê o parâmetro 'id' da URL atual (ex: /child/abc123 → 'abc123')
    // snapshot é uma leitura única, suficiente aqui pois o id não muda durante o ciclo de vida
    const id = this.route.snapshot.paramMap.get('id');

    // Se o id existir na URL, inicia o carregamento da criança e de seus dados vacinais
    if (id) this.loadChild(id);
  }

  ngOnDestroy() {
    // Cancela a assinatura reativa ao destruir o componente (ex: ao navegar para outra página)
    // O operador '?.' protege contra o caso em que sub nunca foi atribuído (criança não encontrada)
    // Sem isso, o callback do subscribe() continuaria executando em background → memory leak
    this.sub?.unsubscribe();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Métodos privados — lógica interna não exposta ao template
  // ─────────────────────────────────────────────────────────────────────────

  private loadChild(id: string) {
    // Busca a criança pelo id nos dados mock (futuramente virá do Firestore)
    const found = CHILDREN_MOCK.find((c) => c.id === id);

    // Guard clause: se não encontrar, emite aviso no console e aborta
    if (!found) {
      console.warn('Criança não encontrada:', id);
      return;
    }

    // Armazena a criança encontrada e calcula a string de idade para exibição
    this.child = found;
    this.idadeFormatada = this.calcularIdade(found.dataNascimento);

    // Assina o Observable de registros da criança
    // O subscribe() é chamado toda vez que um novo registro de vacinação é adicionado/removido,
    // garantindo que a carteirinha e o resumo sempre reflitam o estado mais recente
    this.sub = this.recordService.getRecordsByChild(id).subscribe((records) => {
      // Monta a carteirinha dividida em fases (ex: "Ao nascer", "2 meses", etc.)
      // Cada fase contém um array de DoseStatusItem com o status calculado de cada dose
      const fases = this.vaccineStatus.montarCarteirinha(
        found,
        VACCINES_MOCK,
        records,
      );

      // Achata o array de fases → array de fases → array de doses em uma estrutura plana
      // Primeiro reduce: junta os arrays de doses de todas as fases em um único array
      // Segundo reduce: resolve casos onde item é um array aninhado (garante planura total)
      const itens: DoseStatusItem[] = fases
        .reduce<DoseStatusItem[]>((acc, f) => acc.concat(f.doses), [])
        .reduce<DoseStatusItem[]>((acc, item) => acc.concat(item), []);

      // Recalcula o resumo vacinal (totais e percentual) com a lista de doses atualizada
      this.resumoVacinal = this.vaccineStatus.calcularResumoVacinal(itens);

      // Gera a lista de alertas (doses atrasadas e próximas) para a criança atual
      this.alertas = this.vaccineStatus.gerarAlertas(found, itens);

      // Log de diagnóstico — mostra o resumo no console após cada atualização
      console.log('Resumo:', this.resumoVacinal);
    });
  }

  // Função de track para o @for do template que itera sobre alertas
  // Resolve o erro TS2532 ("Object is possibly undefined") exigido pelo modo strict
  // O Angular usa essa chave para identificar cada alerta de forma única e otimizar a re-renderização
  // Combina id da vacina + número da dose para garantir unicidade
  trackAlerta(_index: number, alerta: Alerta): string {
    return (alerta.vacina?.id ?? '') + String(alerta.dose?.doseNumero ?? '');
    //       ↑ operador '?.' acessa id se vacina existir, '??' usa '' como fallback
    //                                  ↑ mesmo padrão para doseNumero, convertido para string
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters computados — recalculados automaticamente quando o template os referencia
  // ─────────────────────────────────────────────────────────────────────────

  // Atalho direto para o percentual do resumo — alimenta o valor do IonProgressBar
  // IonProgressBar espera um número entre 0 e 1, então o template deve dividir por 100
  get percentualAplicadas(): number {
    return this.resumoVacinal.percentual;
  }

  // Retorna a classe CSS aplicada ao IonProgressBar conforme o nível de cobertura:
  // ≥ 80% → 'prog-verde'  (situação boa)
  // ≥ 50% → 'prog-amarelo' (atenção)
  // < 50% → 'prog-laranja' (urgente)
  get progressClass(): string {
    const pct = this.resumoVacinal.percentual;
    if (pct >= 80) return 'prog-verde';
    if (pct >= 50) return 'prog-amarelo';
    return 'prog-laranja';
  }

  // Retorna o texto de status exibido ao lado da barra de progresso
  // Espelha a mesma lógica de faixas do progressClass para consistência visual
  get statusTexto(): string {
    const pct = this.resumoVacinal.percentual;
    if (pct >= 80) return 'Em dia';
    if (pct >= 50) return 'Atenção';
    return 'Urgente';
  }

  // Filtra apenas os alertas de urgência 'alta' (doses atrasadas)
  // Usado para exibir uma lista separada e destacada no template
  get alertasAtrasados(): Alerta[] {
    return this.alertas.filter((a) => a.urgencia === 'alta');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Métodos utilitários — chamados diretamente pelo template
  // ─────────────────────────────────────────────────────────────────────────

  // Retorna a inicial maiúscula do nome para exibição no avatar circular
  // Ex: "Maria Júlia" → 'M'
  getInicial(nome: string): string {
    return nome.charAt(0).toUpperCase();
  }

  // Retorna a cor CSS do avatar conforme o sexo da criança
  // 'M' → verde (--vk-green) | 'F' → laranja (--vk-orange)
  // Usa variáveis CSS do design system do VacinaKids para consistência de tema
  getAvatarColor(sexo: string): string {
    return sexo === 'M' ? 'var(--vk-green)' : 'var(--vk-orange)';
  }

  // Converte uma string de data de nascimento em texto legível de idade
  // Exemplos de saída: "3 meses" | "1 ano" | "2 anos e 4 meses"
  calcularIdade(dataNascimento: string): string {
    const hoje = new Date();

    // O sufixo 'T00:00:00' força a interpretação como horário local
    // Sem ele, o construtor Date() interpreta strings 'YYYY-MM-DD' como UTC,
    // o que pode deslocar o dia para o anterior dependendo do fuso horário
    const nasc = new Date(dataNascimento + 'T00:00:00');

    // Calcula anos e meses brutos pela diferença de componentes da data
    let anos = hoje.getFullYear() - nasc.getFullYear();
    let meses = hoje.getMonth() - nasc.getMonth();

    // Ajuste: se o mês ainda não chegou neste ano, reduz um ano e soma 12 meses
    // Ex: nasceu em outubro, hoje é março → meses seria -7 → ajusta para 5
    if (meses < 0) {
      anos--;
      meses += 12;
    }

    const totalMeses = anos * 12 + meses; // total de meses de vida para o caso < 1 ano

    // Menos de 12 meses: exibe só em meses (ex: "8 meses")
    if (totalMeses < 12) return `${totalMeses} meses`;

    // Exatamente anos cheios: omite a parte de meses (ex: "2 anos")
    if (meses === 0) return `${anos} ano${anos > 1 ? 's' : ''}`;

    // Caso geral: anos + meses com pluralização correta (ex: "1 ano e 1 mês", "3 anos e 5 meses")
    return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }
}
