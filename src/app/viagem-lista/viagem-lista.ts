import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Viagem } from '../models/viagem';
import { ViagemService } from '../services/viagem';

import { Observable, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-viagem-lista',
  standalone: true,
  imports: [ CommonModule, RouterLink],
  templateUrl: './viagem-lista.html',
  styleUrl: './viagem-lista.css',
})
export class ViagemLista implements OnInit {
  viagens$: Observable<Viagem[]> | undefined; 

  constructor(private service: ViagemService, 
              public authService: AuthService) { }

  ngOnInit(): void {
      this.carregarViagens();
  }

  carregarViagens(): void {
      this.viagens$ = this.service.listarTodos().pipe(
        catchError(err => {
          console.error('Erro ao buscar viagens:', err);
          return of([]);
        })
      );
  }

  excluir(id: number | undefined): void {
      if (id && confirm('Tem certeza que deseja excluir esta viagem?')) {
          this.service.excluir(id).subscribe({
              next: () => {
                  alert('Viagem excluída com sucesso!');
                  this.carregarViagens();
              },
              error: (err) => {
                  console.error(err);
                  if (err.error && err.error.message) {
                      alert('Erro ao excluir: ' + err.error.message);
                  } else {
                      alert('Erro ao excluir viagem. Talvez ela já esteja concluída.');
                  }
              }
          });
      }
  }
}
