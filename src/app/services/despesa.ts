import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Despesa } from '../models/despesa';
import { getApiBaseUrl } from '../config/api';

@Injectable({ providedIn: 'root'})
export class DespesaService {
    private apiUrl = `${getApiBaseUrl()}/despesas`; 

    constructor(private http: HttpClient) { }

    listarTodos(): Observable<Despesa[]> {
        return this.http.get<Despesa[]>(this.apiUrl);
    }

    cadastrar(despesa: Despesa): Observable<Despesa> {
        return this.http.post<Despesa>(this.apiUrl, despesa);
    }

    buscarPorId(id: number): Observable<Despesa> {
        return this.http.get<Despesa>(`${this.apiUrl}/${id}`);
    }

    listarPorMotorista(motoristaId: number): Observable<Despesa[]> {
        return this.http.get<Despesa[]>(`${this.apiUrl}/motorista/${motoristaId}`);
    }

    atualizar(id: number, despesa: Despesa): Observable<Despesa> {
        return this.http.put<Despesa>(`${this.apiUrl}/${id}`, despesa);
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
