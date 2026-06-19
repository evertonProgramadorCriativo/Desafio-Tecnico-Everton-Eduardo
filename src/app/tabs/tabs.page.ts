// Importa o decorator Component do Angular.
// É usado para transformar a classe em um componente Angular.
import { Component } from '@angular/core';

// Importa componentes prontos do Ionic para criar uma navegação por abas (tabs).
import {
  IonTabs,       // Container principal das abas
  IonTabBar,     // Barra que contém os botões das abas
  IonTabButton,  // Botão individual de cada aba
  IonIcon,       // Componente para exibir ícones
  IonLabel       // Componente para exibir textos/rótulos
} from '@ionic/angular/standalone';

// Importa a função responsável por registrar ícones no Ionic.
import { addIcons } from 'ionicons';

// Importa os ícones que serão utilizados nas abas.
import {
  homeOutline,       // Ícone de casa (Home)
  peopleOutline,     // Ícone de pessoas/usuários
  medkitOutline,     // Ícone de kit médico/saúde
  megaphoneOutline   // Ícone de megafone/comunicados
} from 'ionicons/icons';

/*
 * Decorator que configura o componente.
 * Define como o Angular deve criar e renderizar este componente.
 */
@Component({
  // Nome da tag HTML usada para renderizar o componente.
  selector: 'app-tabs',

  // Arquivo HTML responsável pela estrutura visual.
  templateUrl: 'tabs.page.html',

  // Arquivo SCSS responsável pelos estilos do componente.
  styleUrls: ['tabs.page.scss'],

  // Indica que este é um Standalone Component,
  // ou seja, não precisa ser declarado em um módulo (NgModule).
  standalone: true,

  // Componentes que poderão ser utilizados no template HTML.
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ]
})

/*
 * Componente responsável pela navegação principal
 * através de abas (tabs) do aplicativo.
 */
export class TabsPage {

  /*
   * O construtor é executado automaticamente
   * quando o componente é criado.
   */
  constructor() {

    /*
     * Registra os ícones para que possam ser utilizados
     * no template HTML através do componente <ion-icon>.
     *
     * Chave   -> nome do ícone
     * Valor   -> objeto SVG do ícone importado
     */
    addIcons({
      homeOutline,
      peopleOutline,
      medkitOutline,
      megaphoneOutline
    });
  }
}