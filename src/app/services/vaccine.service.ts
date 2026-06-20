import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

import { Vaccine } from '../models/vaccine.model';
import { VACCINES_MOCK } from '../data/vaccines.mock';

@Injectable({ providedIn: 'root' })
export class VaccineService {
  private firestore = inject(Firestore);

  //  READ (catálogo completo)

  /**
   * Retorna todas as vacinas do catálogo.
   *
   * Por enquanto usa mock para desenvolvimento e testes visuais.
   * Quando o Firestore estiver pronto, trocar por:
   *
   * getVaccines(): Observable<Vaccine[]> {
   *   return collectionData(
   *     collection(this.firestore, 'vaccines'),
   *     { idField: 'id' }
   *   ) as Observable<Vaccine[]>;
   * }
   */
  getVaccines(): Vaccine[] {
    console.log('Catálogo completo:', VACCINES_MOCK);
    return VACCINES_MOCK;
  }

  //  READ (vacina por ID)

  /**
   * Retorna uma vacina específica pelo ID.
   *
   * Quando o Firestore estiver pronto, trocar por:
   *
   * getVaccineById(id: string): Observable<Vaccine | undefined> {
   *   return docData(
   *     doc(this.firestore, `vaccines/${id}`),
   *     { idField: 'id' }
   *   ) as Observable<Vaccine>;
   * }
   */
  getVaccineById(id: string): Vaccine | undefined {
    return VACCINES_MOCK.find((v) => v.id === id);
  }
}
