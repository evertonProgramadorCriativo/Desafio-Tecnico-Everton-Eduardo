/**
 * Função PURA para calcular o resumo vacinal de uma criança.
 * Sem efeitos colaterais — recebe DoseStatusItem[], retorna ResumoVacinal.
 *
 * Regra 4 do README:
 * CONTAR total de doses que deveriam ter sido aplicadas até hoje
 * CONTAR doses com status = "aplicada" dentro desse grupo
 * CALCULAR percentual = aplicadas / totalEsperadas
 */

import {
  DoseStatusItem,
  ResumoVacinal,
} from '../services/vaccine-status.service';
import { DoseStatus } from '../models/dose-status.enum';
import { calculateDoseStatus } from './dose-status.calculator';
import { Child } from '../models/child.model';
import { Vaccine } from '../models/vaccine.model';
import { VaccinationRecord } from '../models/vaccination-record.model';
import { CHILDREN_MOCK } from '../data/children.mock';
import { VACCINES_MOCK } from '../data/vaccines.mock';
import { RECORDS_MOCK } from '../data/records.mock';

//  Função principal

export function calcularResumoVacinal(items: DoseStatusItem[]): ResumoVacinal {
  const hoje = new Date();

  // CONTAR -> apenas doses que deveriam ter sido aplicadas até hoje
  const devidas = items.filter((i) => i.dataPrevista <= hoje);

  const total = devidas.length;
  const aplicadas = devidas.filter(
    (i) => i.status === DoseStatus.APLICADA,
  ).length;
  const atrasadas = devidas.filter(
    (i) => i.status === DoseStatus.ATRASADA,
  ).length;
  const pendentes = devidas.filter(
    (i) => i.status === DoseStatus.PENDENTE,
  ).length;

  // Futuras não entram no "devidas", mas contamos no total geral
  const futuras = items.filter((i) => i.status === DoseStatus.FUTURA).length;

  // CALCULAR -> percentual de cobertura vacinal
  const percentual = total > 0 ? Math.round((aplicadas / total) * 100) : 100;

  return { total, aplicadas, atrasadas, pendentes, futuras, percentual };
}

//  Função auxiliar: monta itens a partir de dados brutos

function montarItens(
  child: Child,
  vaccines: Vaccine[],
  records: VaccinationRecord[],
): DoseStatusItem[] {
  const itens: DoseStatusItem[] = [];

  for (const vacina of vaccines) {
    for (const dose of vacina.doses) {
      const r = calculateDoseStatus(child, dose, vacina.id!, records);
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

  return itens;
}

//  Teste: console.log resumo das 2 crianças mock

export function testarCalculadoraResumo(): void {
  console.group('[VaccinationSummaryCalculator] Resumo das 2 crianças mock');

  for (const child of CHILDREN_MOCK) {
    const itens = montarItens(child, VACCINES_MOCK, RECORDS_MOCK);
    const resumo = calcularResumoVacinal(itens);

    console.log(`${child.nome}:`, {
      total: resumo.total,
      aplicadas: resumo.aplicadas,
      percentual: `${resumo.percentual}%`,
      atrasadas: resumo.atrasadas,
      pendentes: resumo.pendentes,
      futuras: resumo.futuras,
    });
  }

  console.groupEnd();
}
