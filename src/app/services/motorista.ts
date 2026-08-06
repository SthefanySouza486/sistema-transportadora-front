import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Motorista } from '../models/motorista'; 

@Injectable({
  providedIn: 'root'
})
export class MotoristaService {
  private apiUrl = 'http://localhost:8080/api/motoristas';

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Motorista[]> {
    return this.http.get<Motorista[]>(this.apiUrl);
  }

  cadastrar(motorista: Motorista): Observable<Motorista> {
    return this.http.post<Motorista>(this.apiUrl, motorista);
  }

  buscarPorId(id: number): Observable<Motorista> {
    return this.http.get<Motorista>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, motorista: Motorista): Observable<Motorista> {
    return this.http.put<Motorista>(`${this.apiUrl}/${id}`, motorista);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
