import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GestorService } from '../services/gestor';
import { Observable, catchError, of } from 'rxjs';
import { Gestor } from '../models/gestor';

@Component({
  selector: 'app-gestor-lista',
  imports: [CommonModule, RouterLink],
  templateUrl: './gestor-lista.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './gestor-lista.css',
})
export class GestorLista implements OnInit{
  gestores$: Observable<any[]> | undefined;
  exibindoModalExclusao: boolean = false;
  idGestorExcluir: number | null = null;
  mensagemErro: string = '';

  constructor(private gestorService: GestorService) {}

  ngOnInit(): void {
    this.carregarGestores();
  }

  carregarGestores(): void {
    this.gestores$ = this.gestorService.listarTodos().pipe(
      catchError(err => {
        console.error('Erro ao buscar gestores:', err);
        return of([]);
      })
    );
  }

  isMaster(gestor: any): boolean {
    return gestor.id === 1 || gestor.nome.toLowerCase().includes('sthefany');
  }

  abrirModalExclusao(id: number | undefined): void {
    if (id) {
      this.idGestorExcluir = id;
      this.mensagemErro = '';
      this.exibindoModalExclusao = true;
    }
  }

  fecharModalExclusao(): void {
    this.exibindoModalExclusao = false;
    this.idGestorExcluir = null;
    this.mensagemErro = '';
  }

  confirmarExclusao(): void {
    if (this.idGestorExcluir) {
      this.gestorService.excluir(this.idGestorExcluir).subscribe({
        next: () => {
          this.fecharModalExclusao();
          this.carregarGestores();
        },
        error: (err) => {
          console.error(err);
          this.mensagemErro = 'Não foi possível excluir o gestor. Tente novamente.';
        }
      });
    }
  }
}
