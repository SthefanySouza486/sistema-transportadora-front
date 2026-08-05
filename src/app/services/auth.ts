import { HttpClient } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class AuthService {
    private apiUrl = 'https://sistema-transportadora-1k5f.onrender.com/api/auth'; 

    constructor(private http: HttpClient) { }

  fazerLogin(credenciais: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciais).pipe(
      tap((resposta: any) => {
        localStorage.setItem('token', resposta.token);
        localStorage.setItem('perfil', resposta.perfil);
        localStorage.setItem('usuarioId', resposta.usuarioId);
        localStorage.setItem('nome', resposta.nome);
      })
    );
  }

  sair(): void {
    localStorage.clear();
  }

  isLogado(): boolean {
    return !!localStorage.getItem('token');
  }

  getPerfil(): string | null {
    return localStorage.getItem('perfil');
  }

  getUsuarioId(): string | null {
    return localStorage.getItem('usuarioId');
  }
}
