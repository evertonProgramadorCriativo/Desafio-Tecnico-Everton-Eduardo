/**
 * Modelo que representa o registro de aplicação
 * de uma vacina em uma criança.
 *
 * Cada registro corresponde a uma dose aplicada,
 * armazenando informações como data, local e profissional responsável.
 */
export interface VaccinationRecord {

  /**
   * Identificador único do registro.
   * Opcional, geralmente gerado pelo banco de dados.
   */
  id?: string;

  /**
   * ID da criança que recebeu a vacina.
   * Relaciona o registro ao cadastro da criança.
   */
  childId: string;

  /**
   * ID da vacina aplicada.
   * Relaciona o registro ao cadastro da vacina.
   */
  vaccineId: string;

  /**
   * Número da dose aplicada.
   * Exemplo:
   * 1 = Primeira dose
   * 2 = Segunda dose
   * 3 = Terceira dose
   */
  doseNumero: number;

  /**
   * Data em que a vacina foi aplicada.
   *
   * Formato ISO: YYYY-MM-DD
   * Exemplo: '2023-06-10'
   */
  dataAplicacao: string;

  /**
   * Local onde a vacinação foi realizada.
   * Exemplo: UBS Centro, Hospital Municipal.
   */
  local?: string;

  /**
   * Número do lote da vacina aplicada.
   * Utilizado para rastreabilidade e controle sanitário.
   */
  lote?: string;

  /**
   * Nome do profissional responsável pela aplicação.
   * Exemplo: Enfermeira Maria Silva.
   */
  profissional?: string;
}