// ─────────────────────────────────────────────────────────────────────────────
// Importações do núcleo do Angular
// ─────────────────────────────────────────────────────────────────────────────

// Component : decorator que transforma a classe em componente Angular
// Input     : decorator que expõe propriedades para o componente pai passar dados
// OnInit    : interface que obriga a implementar ngOnInit() (executado após criação)
// inject    : função utilitária para injetar serviços sem parâmetro no construtor
import { Component, Input, OnInit, inject } from '@angular/core';

// FormsModule: habilita two-way binding com [(ngModel)] e diretivas de template-driven forms
import { FormsModule } from '@angular/forms';

// ─────────────────────────────────────────────────────────────────────────────
// Componentes Ionic usados no template (modo standalone — importação individual)
// ─────────────────────────────────────────────────────────────────────────────
import {
  IonHeader, // barra de cabeçalho do modal
  IonToolbar, // faixa interna do header (contém título e botões)
  IonTitle, // texto do título dentro da toolbar
  IonContent, // área de conteúdo rolável do modal
  IonButtons, // container de agrupamento de botões na toolbar
  IonButton, // botão estilizado do Ionic
  IonItem, // linha de formulário (wrapper de input, select etc.)
  IonInput, // campo de texto controlado pelo Ionic
  IonSelect, // dropdown de seleção estilizado
  IonSelectOption, // cada opção dentro do IonSelect
  IonLabel, // rótulo/label associado a um IonItem
  IonNote, // texto auxiliar pequeno — usado para mensagens de erro/validação
  ModalController, // serviço do Ionic para controlar abertura e fechamento de modais
} from '@ionic/angular/standalone';

// Modelo Child: interface que define os campos de uma criança (nome, dataNascimento, sexo, etc.)
import { Child } from '../../models/child.model';

// ─────────────────────────────────────────────────────────────────────────────
// Decorator @Component — metadados do componente
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-child-form', // tag usada para instanciar o componente
  templateUrl: 'child-form.component.html', // template HTML associado
  styleUrls: ['child-form.component.scss'], // estilos SCSS associados
  standalone: true, // não precisa de NgModule
  imports: [
    // Tudo que for usado no template precisa ser declarado aqui no standalone
    FormsModule, // necessário para [(ngModel)] nos campos do formulário
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonLabel,
    IonNote, // IonNote é essencial para exibir os erros de validação
  ],
})
export class ChildFormComponent implements OnInit {
  // ─────────────────────────────────────────────────────────────────────────
  // @Input — propriedades recebidas do componente pai ao abrir o modal
  // ─────────────────────────────────────────────────────────────────────────

  // Determina o comportamento do formulário:
  // 'add' → campos em branco, cria um novo registro
  // 'edit' → campos pré-preenchidos com dados da criança recebida
  @Input() mode: 'add' | 'edit' = 'add'; // valor padrão: 'add'

  // Recebe o objeto Child quando mode = 'edit' para pré-popular o formulário
  // O '?' indica que é opcional (undefined quando mode = 'add')
  @Input() child?: Child;

  // ─────────────────────────────────────────────────────────────────────────
  // Estado interno do componente
  // ─────────────────────────────────────────────────────────────────────────

  // Flag que vira true ao clicar em "Salvar"
  // Enquanto false, os erros de validação ficam ocultos para não irritar o usuário
  // logo que abre o modal; após submitted = true, os IonNote de erro aparecem
  submitted = false;

  // Objeto que reflete em tempo real os valores digitados nos campos via [(ngModel)]
  // Inicializado com valores padrão para o modo 'add'
  form: Child = {
    nome: '', // campo de texto — começa vazio
    dataNascimento: '', // campo de data — começa vazio
    sexo: 'M', // radio/select — padrão Masculino
    responsavelId: 'user-001', // ID do responsável; valor fixo temporário até o Auth ser implementado
  };

  // Limite superior para o campo de data de nascimento no template (atributo [max])
  // Converte Date para string 'YYYY-MM-DD' que o <ion-input type="date"> entende
  // Impede que o usuário selecione uma data futura
  maxDate = new Date().toISOString().split('T')[0];

  // Injeta o ModalController para poder fechar o modal com .dismiss()
  private modalController = inject(ModalController);

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle hook — executado uma vez após Angular inicializar as @Inputs
  // ─────────────────────────────────────────────────────────────────────────
  ngOnInit() {
    // Modo edição: copia os dados da criança recebida para o objeto form
    // O spread { ...this.child } cria uma cópia rasa, evitando mutação direta do @Input
    if (this.mode === 'edit' && this.child) {
      this.form = { ...this.child };
    }
    // Modo add: nenhuma ação necessária — form já foi inicializado com valores padrão acima
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters computados — recalculados automaticamente pelo Angular quando
  // o template referencia essas propriedades (sem necessidade de chamada manual)
  // ─────────────────────────────────────────────────────────────────────────

  // Retorna o título exibido na toolbar do modal conforme o modo atual
  get titulo(): string {
    return this.mode === 'add' ? 'Nova Criança' : 'Editar Criança';
  }

  // Valida o nome: remove espaços das bordas e exige ao menos 2 caracteres
  // Evita nomes como " " (só espaço) ou "A" (muito curto)
  get nomeValido(): boolean {
    return this.form.nome.trim().length >= 2;
  }

  // Valida a data de nascimento em dois passos:
  // 1. O campo não pode estar vazio (guard clause retorna false imediatamente)
  // 2. A data informada não pode ser posterior a hoje (sem nascimentos futuros)
  get dataNascimentoValida(): boolean {
    if (!this.form.dataNascimento) return false; // campo vazio → inválido
    const data = new Date(this.form.dataNascimento); // converte string para Date
    return data <= new Date(); // aceita apenas datas passadas ou hoje
  }

  // Valida o sexo: apenas os valores literais 'M' ou 'F' são aceitos
  // Protege contra estados intermediários (string vazia, undefined etc.)
  get sexoValido(): boolean {
    return this.form.sexo === 'M' || this.form.sexo === 'F';
  }

  // Agregador de validação: o formulário inteiro só é válido se TODOS os campos passarem
  // Usado no template para desabilitar o botão "Salvar" e para bloquear o envio no método salvar()
  get formValido(): boolean {
    return this.nomeValido && this.dataNascimentoValida && this.sexoValido;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Ações do formulário
  // ─────────────────────────────────────────────────────────────────────────

  // Chamado pelo botão "Salvar" no template
  async salvar() {
    this.submitted = true; // ativa a exibição de todos os erros de validação no template

    // Guarda de saída: se o formulário ainda tem campos inválidos, aborta aqui
    // O usuário verá os IonNote de erro graças ao submitted = true acima
    if (!this.formValido) return;

    // Fecha o modal e envia o objeto form de volta para o componente pai (ChildrenListPage)
    // O pai recebe os dados no evento (data) do ModalController.onDidDismiss()
    await this.modalController.dismiss({ child: this.form });
  }

  // Chamado pelo botão "Cancelar" no template
  // Fecha o modal sem enviar dados — o pai recebe null e não executa nenhuma ação
  async cancelar() {
    await this.modalController.dismiss(null);
  }
}
