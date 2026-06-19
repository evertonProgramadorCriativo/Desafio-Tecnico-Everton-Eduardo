/**
 * Enum que representa os possíveis status de uma dose de vacina.
 *
 * Utilizado para indicar a situação de cada dose
 * no calendário de vacinação da criança.
 */
export enum DoseStatus {

  /**
   * A dose já foi aplicada e registrada no sistema.
   */
  APLICADA = 'aplicada',

  /**
   * A dose está prevista no calendário,
   * mas ainda não chegou a data recomendada.
   */
  PENDENTE = 'pendente',

  /**
   * A dose deveria ter sido aplicada,
   * mas o prazo recomendado já foi ultrapassado.
   */
  ATRASADA = 'atrasada',

  /**
   * A dose será necessária no futuro,
   * de acordo com a idade da criança.
   */
  FUTURA = 'futura'
}