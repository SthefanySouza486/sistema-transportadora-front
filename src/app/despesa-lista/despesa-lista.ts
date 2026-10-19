import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Despesa } from '../models/despesa';
import { Viagem } from '../models/viagem';
import { DespesaService } from '../services/despesa';
import { ViagemService } from '../services/viagem';
import { MotoristaService } from '../services/motorista';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-despesa-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './despesa-lista.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './despesa-lista.css',
})
export class DespesaLista implements OnInit{
  despesas = signal<Despesa[]>([]); 
  carregando = signal<boolean>(true);
  exibindoModalExclusao: boolean = false; 
  idDespesaExcluir: number | null = null; 
  mensagemErro: string = ''; 
  rotasMap: { [key: number]: string } = {}; 
  viagensMap: { [key: number]: Viagem } = {};
  mapaMotoristas: { [id: number]: string } = {};

  constructor(private service: DespesaService, 
              private viagemService: ViagemService,
              private motoristaService: MotoristaService,
              public authService: AuthService) { }

  ngOnInit(): void {
      this.carregarDespesas();
  }

  obterNomeRota(viagemId: number): string {
    return this.rotasMap[viagemId] || `Viagem #${viagemId}`;
  }

  obterNomeMotorista(despesa: Despesa): string {
    if (despesa.nomeMotorista && despesa.nomeMotorista !== 'Motorista Desconhecido' && despesa.nomeMotorista !== 'Não informado') {
      return despesa.nomeMotorista;
    }
    const viagem = this.viagensMap[despesa.viagemId];
    if (viagem) {
      if (viagem.nomeMotorista && viagem.nomeMotorista !== 'Motorista Desconhecido') {
        return viagem.nomeMotorista;
      }
      if (viagem.motoristaId && this.mapaMotoristas[viagem.motoristaId]) {
        return this.mapaMotoristas[viagem.motoristaId];
      }
      if (viagem.motoristaId) {
        return `Motorista #${viagem.motoristaId}`;
      }
    }
    if (despesa.motoristaId && this.mapaMotoristas[despesa.motoristaId]) {
      return this.mapaMotoristas[despesa.motoristaId];
    }
    return 'Não informado';
  }

  carregarDespesas(): void {
    this.carregando.set(true);
    const perfil = this.authService.getPerfil();
    const usuario = this.authService.getUsuarioLogado() || {};
    const motoristaId = usuario.id || this.authService.getUsuarioId();

    const requestDespesas$ = (perfil === 'MOTORISTA' && motoristaId)
      ? this.service.listarPorMotorista(Number(motoristaId))
      : this.service.listarTodos();

    forkJoin({
      viagens: this.viagemService.listarTodos().pipe(catchError(() => of([]))),
      motoristas: this.motoristaService.listarTodos().pipe(catchError(() => of([]))),
      despesas: requestDespesas$.pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ viagens, motoristas, despesas }) => {
        const mapaMot: { [id: number]: string } = {};
        (motoristas || []).forEach(m => {
          if (m.id) mapaMot[m.id] = m.nome;
        });
        this.mapaMotoristas = mapaMot;

        const mapaViagens: { [id: number]: Viagem } = {};
        const mapaRotas: { [id: number]: string } = {};
        (viagens || []).forEach(v => {
          if (v.id) {
            mapaViagens[v.id] = v;
            mapaRotas[v.id] = `${v.origem} -> ${v.destino}`;
          }
        });
        this.viagensMap = mapaViagens;
        this.rotasMap = mapaRotas;

        this.despesas.set(despesas || []);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar dados das despesas:', err);
        this.despesas.set([]);
        this.carregando.set(false);
      }
    });
  }

  abrirComprovante(dataUrl: string | undefined): void {
    if (!dataUrl) return;
    if (!dataUrl.startsWith('data:')) {
      window.open(dataUrl, '_blank');
      return;
    }
    const [cabecalho, base64] = dataUrl.split(',');
    const tipo = cabecalho.match(/data:(.*?);/)?.[1] ?? 'application/octet-stream';
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: tipo }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  abrirModalExclusao(id: number | undefined): void {
    if (id) {
      this.idDespesaExcluir = id;
      this.mensagemErro = '';
      this.exibindoModalExclusao = true;
    }
  }

  fecharModalExclusao(): void {
    this.exibindoModalExclusao = false;
    this.idDespesaExcluir = null;
    this.mensagemErro = '';
  }


  confirmarExclusao(): void {
    if (this.idDespesaExcluir) {
      this.service.excluir(this.idDespesaExcluir).subscribe({
        next: () => {
          this.fecharModalExclusao();
          this.carregarDespesas();
        },
        error: (err) => {
          console.error(err);
          this.mensagemErro = 'Erro ao excluir despesa.';
        }
      });
    }
  }
}
