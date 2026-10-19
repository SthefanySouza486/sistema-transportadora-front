import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { getApiBaseUrl } from '../config/api';

@Injectable({ providedIn: 'root'})
export class AuthService {
    private apiUrl = `${getApiBaseUrl()}/auth`; 

    constructor(private http: HttpClient) { }

  fazerLogin(credenciais: any, lembrar: boolean = false): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciais).pipe(
      tap((resposta: any) => {
        const storage = lembrar ? localStorage : sessionStorage;
        const storageOposto = lembrar ? sessionStorage : localStorage;
        storageOposto.removeItem('token');
        storageOposto.removeItem('perfil');
        storageOposto.removeItem('usuarioId');
        storageOposto.removeItem('nome');
        storageOposto.removeItem('usuarioLogado');

        storage.setItem('token', resposta.token);
        storage.setItem('perfil', resposta.perfil);
        storage.setItem('usuarioId', String(resposta.id));
        storage.setItem('nome', resposta.nome);
        storage.setItem('usuarioLogado', JSON.stringify(resposta));
      })
    );
  }

  sair(): void {
    const usuarioSalvo = localStorage.getItem('usuario_salvo');
    localStorage.clear();
    sessionStorage.clear();
    if (usuarioSalvo) {
      localStorage.setItem('usuario_salvo', usuarioSalvo);
    }
  }

  isLogado(): boolean {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  getPerfil(): string | null {
    return localStorage.getItem('perfil') || sessionStorage.getItem('perfil');
  }

  getUsuarioId(): string | null {
    return localStorage.getItem('usuarioId') || sessionStorage.getItem('usuarioId');
  }

  getUsuarioLogado(): any {
    const dados = localStorage.getItem('usuarioLogado') || sessionStorage.getItem('usuarioLogado');
    try {
      return dados ? JSON.parse(dados) : null;
    } catch {
      return null;
    }
  }
}
