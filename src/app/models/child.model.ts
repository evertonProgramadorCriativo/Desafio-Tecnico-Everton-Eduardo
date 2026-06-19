/**
 * Modelo que representa uma criança cadastrada no sistema.
 * Contém informações pessoais necessárias para o acompanhamento
 * do calendário de vacinação.
 */
export interface Child {

  /**
   * Identificador único da criança.
   * Opcional, normalmente gerado pelo banco de dados.
   */
  id?: string;

  /**
   * Nome completo da criança.
   */
  nome: string;

  /**
   * Data de nascimento da criança.
   * Utilizada para calcular a idade e determinar
   * quais vacinas devem ser aplicadas.
   *
   * Formato ISO: YYYY-MM-DD
   * Exemplo: '2022-03-15'
   */
  dataNascimento: string;

  /**
   * Sexo da criança.
   * M = Masculino
   * F = Feminino
   */
  sexo: 'M' | 'F';

  /**
   * URL da foto da criança.
   * Campo opcional utilizado para exibir uma imagem
   * no perfil ou cartão de identificação.
   */
  fotoUrl?: string;

  /**
   * Identificador do responsável pela criança.
   * Relaciona a criança ao usuário responsável
   * cadastrado no sistema.
   */
  responsavelId: string;
}