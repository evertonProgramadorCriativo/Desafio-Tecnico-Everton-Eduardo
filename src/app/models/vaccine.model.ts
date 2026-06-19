/**
 * Modelo que representa uma dose de uma vacina.
 *
 * Define a ordem da dose, a idade recomendada
 * para aplicação e a tolerância permitida.
 */
export interface VaccineDose {

  /**
   * Número da dose dentro do esquema vacinal.
   *
   * Exemplo:
   * 1 = Primeira dose
   * 2 = Segunda dose
   * 3 = Terceira dose
   */
  doseNumero: number;

  /**
   * Idade recomendada para aplicação da dose,
   * expressa em meses de vida da criança.
   *
   * Exemplo:
   * 2 = 2 meses de idade
   * 4 = 4 meses de idade
   */
  idadeRecomendadaMeses: number;

  /**
   * Margem de tolerância para aplicação da dose,
   * também em meses.
   *
   * Exemplo:
   * Se a dose é recomendada aos 2 meses e
   * a tolerância é 1 mês, ela poderá ser
   * considerada dentro do prazo até os 3 meses.
   */
  toleranciaMeses: number;
}

/**
 * Modelo que representa uma vacina cadastrada
 * no sistema de vacinação.
 *
 * Contém informações gerais da vacina e
 * o conjunto de doses que compõem seu esquema vacinal.
 */
export interface Vaccine {

  /**
   * Identificador único da vacina.
   * Opcional, normalmente gerado pelo banco de dados.
   */
  id?: string;

  /**
   * Nome completo da vacina.
   *
   * Exemplo:
   * Poliomielite
   * Hepatite B
   * Tríplice Viral
   */
  nome: string;

  /**
   * Sigla ou abreviação da vacina.
   *
   * Exemplo:
   * VIP
   * BCG
   * SCR
   */
  sigla: string;

  /**
   * Descrição detalhada da vacina,
   * indicando sua finalidade e proteção oferecida.
   */
  descricao: string;

  /**
   * Lista de doses que fazem parte
   * do esquema vacinal da vacina.
   */
  doses: VaccineDose[];
}