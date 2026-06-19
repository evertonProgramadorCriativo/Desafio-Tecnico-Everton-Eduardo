import { Campaign } from '../models/campaign.model';


// Dados simulados de campanhas de vacinação para testes da aplicação.
export const CAMPAIGNS_MOCK: Campaign[] = [
  {
    id:          'camp-001',
    titulo:      'Campanha Multivacinação 2025',
    descricao:   'Atualização da caderneta de vacinação para crianças de 0 a 5 anos. Procure a UBS mais próxima.',
    dataInicio:  '2025-08-01',
    dataFim:     '2026-08-31',
    publicoAlvo: { idadeMinMeses: 0, idadeMaxMeses: 60 },
    vaccineIds:  ['v-001', 'v-002', 'v-003'],
    status:      'ativa'
  },
  {
    id:          'camp-002',
    titulo:      'Campanha Poliomielite 2024',
    descricao:   'Campanha nacional de vacinação contra a poliomielite.',
    dataInicio:  '2024-06-01',
    dataFim:     '2024-06-30',
    publicoAlvo: { idadeMinMeses: 0, idadeMaxMeses: 59 },
    vaccineIds:  ['v-003'],
    status:      'encerrada'
  }
];