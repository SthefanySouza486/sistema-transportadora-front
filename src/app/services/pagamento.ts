import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pagamento } from '../models/pagamento';
import { getApiBaseUrl } from '../config/api';

@Injectable({ providedIn: 'root'})
export class PagamentoService {
    private apiUrl = `${getApiBaseUrl()}/pagamentos`;

  constructor(private http: HttpClient) {}

  registrarPagamento(pagamento: any): Observable<any> {
    return this.http.post(this.apiUrl, pagamento);
  }

  atualizar(id: number, pagamento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, pagamento);
  }

  listarPorMotorista(motoristaId: number): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}/motorista/${motoristaId}`);
  }

  listarTodos(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  excluir(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}
}
