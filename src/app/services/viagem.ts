import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viagem } from '../models/viagem';

@Injectable({ providedIn: 'root'})
export class ViagemService {
    private apiUrl = 'http://localhost:8080/api/viagens';
  constructor(private http: HttpClient) { }

  cadastrar(viagem: Viagem): Observable<Viagem> {
    return this.http.post<Viagem>(this.apiUrl, viagem);
  }

  listarTodos() : Observable<Viagem[]> {
    return this.http.get<Viagem[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Viagem> {
    return this.http.get<Viagem>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, viagem: Viagem): Observable<Viagem> {
    return this.http.put<Viagem>(`${this.apiUrl}/${id}`, viagem);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
