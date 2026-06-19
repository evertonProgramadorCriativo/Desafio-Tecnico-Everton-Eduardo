import { Vaccine } from '../models/vaccine.model';

/**
 * Catálogo de vacinas do Programa Nacional de Imunizações (PNI)
 * utilizadas no acompanhamento vacinal infantil.
 *
 * Cada vacina contém:
 * - id:        identificador único
 * - nome:      nome completo da vacina
 * - sigla:     abreviação oficial
 * - descricao: doenças que previne
 * - doses:     array com esquema de doses (idade recomendada + tolerância)
 *
 * idadeRecomendadaMeses -> idade ideal para aplicar a dose
 * toleranciaMeses       -> margem aceitável após a idade recomendada
 *                         ex: recomendada aos 2m + tolerância 1m = atrasada após 3m
 */


export const VACCINES_MOCK: Vaccine[] = [

      //  Dose ao nascer + 2 reforços

  {
    id:        'v-001',
    nome:      'Hepatite B',
    sigla:     'HepB',
    descricao: 'Protege contra a hepatite B, doença que afeta o fígado.',
    doses: [
      { doseNumero: 1, idadeRecomendadaMeses: 0,  toleranciaMeses: 1 },
      { doseNumero: 2, idadeRecomendadaMeses: 2,  toleranciaMeses: 1 },
      { doseNumero: 3, idadeRecomendadaMeses: 6,  toleranciaMeses: 1 }
    ]
  },
    //   Vacina combinada (5 em 1)
  {
    id:        'v-002',
    nome:      'Pentavalente',
    sigla:     'PENTA',
    descricao: 'Protege contra difteria, tétano, coqueluche, hepatite B e Hib.',
    doses: [
      { doseNumero: 1, idadeRecomendadaMeses: 2, toleranciaMeses: 1 },
      { doseNumero: 2, idadeRecomendadaMeses: 4, toleranciaMeses: 1 },
      { doseNumero: 3, idadeRecomendadaMeses: 6, toleranciaMeses: 1 }
    ]
  },
  //   3 doses + 1 reforço aos 15 meses
  {
    id:        'v-003',
    nome:      'Poliomielite Inativada',
    sigla:     'VIP',
    descricao: 'Vacina inativada contra poliomielite (paralisia infantil).',
    doses: [
      { doseNumero: 1, idadeRecomendadaMeses: 2,  toleranciaMeses: 1 },
      { doseNumero: 2, idadeRecomendadaMeses: 4,  toleranciaMeses: 1 },
      { doseNumero: 3, idadeRecomendadaMeses: 6,  toleranciaMeses: 1 },
      { doseNumero: 4, idadeRecomendadaMeses: 15, toleranciaMeses: 2 }
    ]
  },
  // 2 doses + 1 reforço aos 12 meses
  {
    id:        'v-004',
    nome:      'Pneumocócica 10-valente',
    sigla:     'Pneumo10',
    descricao: 'Protege contra pneumonia, meningite e otite causadas pelo pneumococo.',
    doses: [
      { doseNumero: 1, idadeRecomendadaMeses: 2,  toleranciaMeses: 1 },
      { doseNumero: 2, idadeRecomendadaMeses: 4,  toleranciaMeses: 1 },
      { doseNumero: 3, idadeRecomendadaMeses: 12, toleranciaMeses: 2 }
    ]
  },
  // Apenas 2 doses (janela etária restrita)
  {
    id:        'v-005',
    nome:      'Rotavírus Humano',
    sigla:     'VORH',
    descricao: 'Previne diarreia grave causada pelo rotavírus.',
    doses: [
      { doseNumero: 1, idadeRecomendadaMeses: 2, toleranciaMeses: 1 },
      { doseNumero: 2, idadeRecomendadaMeses: 4, toleranciaMeses: 1 }
    ]
  },
  // 3 doses + 1 reforço aos 12 meses
  {
    id:        'v-006',
    nome:      'Meningocócica C',
    sigla:     'MenC',
    descricao: 'Protege contra meningite causada pelo meningococo tipo C.',
    doses: [
      { doseNumero: 1, idadeRecomendadaMeses: 3,  toleranciaMeses: 1 },
      { doseNumero: 2, idadeRecomendadaMeses: 5,  toleranciaMeses: 1 },
      { doseNumero: 3, idadeRecomendadaMeses: 12, toleranciaMeses: 2 }
    ]
  },
    //  Início após o 1º aniversário
  {
    id:        'v-007',
    nome:      'Tríplice Viral',
    sigla:     'SCR',
    descricao: 'Protege contra sarampo, caxumba e rubéola.',
    doses: [
      { doseNumero: 1, idadeRecomendadaMeses: 12, toleranciaMeses: 2 },
      { doseNumero: 2, idadeRecomendadaMeses: 15, toleranciaMeses: 2 }
    ]
  },
   //   Dose única após 15 meses
  {
    id:        'v-008',
    nome:      'Varicela',
    sigla:     'VCZ',
    descricao: 'Previne a catapora e suas complicações.',
    doses: [
      { doseNumero: 1, idadeRecomendadaMeses: 15, toleranciaMeses: 2 }
    ]
  }
];