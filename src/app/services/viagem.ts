import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viagem } from '../models/viagem';
import { getApiBaseUrl } from '../config/api';

@Injectable({ providedIn: 'root'})
export class ViagemService {
    private apiUrl = `${getApiBaseUrl()}/viagens`;
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

  listarPorMotorista(motoristaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/motorista/${motoristaId}`);
  }

  atualizar(id: number, viagem: Viagem): Observable<Viagem> {
    return this.http.put<Viagem>(`${this.apiUrl}/${id}`, viagem);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  atualizarStatus(id: number, statusViagem: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { statusViagem });
  }
}
