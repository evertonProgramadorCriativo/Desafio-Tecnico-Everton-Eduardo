/**
 * dose-status.calculator.ts
 *
 * Função PURA para calcular o status de uma dose vacinal.
 * Sem efeitos colaterais — recebe dados, retorna resultado.
 *
 * Regra 1 do README:
 * SE registro encontrado      → APLICADA
 * SE idadeAtual < recomendada → FUTURA
 * SE hoje <= dataLimite       → PENDENTE
 * SE hoje > dataLimite        → ATRASADA
 */

import { Child } from '../models/child.model';
import { VaccineDose } from '../models/vaccine.model';
import { VaccinationRecord } from '../models/vaccination-record.model';
import { DoseStatus } from '../models/dose-status.enum';

export interface DoseStatusResult {
  status: DoseStatus;
  dataPrevista: Date;
  dataLimite: Date;
  registro?: VaccinationRecord;
}

// Função principal

export function calculateDoseStatus(
  child: Child,
  dose: VaccineDose,
  vaccineId: string,
  records: VaccinationRecord[],
): DoseStatusResult {
  const nascimento = new Date(child.dataNascimento + 'T00:00:00');
  const hoje = new Date();

  const dataPrevista = addMonths(nascimento, dose.idadeRecomendadaMeses);
  const dataLimite = addMonths(dataPrevista, dose.toleranciaMeses);
  const idadeAtualMeses = calcularIdadeMeses(nascimento, hoje);

  const registro = records.find(
    (r) =>
      r.childId === child.id &&
      r.vaccineId === vaccineId &&
      r.doseNumero === dose.doseNumero,
  );

  let status: DoseStatus;

  if (registro) {
    status = DoseStatus.APLICADA;
  } else if (idadeAtualMeses < dose.idadeRecomendadaMeses) {
    status = DoseStatus.FUTURA;
  } else if (hoje <= dataLimite) {
    status = DoseStatus.PENDENTE;
  } else {
    status = DoseStatus.ATRASADA;
  }

  return { status, dataPrevista, dataLimite, registro };
}

// Teste dos 4 cenários (chamar de app.component.ts)

export function testarCalculadoraDose(): void {
  console.group('[DoseStatusCalculator] Teste dos 4 cenários');

  const base: Child = {
    id: 'test-child',
    nome: 'Teste',
    sexo: 'M',
    responsavelId: 'u1',
    dataNascimento: '',
  };

  const hoje = new Date();
  const mesesAtras = (n: number) => {
    const d = new Date(hoje);
    d.setMonth(d.getMonth() - n);
    return d.toISOString().split('T')[0];
  };

  // Cenário 1: APLICADA — registro existe
  const r1 = calculateDoseStatus(
    { ...base, dataNascimento: '2023-01-01' },
    { doseNumero: 1, idadeRecomendadaMeses: 0, toleranciaMeses: 1 },
    'v-001',
    [
      {
        childId: 'test-child',
        vaccineId: 'v-001',
        doseNumero: 1,
        dataAplicacao: '2023-01-01',
      },
    ],
  );
  console.log(
    'Cenário 1 APLICADA:',
    r1.status,
    r1.status === 'aplicada' ? 'PASS' : 'FAIL',
  );

  // Cenário 2: FUTURA — criança jovem demais
  const r2 = calculateDoseStatus(
    { ...base, dataNascimento: mesesAtras(1) },
    { doseNumero: 1, idadeRecomendadaMeses: 12, toleranciaMeses: 2 },
    'v-007',
    [],
  );
  console.log(
    'Cenário 2 FUTURA:',
    r2.status,
    r2.status === 'futura' ? 'PASS' : 'FAIL',
  );

  // Cenário 3: PENDENTE — na idade certa, sem registro, dentro da tolerância
  const r3 = calculateDoseStatus(
    { ...base, dataNascimento: mesesAtras(2) },
    { doseNumero: 1, idadeRecomendadaMeses: 2, toleranciaMeses: 1 },
    'v-002',
    [],
  );
  console.log(
    'Cenário 3 PENDENTE:',
    r3.status,
    r3.status === 'pendente' ? 'PASS' : 'FAIL',
  );

  // Cenário 4: ATRASADA — passou da tolerância, sem registro
  const r4 = calculateDoseStatus(
    { ...base, dataNascimento: '2021-01-01' },
    { doseNumero: 1, idadeRecomendadaMeses: 2, toleranciaMeses: 1 },
    'v-002',
    [],
  );
  console.log(
    'Cenário 4 ATRASADA:',
    r4.status,
    r4.status === 'atrasada' ? 'PASS' : 'FAIL',
  );

  console.groupEnd();
}

// Helpers privados

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function calcularIdadeMeses(nascimento: Date, referencia: Date): number {
  let meses = (referencia.getFullYear() - nascimento.getFullYear()) * 12;
  meses += referencia.getMonth() - nascimento.getMonth();
  if (referencia.getDate() < nascimento.getDate()) meses--;
  return Math.max(0, meses);
}
