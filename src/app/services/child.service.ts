// Importa recursos do Angular Core.
import { Injectable, inject } from '@angular/core';

/*
  Importa recursos do AngularFire (integração Angular + Firebase).

Conceito	        Para que serve
@Injectable()	    Transforma a classe em um Service Angular
providedIn: 'root'	Cria uma única instância global (Singleton)
inject(Firestore)	Obtém uma instância do Firestore
collection()	    Referência para uma coleção

 */
import {
  Firestore,       // Serviço principal para acessar o banco Firestore
  collection,      // Cria referência para uma coleção
  addDoc,          // Adiciona um novo documento
  collectionData,  // Escuta alterações em tempo real
  doc,             // Cria referência para um documento específico
  updateDoc,       // Atualiza um documento existente
  deleteDoc,       // Remove um documento
  query,           // Cria consultas personalizadas
  where            // Adiciona filtros à consulta
} from '@angular/fire/firestore';

/*
 * Observable é utilizado para trabalhar com dados assíncronos.
 * Muito usado quando os dados podem mudar em tempo real.
 */
import { Observable } from 'rxjs';

/*
 * Interface/modelo que define a estrutura
 * de uma criança no sistema.
 */
import { Child } from '../models/child.model';

/**
 * @Injectable()
 *
 * Transforma a classe em um Service Angular.
 *
 * Isso permite:
 * - Injeção de dependências
 * - Compartilhamento de lógica
 * - Comunicação com APIs
 * - Comunicação com Firebase
 * - Reutilização em vários componentes
 *
 * providedIn: 'root'
 *
 * Cria uma única instância do serviço
 * para toda a aplicação (Singleton).
 */
@Injectable({
  providedIn: 'root'
})
export class ChildService {

  /**
   * inject(Firestore)
   *
   * Injeta o serviço Firestore dentro da classe.
   *
   * Equivalente antigo:
   *
   * constructor(private firestore: Firestore) {}
   *
   * O Angular cria automaticamente a instância.
   */
  private firestore = inject(Firestore);

  /**
   * collection()
   *
   * Cria uma referência para a coleção
   * "children" dentro do Firestore.
   */
  private childrenCollection = collection(
    this.firestore,
    'children'
  );

  
  // CREATE
  

  /**
   * Adiciona uma nova criança na coleção.
   *
   * addDoc():
   * - Cria um documento
   * - Gera um ID automaticamente
   * - Salva os dados enviados
   *
   * Exemplo:
   *
   * {
   *   nome: "Maria",
   *   sexo: "Feminino"
   * }
   */
  addChild(child: Child): Promise<any> {
    return addDoc(
      this.childrenCollection,
      child
    );
  }

  
  // READ (LISTAR TODOS)
  

  /**
   * Retorna todas as crianças.
   *
   * collectionData():
   * - Escuta o Firestore em tempo real
   * - Sempre que houver alteração,
   *   os dados são atualizados automaticamente.
   *
   * idField: 'id'
   *
   * Adiciona o ID do documento
   * dentro do objeto retornado.
   *
   * Sem idField:
   *
   * {
   *   nome: "João"
   * }
   *
   * Com idField:
   *
   * {
   *   id: "abc123",
   *   nome: "João"
   * }
   */
  getChildren(): Observable<Child[]> {
    return collectionData(
      this.childrenCollection,
      {
        idField: 'id'
      }
    ) as Observable<Child[]>;
  }

  
  // READ (FILTRAR POR RESPONSÁVEL)
  

  /**
   * Busca apenas as crianças
   * de um responsável específico.
   *
   * where():
   * Cria uma condição de filtro.
   *
   * Exemplo:
   *
   * SELECT *
   * FROM children
   * WHERE responsavelId = "123"
   */
  getChildrenByResponsavel(
    responsavelId: string
  ): Observable<Child[]> {

    /**
     * query()
     *
     * Monta uma consulta personalizada.
     */
    const q = query(
      this.childrenCollection,

      /**
       * where(campo, operador, valor)
       */
      where(
        'responsavelId',
        '==',
        responsavelId
      )
    );

    return collectionData(
      q,
      { idField: 'id' }
    ) as Observable<Child[]>;
  }

  
  // UPDATE
  

  /**
   * Atualiza parcialmente uma criança.
   *
   * Partial<Child>
   *
   * Permite enviar apenas os campos
   * que serão alterados.
   *
   * Exemplo:
   *
   * updateChild(id, {
   *   nome: 'Pedro'
   * });
   */
  updateChild(
    id: string,
    child: Partial<Child>
  ): Promise<void> {

    /**
     * doc()
     *
     * Cria uma referência para
     * um documento específico.
     *
     * Exemplo:
     * children/abc123
     */
    const childDoc = doc(
      this.firestore,
      `children/${id}`
    );

    /**
     * updateDoc()
     *
     * Atualiza apenas os campos enviados.
     */
    return updateDoc(
      childDoc,
      { ...child }
    );
  }

  
  // DELETE
  

  /**
   * Remove uma criança do banco.
   *
   * Fluxo:
   *
   * Recebe ID
   * ↓
   * Localiza documento
   * ↓
   * Exclui permanentemente
   */
  deleteChild(id: string): Promise<void> {

    /**
     * Referência ao documento.
     */
    const childDoc = doc(
      this.firestore,
      `children/${id}`
    );

    /**
     * deleteDoc()
     *
     * Remove o documento do Firestore.
     */
    return deleteDoc(childDoc);
  }
}