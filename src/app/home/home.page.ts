// Importa os recursos básicos do Angular
import { Component, OnInit } from '@angular/core';

// Importa componentes visuais do Ionic utilizados na página
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular/standalone';

// Importa os modelos (interfaces) utilizados na aplicação
import { Child }             from '../models/child.model';
import { Vaccine }           from '../models/vaccine.model';
import { VaccinationRecord } from '../models/vaccination-record.model';
import { Campaign }          from '../models/campaign.model';

// Importa o enum que representa os possíveis status de uma dose
import { DoseStatus }        from '../models/dose-status.enum';

@Component({
  // Nome utilizado para identificar o componente no HTML
  selector: 'app-home',

  // Arquivo HTML associado ao componente
  templateUrl: 'home.page.html',

  // Define o componente como standalone (não precisa de módulo)
  standalone: true,

  // Componentes Ionic disponíveis no template
  imports: [IonHeader, IonToolbar, IonTitle, IonContent]
})
export class HomePage implements OnInit {

  /**
   * Método executado automaticamente
   * quando a página é inicializada.
   */
  ngOnInit() {

    /**
     * Exemplo de cadastro de uma criança.
     * Representa o paciente que receberá as vacinas.
     */
    const child: Child = {
      nome: 'Lucas',
      dataNascimento: '2022-03-15',
      sexo: 'M',
      responsavelId: 'user-001'
    };

    /**
     * Exemplo de vacina cadastrada.
     * Contém informações gerais e o esquema de doses.
     */
    const vaccine: Vaccine = {
      nome: 'Poliomielite',
      sigla: 'VIP',
      descricao: 'Vacina inativada contra poliomielite',
      doses: [
        {
          doseNumero: 1,
          idadeRecomendadaMeses: 2,
          toleranciaMeses: 1
        },
        {
          doseNumero: 2,
          idadeRecomendadaMeses: 4,
          toleranciaMeses: 1
        },
        {
          doseNumero: 3,
          idadeRecomendadaMeses: 6,
          toleranciaMeses: 1
        },
      ]
    };

    /**
     * Exemplo de registro de vacinação.
     * Armazena quando e onde uma dose foi aplicada.
     */
    const record: VaccinationRecord = {
      childId: 'child-001',
      vaccineId: 'vaccine-001',
      doseNumero: 1,
      dataAplicacao: '2022-05-20',
      local: 'UBS Vila Nova',
      lote: 'LT-2022-A'
    };

    /**
     * Exemplo de campanha de vacinação.
     * Define período, público-alvo e vacinas participantes.
     */
    const campaign: Campaign = {
      titulo: 'Campanha Multivacinação 2024',
      descricao: 'Atualização da caderneta para crianças de 0 a 5 anos',
      dataInicio: '2024-08-01',
      dataFim: '2024-08-31',
      publicoAlvo: {
        idadeMinMeses: 0,
        idadeMaxMeses: 60
      },
      vaccineIds: ['vaccine-001', 'vaccine-002'],
      status: 'ativa'
    };

    /**
     * Exibe os dados de exemplo no console do navegador.
     * Útil para testes e validação dos modelos.
     */
    /** 
    console.log('Child:', child);
    console.log('Vaccine:', vaccine);
    console.log('Record:', record);
    console.log('Campaign:', campaign);
*/
    /**
     * Mostra todos os valores definidos
     * no enum DoseStatus.
     */
    console.log('DoseStatus values:', DoseStatus);
  }
}