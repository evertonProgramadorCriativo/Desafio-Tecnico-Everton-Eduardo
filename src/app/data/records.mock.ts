import { VaccinationRecord } from '../models/vaccination-record.model';

/**
 * Base de dados simulada contendo o histórico de vacinação
 * das crianças cadastradas no sistema.
 *
 * Utilizada para testes, demonstrações e validação das regras
 * de negócio relacionadas ao calendário vacinal, incluindo:
 * - Doses aplicadas;
 * - Doses pendentes;
 * - Doses atrasadas;
 * - Controle de campanhas e cobertura vacinal.
 *
 * Cenários simulados:
 * - Lucas (child-001): possui apenas parte do esquema vacinal concluído,
 *   permitindo testar vacinas pendentes e atrasadas.
 *
 * - Ana (child-002): possui maior cobertura vacinal, mas ainda apresenta
 *   algumas doses não registradas, permitindo validar regras de atraso.
 */
export const RECORDS_MOCK: VaccinationRecord[] = [

  // Histórico de vacinação da criança Lucas (child-001)
  { id: 'r-001', childId: 'child-001', vaccineId: 'v-001', doseNumero: 1, dataAplicacao: '2022-03-15', local: 'Maternidade São Lucas', lote: 'HB-22A' },
  { id: 'r-002', childId: 'child-001', vaccineId: 'v-001', doseNumero: 2, dataAplicacao: '2022-05-20', local: 'UBS Vila Nova', lote: 'HB-22B' },
  { id: 'r-003', childId: 'child-001', vaccineId: 'v-002', doseNumero: 1, dataAplicacao: '2022-05-20', local: 'UBS Vila Nova', lote: 'PT-22A' },
  { id: 'r-004', childId: 'child-001', vaccineId: 'v-003', doseNumero: 1, dataAplicacao: '2022-05-20', local: 'UBS Vila Nova', lote: 'VIP-22A' },
  { id: 'r-005', childId: 'child-001', vaccineId: 'v-004', doseNumero: 1, dataAplicacao: '2022-05-20', local: 'UBS Vila Nova', lote: 'PN-22A' },
  { id: 'r-006', childId: 'child-001', vaccineId: 'v-005', doseNumero: 1, dataAplicacao: '2022-05-22', local: 'UBS Vila Nova', lote: 'RV-22A' },

  // Lucas possui doses futuras ainda não registradas,
  // permitindo testar cenários de pendência e atraso.

  // Histórico de vacinação da criança Ana (child-002)
  { id: 'r-007', childId: 'child-002', vaccineId: 'v-001', doseNumero: 1, dataAplicacao: '2020-07-22', local: 'Maternidade Central', lote: 'HB-20A' },
  { id: 'r-008', childId: 'child-002', vaccineId: 'v-001', doseNumero: 2, dataAplicacao: '2020-09-25', local: 'UBS Jardim América', lote: 'HB-20B' },
  { id: 'r-009', childId: 'child-002', vaccineId: 'v-001', doseNumero: 3, dataAplicacao: '2021-02-10', local: 'UBS Jardim América', lote: 'HB-20C' },
  { id: 'r-010', childId: 'child-002', vaccineId: 'v-002', doseNumero: 1, dataAplicacao: '2020-09-25', local: 'UBS Jardim América', lote: 'PT-20A' },
  { id: 'r-011', childId: 'child-002', vaccineId: 'v-002', doseNumero: 2, dataAplicacao: '2020-11-20', local: 'UBS Jardim América', lote: 'PT-20B' },
  { id: 'r-012', childId: 'child-002', vaccineId: 'v-002', doseNumero: 3, dataAplicacao: '2021-02-10', local: 'UBS Jardim América', lote: 'PT-20C' },
  { id: 'r-013', childId: 'child-002', vaccineId: 'v-007', doseNumero: 1, dataAplicacao: '2021-08-05', local: 'Campanha Municipal', lote: 'SCR-21A' },

  // Ana possui esquema vacinal quase completo,
  // mas ainda com doses pendentes para validação de atrasos.
];