import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotoristaService } from '../services/motorista';
import { Motorista } from '../models/motorista';
import { RouterLink } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-motorista-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './motorista-lista.html'
})
export class MotoristaListaComponent implements OnInit {
  motoristas$: Observable<Motorista[]> | undefined; 
  exibindoModalExclusao: boolean = false; 
  idMotoristaExcluir: number | null = null; 
  mensagemErro: string = ''; 

  
  constructor(private service: MotoristaService) {}


  ngOnInit(): void {
    this.carregarMotoristas();
  }

  carregarMotoristas(): void {
    this.motoristas$ = this.service.listarTodos().pipe(
      catchError(err => {
        console.error('Erro ao buscar motoristas:', err);
        return of([]);
      })
    );
  }
  
  abrirModalExclusao(id: number | undefined): void {
    if (id) {
      this.idMotoristaExcluir = id; 
      this.mensagemErro = ''; 
      this.exibindoModalExclusao = true;
    }
  }

  fecharModalExclusao(): void {
    this.exibindoModalExclusao = false; 
    this.idMotoristaExcluir = null; 
    this.mensagemErro = ''; 
  }

  confirmarExclusao(): void {
    if(this.idMotoristaExcluir) {
      this.service.excluir(this.idMotoristaExcluir).subscribe({
        next: () => {
          this.fecharModalExclusao(); 
          this.carregarMotoristas();
        },
        error: (err) => {
          console.error(err); 
          this.mensagemErro = 'Erro ao excluir. Verifique se ele não está vinculado a uma viagem.';
        }
      });
    }
  }
}