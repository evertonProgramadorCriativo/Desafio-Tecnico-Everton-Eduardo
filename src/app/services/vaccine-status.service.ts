import { Injectable } from '@angular/core';

import { Child } from '../models/child.model';
import { Vaccine, VaccineDose } from '../models/vaccine.model';
import { VaccinationRecord } from '../models/vaccination-record.model';
import { Campaign } from '../models/campaign.model';
import { DoseStatus } from '../models/dose-status.enum';

// TIPOS AUXILIARES UTILIZADOS PELO VaccineStatusService

/**
 * Representa o resultado do cálculo de uma dose específica.
 *
 * Contém:
 * - A vacina relacionada
 * - A dose da vacina
 * - O status atual (aplicada, pendente, atrasada ou futura)
 * - Datas de referência para acompanhamento
 * - Registro da aplicação, quando existir
 */

export interface DoseStatusItem {
  vacina: Vaccine;
  dose: VaccineDose;
  status: DoseStatus;
  dataPrevista: Date;
  dataLimite: Date;
  registro?: VaccinationRecord;
}

/**
 * Agrupa as doses por faixa etária.
 *
 * Exemplo:
 * - Ao nascer
 * - 2 meses
 * - 4 meses
 * - 1 ano
 *
 * Utilizado para organizar a carteirinha vacinal
 * de forma semelhante ao calendário oficial.
 */

export interface FaseEtaria {
  label: string;
  idadeMeses: number;
  doses: DoseStatusItem[];
}
/**
 * Representa um alerta exibido para o responsável.
 *
 * Os alertas são gerados quando:
 * - Uma dose está atrasada.
 * - Uma dose está próxima da data prevista.
 *
 * Utilizado na tela inicial (Dashboard/Home).
 */
export interface Alerta {
  childId: string;
  childNome: string;
  vacina: Vaccine;
  dose: VaccineDose;
  status: DoseStatus.ATRASADA | DoseStatus.PENDENTE;
  dataPrevista: Date;
  urgencia: 'alta' | 'media';
}
/**
 * Resumo geral da situação vacinal da criança.
 *
 * Utilizado para exibir indicadores como:
 * - Total de doses previstas
 * - Quantidade aplicada
 * - Quantidade pendente
 * - Quantidade atrasada
 * - Percentual de cobertura vacinal
 */
export interface ResumoVacinal {
  total: number;
  aplicadas: number;
  atrasadas: number;
  pendentes: number;
  futuras: number;
  percentual: number;
}

@Injectable({ providedIn: 'root' })
export class VaccineStatusService {
  //  Regra 1: Status de uma dose
  //
  // CALCULAR -> dataPrevista = dataNascimento + idadeRecomendadaMeses
  // CALCULAR -> dataLimite   = dataPrevista   + toleranciaMeses
  // CALCULAR -> idadeAtualMeses
  // BUSCAR   -> existe registro da dose no histórico?
  //
  // SE encontrou              -> APLICADA
  // idadeAtual < recomendada  -> FUTURA
  // hoje <= dataLimite        -> PENDENTE
  // hoje > dataLimite         -> ATRASADA

  calcularStatusDose(
    child: Child,
    dose: VaccineDose,
    vaccineId: string,
    registros: VaccinationRecord[],
  ): {
    status: DoseStatus;
    dataPrevista: Date;
    dataLimite: Date;
    registro?: VaccinationRecord;
  } {
    // Data de nascimento da criança

    const nascimento = new Date(child.dataNascimento + 'T00:00:00');
    const hoje = new Date();

    const dataPrevista = this.addMonths(nascimento, dose.idadeRecomendadaMeses);
    const dataLimite = this.addMonths(dataPrevista, dose.toleranciaMeses);
    const idadeAtualMeses = this.calcularIdadeMeses(nascimento, hoje);

    // Procura no histórico se esta dose já foi aplicada

    const registro = registros.find(
      (r) =>
        r.childId === child.id &&
        r.vaccineId === vaccineId &&
        r.doseNumero === dose.doseNumero,
    );

    let status: DoseStatus;

    // Se existe registro, a dose já foi aplicada

    if (registro) {
      status = DoseStatus.APLICADA;
    }
    // Se a criança ainda não atingiu a idade recomendada,
    // a dose é considerada futura
    else if (idadeAtualMeses < dose.idadeRecomendadaMeses) {
      status = DoseStatus.FUTURA;
    }
    // Se a data atual ainda está dentro do prazo,
    // a dose está pendente
    else if (hoje <= dataLimite) {
      status = DoseStatus.PENDENTE;
    } else {
      status = DoseStatus.ATRASADA;
    }
    // Retorna todas as informações calculadas
    return { status, dataPrevista, dataLimite, registro };
  }

  /**
   * Monta a carteirinha vacinal completa da criança.
   *
   * Processo:
   * 1. Percorre todas as vacinas do catálogo.
   * 2. Percorre todas as doses de cada vacina.
   * 3. Calcula o status de cada dose.
   * 4. Agrupa as doses por faixa etária.
   * 5. Ordena as fases por idade crescente.
   */

  montarCarteirinha(
    child: Child,
    vacinas: Vaccine[],
    registros: VaccinationRecord[],
  ): FaseEtaria[] {
    // Lista que armazenará todas as doses processadas
    const itens: DoseStatusItem[] = [];
    // Percorre cada vacina cadastrada no sistema
    for (const vacina of vacinas) {
      // Percorre todas as doses da vacina atual

      for (const dose of vacina.doses) {
        // Calcula o status da dose para a criança
        const r = this.calcularStatusDose(child, dose, vacina.id!, registros);

        // Adiciona o resultado à lista da carteirinha

        itens.push({
          vacina,
          dose,
          status: r.status,
          dataPrevista: r.dataPrevista,
          dataLimite: r.dataLimite,
          registro: r.registro,
        });
      }
    }
    // Agrupa as doses por fase etária
    // e ordena da menor para a maior idade
    return this.agruparPorFase(itens).sort(
      (a, b) => a.idadeMeses - b.idadeMeses,
    );
  }

  //  Regra 3: Alertas da Home
  //
  // FILTRAR -> ATRASADA
  // FILTRAR -> PENDENTE e dataPrevista <= hoje + 30 dias
  // ORDENAR -> urgência (atrasada primeiro, depois pendente por data)

  /**
   * Gera os alertas que serão exibidos para o responsável.
   *
   * Regras:
   * - Doses atrasadas geram alerta de urgência alta.
   * - Doses pendentes com vencimento nos próximos 30 dias
   *   geram alerta de urgência média.
   * - Os alertas são ordenados por prioridade e data.
   */

  gerarAlertas(child: Child, carteirinha: DoseStatusItem[]): Alerta[] {
    // Data atual utilizada como referência
    const hoje = new Date();
    // Data limite para considerar doses próximas do vencimento
    // (30 dias a partir da data atual)

    const em30d = new Date(hoje);
    em30d.setDate(em30d.getDate() + 30);

    // Lista que armazenará os alertas gerados

    const alertas: Alerta[] = [];
    // Percorre todas as doses da carteirinha

    for (const item of carteirinha) {
      // Doses atrasadas possuem prioridade máxima
      if (item.status === DoseStatus.ATRASADA) {
        alertas.push({
          childId: child.id!,
          childNome: child.nome,
          vacina: item.vacina,
          dose: item.dose,
          status: DoseStatus.ATRASADA,
          dataPrevista: item.dataPrevista,
          urgencia: 'alta',
        });
      }
      // Doses pendentes que vencem nos próximos 30 dias
      // também geram alerta para lembrar o responsável
      else if (
        item.status === DoseStatus.PENDENTE &&
        item.dataPrevista <= em30d
      ) {
        alertas.push({
          childId: child.id!,
          childNome: child.nome,
          vacina: item.vacina,
          dose: item.dose,
          status: DoseStatus.PENDENTE,
          dataPrevista: item.dataPrevista,
          urgencia: 'media',
        });
      }
    }
    // Ordenação dos alertas:
    // 1º prioridade alta (atrasadas)
    // 2º prioridade média (pendentes)
    // 3º menor data prevista primeiro
    return alertas.sort((a, b) => {
      if (a.urgencia !== b.urgencia) return a.urgencia === 'alta' ? -1 : 1;
      return a.dataPrevista.getTime() - b.dataPrevista.getTime();
    });
  }

  /**
   * Calcula um resumo da situação vacinal da criança.
   *
   * O resumo considera apenas as doses que já deveriam
   * ter sido aplicadas até a data atual.
   *
   * Retorna:
   * - Total de doses esperadas
   * - Quantidade aplicada
   * - Quantidade atrasada
   * - Quantidade pendente
   * - Quantidade futura
   * - Percentual de cobertura vacinal
   */

  calcularResumoVacinal(carteirinha: DoseStatusItem[]): ResumoVacinal {
    // Data atual utilizada como referência
    const hoje = new Date();
    // Filtra apenas as doses que já deveriam ter sido aplicadas
    const devidas = carteirinha.filter((i) => i.dataPrevista <= hoje);

    // Quantidade total de doses esperadas até hoje
    const total = devidas.length;
    // Quantidade de doses que já foram aplicadas
    const aplicadas = devidas.filter(
      (i) => i.status === DoseStatus.APLICADA,
    ).length;
    // Quantidade de doses que estão em atraso

    const atrasadas = devidas.filter(
      (i) => i.status === DoseStatus.ATRASADA,
    ).length;
    // Quantidade de doses ainda dentro do prazo
    const pendentes = devidas.filter(
      (i) => i.status === DoseStatus.PENDENTE,
    ).length;
    // Quantidade de doses previstas para o futuro
    const futuras = carteirinha.filter(
      (i) => i.status === DoseStatus.FUTURA,
    ).length;
    // Calcula o percentual de cobertura vacinal
    // Fórmula: (aplicadas / total esperado) × 100
    const percentual = total > 0 ? Math.round((aplicadas / total) * 100) : 100;
    // Retorna os indicadores consolidados
    return { total, aplicadas, atrasadas, pendentes, futuras, percentual };
  }

  //  Regra 5: Filtrar campanhas relevantes
  //
  // CALCULAR  -> idadeAtualMeses da criança
  // VERIFICAR -> campanha.status === "ativa"
  // VERIFICAR -> idadeAtualMeses dentro da faixa etária da campanha

  filtrarCampanhas(child: Child, campanhas: Campaign[]): Campaign[] {
    const nascimento = new Date(child.dataNascimento + 'T00:00:00');
    const idadeAtualMeses = this.calcularIdadeMeses(nascimento, new Date());

    return campanhas.filter(
      (c) =>
        c.status === 'ativa' &&
        idadeAtualMeses >= c.publicoAlvo.idadeMinMeses &&
        idadeAtualMeses <= c.publicoAlvo.idadeMaxMeses,
    );
  }

  //  Helpers públicos

  /** Diferença em meses completos entre duas datas */
  calcularIdadeMeses(nascimento: Date, referencia: Date): number {
    let meses = (referencia.getFullYear() - nascimento.getFullYear()) * 12;
    meses += referencia.getMonth() - nascimento.getMonth();
    if (referencia.getDate() < nascimento.getDate()) meses--;
    return Math.max(0, meses);
  }

  //  Helpers privados

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  private agruparPorFase(itens: DoseStatusItem[]): FaseEtaria[] {
    const mapa = new Map<number, DoseStatusItem[]>();

    for (const item of itens) {
      const idade = item.dose.idadeRecomendadaMeses;
      if (!mapa.has(idade)) mapa.set(idade, []);
      mapa.get(idade)!.push(item);
    }

    return Array.from(mapa.entries()).map(([idadeMeses, doses]) => ({
      label: this.labelFase(idadeMeses),
      idadeMeses,
      doses,
    }));
  }

  /**
   * Converte uma idade em meses para um texto amigável.
   *
   * Exemplos:
   * 0  -> Ao nascer
   * 2  -> 2 meses
   * 12 -> 1 ano
   * 18 -> 1 ano e 6 meses
   */

  private labelFase(meses: number): string {
    // Faixa etária do nascimento
    if (meses === 0) return 'Ao nascer';
    // Menores de 1 ano
    if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    const anos = Math.floor(meses / 12);
    const m = meses % 12;
    const anosLabel = `${anos} ano${anos > 1 ? 's' : ''}`;

    // Exemplo: 18 meses -> 1 ano e 6 meses
    return m === 0
      ? anosLabel
      : `${anosLabel} e ${m} ${m === 1 ? 'mês' : 'meses'}`;
  }
}
