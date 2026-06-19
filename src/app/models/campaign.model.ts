/**
 * Define os possíveis estados de uma campanha.
 * - ativa: campanha em andamento.
 * - encerrada: campanha finalizada.
 */
export type CampaignStatus = 'ativa' | 'encerrada';

/**
 * Representa o público-alvo da campanha,
 * definido pela faixa etária em meses.
 */
export interface CampaignPublicoAlvo {

  /**
   * Idade mínima permitida para participar da campanha.
   */
  idadeMinMeses: number;

  /**
   * Idade máxima permitida para participar da campanha.
   */
  idadeMaxMeses: number;
}

/**
 * Modelo que representa uma campanha de vacinação.
 * Armazena informações como período, público-alvo,
 * vacinas participantes e status da campanha.
 */
export interface Campaign {

  /**
   * Identificador único da campanha.
   * Opcional, geralmente gerado pelo banco de dados.
   */
  id?: string;

  /**
   * Nome ou título da campanha.
   * Exemplo: "Campanha Nacional de Multivacinação".
   */
  titulo: string;

  /**
   * Descrição detalhada da campanha.
   */
  descricao: string;

  /**
   * Data de início da campanha.
   * Formato ISO (YYYY-MM-DD).
   */
  dataInicio: string;

  /**
   * Data de encerramento da campanha.
   * Formato ISO (YYYY-MM-DD).
   */
  dataFim: string;

  /**
   * Faixa etária do público-alvo da campanha.
   */
  publicoAlvo: CampaignPublicoAlvo;

  /**
   * Lista de IDs das vacinas incluídas na campanha.
   */
  vaccineIds: string[];

  /**
   * Situação atual da campanha.
   * Pode ser "ativa" ou "encerrada".
   */
  status: CampaignStatus;
}