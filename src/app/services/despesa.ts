import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Despesa } from '../models/despesa';

@Injectable({ providedIn: 'root'})
export class DespesaService {
    private apiUrl = 'http://localhost:8080/api/despesas'; 

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

    atualizar(id: number, despesa: Despesa): Observable<Despesa> {
        return this.http.put<Despesa>(`${this.apiUrl}/${id}`, despesa);
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
