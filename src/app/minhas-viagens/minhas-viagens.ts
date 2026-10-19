import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { ViagemService } from '../services/viagem';

@Component({
  selector: 'app-minhas-viagens',
  imports: [CommonModule, RouterLink],
  templateUrl: './minhas-viagens.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './minhas-viagens.css',
})
export class MinhasViagens implements OnInit{
  viagens$: Observable<any[]> | undefined; 
  nomeMotorista: string = 'Motorista'; 
  idMotorista: number | null = null; 

  constructor(private viagemService: ViagemService) {}

  ngOnInit(): void {
      const usuarioSalvo = localStorage.getItem('usuarioLogado'); 

      if (usuarioSalvo) {
        const usuario = JSON.parse(usuarioSalvo); 
        this.nomeMotorista = usuario.nome || 'Motorista'; 
        this.idMotorista = usuario.id; 

        if (this.idMotorista) {
          this.carregarMinhasViagens(this.idMotorista);
        }
      }
  }

  carregarMinhasViagens(id: number): void {
    this.viagens$ = this.viagemService.listarPorMotorista(id).pipe(
      catchError(err => {
        console.error('Erro ao carregar viagens do motorista:', err);
        return of([]);
      })
    );
  }
}
