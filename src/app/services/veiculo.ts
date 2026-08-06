import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Veiculo } from '../models/veiculo';

@Injectable({ providedIn: 'root'})
export class VeiculoService {
    private apiUrl = 'http://localhost:8080/api/veiculos'; 
    constructor(private http: HttpClient) { }

    listarTodos(): Observable<Veiculo[]> {
        return this.http.get<Veiculo[]>(this.apiUrl);
    }

    cadastrar(veiculo: Veiculo): Observable<Veiculo> {
        return this.http.post<Veiculo>(this.apiUrl, veiculo); 
    }

    buscarPorId(id: number): Observable<Veiculo> {
        return this.http.get<Veiculo>(`${this.apiUrl}/${id}`);
    }

    atualizar(id: number, veiculo: Veiculo): Observable<Veiculo> {
        return this.http.put<Veiculo>(`${this.apiUrl}/${id}`, veiculo);
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
