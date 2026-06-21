import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { VaccinationRecord } from '../models/vaccination-record.model';
import { RECORDS_MOCK } from '../data/records.mock';

@Injectable({ providedIn: 'root' })
export class VaccinationRecordService {
  private firestore = inject(Firestore);

  //  Estado local reativo
  //
  // BehaviorSubject inicializado com o mock.
  // Quando addRecord() é chamado, o Subject emite a lista atualizada,
  // e todos os subscribers (carteirinha, resumo) reagem automaticamente.
  //
  // Quando o Firestore estiver pronto, trocar por collectionData()

  private _registros = new BehaviorSubject<VaccinationRecord[]>([
    ...RECORDS_MOCK,
  ]);

  //  CREATE

  async addRecord(record: VaccinationRecord): Promise<void> {
    // ADICIONAR → gera ID local temporário
    const novoRegistro: VaccinationRecord = {
      ...record,
      id: `r-local-${Date.now()}`,
    };

    // SUBSTITUIR → emite lista atualizada para todos os subscribers
    this._registros.next([...this._registros.getValue(), novoRegistro]);

    console.log(
      '[VaccinationRecordService] Registro adicionado:',
      novoRegistro,
    );
    console.log(
      '[VaccinationRecordService] Total do filho:',
      this._registros.getValue().filter((r) => r.childId === record.childId)
        .length,
    );

    // Firestore (quando pronto):
    // await addDoc(collection(this.firestore, 'records'), record);
  }

  //  READ (por criança)

  getRecordsByChild(childId: string): Observable<VaccinationRecord[]> {
    return this._registros.pipe(
      map((lista) => lista.filter((r) => r.childId === childId)),
    );

    // Firestore (quando pronto):
    // return collectionData(
    //   query(collection(this.firestore, 'records'), where('childId', '==', childId)),
    //   { idField: 'id' }
    // ) as Observable<VaccinationRecord[]>;
  }
}
