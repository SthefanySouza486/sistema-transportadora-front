import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Despesa } from '../models/despesa';
import { DespesaService } from '../services/despesa';

import { Observable, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-despesa-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './despesa-lista.html',
  styleUrl: './despesa-lista.css',
})
export class DespesaLista implements OnInit{
  despesas$: Observable<Despesa[]> | undefined; 

  constructor(private service: DespesaService, 
              public authService: AuthService) { }

  ngOnInit(): void {
      this.carregarDespesas();
  }

  carregarDespesas(): void {
      this.despesas$ = this.service.listarTodos().pipe(
        catchError(err => {
          console.error('Erro ao buscar despesas:', err);
          return of([]);
        })
      );
  }

  excluir(id: number | undefined): void {
      if (id && confirm('Tem certeza que deseja excluir esta despesa?')) {
          this.service.excluir(id).subscribe({
              next: () => {
                  alert('Despesa excluída com sucesso!');
                  this.carregarDespesas();
              },
              error: (err) => {
                  console.error(err);
                  alert('Erro ao excluir despesa.');
              }
          });
      }
  }
}
