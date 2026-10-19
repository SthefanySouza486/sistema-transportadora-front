import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Veiculo } from '../models/veiculo';
import { VeiculoService } from '../services/veiculo';

import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-veiculo-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './veiculo-lista.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './veiculo-lista.css',
})
export class VeiculoLista implements OnInit{
  veiculos$: Observable<Veiculo[]> | undefined; 
  exibindoModalExclusao: boolean = false; 
  idVeiculoExcluir: number | null = null; 
  mensagemErro: string = ''; 

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

  abrirModalExclusao(id: number | undefined): void {
    if (id) {
      this.idVeiculoExcluir = id; 
      this.mensagemErro = ''; 
      this.exibindoModalExclusao = true; 
    }
  }

  fecharModalExclusao(): void { 
    this.exibindoModalExclusao = false; 
    this.idVeiculoExcluir = null; 
    this.mensagemErro = ''; 
  }

  confirmarExclusao() : void {
    if (this.idVeiculoExcluir) {
      this.service.excluir(this.idVeiculoExcluir).subscribe({
        next: () => {
          this.fecharModalExclusao(); 
          this.carregarVeiculos();
        }, 
        error: (err) => {
          console.error(err); 
          this.mensagemErro = "Não foi possível excluir o veículo. Verifique se ele não possui viagens vinculadas.";
        }
      });
    }
  }
}
