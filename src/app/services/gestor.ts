import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Gestor } from '../models/gestor';
import { getApiBaseUrl } from '../config/api';

@Injectable({ providedIn: 'root'})
export class GestorService {
    private apiUrl = `${getApiBaseUrl()}/gestores`;

  constructor(private http: HttpClient) { }

  cadastrar(gestor: any): Observable<any> {
    return this.http.post(this.apiUrl, gestor);
  }

  listarTodos(): Observable<Gestor[]> {
    return this.http.get<Gestor[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Gestor> {
    return this.http.get<Gestor>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, gestor: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, gestor);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
