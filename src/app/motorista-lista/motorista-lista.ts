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

  excluir(id: number | undefined): void {
    if (id && confirm('Tem certeza que deseja excluir este motorista?')) {
      this.service.excluir(id).subscribe({
        next: () => {
          this.carregarMotoristas();
        },
        error: (err) => alert('Erro ao excluir. Verifique se ele não está vinculado a uma viagem.')
      });
    }
  }
}