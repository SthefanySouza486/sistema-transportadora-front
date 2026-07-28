import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Veiculo } from '../models/veiculo';
import { VeiculoService } from '../services/veiculo';

import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-veiculo-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './veiculo-lista.html',
  styleUrl: './veiculo-lista.css',
})
export class VeiculoLista implements OnInit{
  veiculos$: Observable<Veiculo[]> | undefined; 

  constructor(private service: VeiculoService) { }

  ngOnInit(): void {
      this.carregarVeiculos();
  }

  carregarVeiculos(): void {
      this.veiculos$ = this.service.listarTodos().pipe(
        catchError(err => {
          console.error('Erro ao buscar veículos:', err);
          return of([]);
        })
      );
  }

  excluir(id: number | undefined): void {
      if (id && confirm('Tem certeza que deseja excluir este veículo?')) {
          this.service.excluir(id).subscribe({
              next: () => {
                  alert('Veículo excluído com sucesso!');
                  this.carregarVeiculos();
              },
              error: (err) => {
                  console.error(err);
                  alert('Erro ao excluir veículo.');
              }
          });
      }
  }
}
