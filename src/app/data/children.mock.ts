import { Child } from '../models/child.model';

/**
 * Dados simulados de crianças cadastradas para testes e desenvolvimento da aplicação.
 */

export const CHILDREN_MOCK: Child[] = [
  {
    id:             'child-001',
    nome:           'Lucas Silva',
    dataNascimento: '2022-03-15',
    sexo:           'M',
    responsavelId:  'user-001'
  },
  {
    id:             'child-002',
    nome:           'Ana Silva',
    dataNascimento: '2020-07-22',
    sexo:           'F',
    responsavelId:  'user-001'
  }
];