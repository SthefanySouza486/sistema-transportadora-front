import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth';
import { PagamentoService } from '../services/pagamento';
import { MotoristaService } from '../services/motorista';
import { Pagamento } from '../models/pagamento';
import { Motorista } from '../models/motorista';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { getApiBaseUrl } from '../config/api';


@Component({
  selector: 'app-pagamento-lista',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pagamento-lista.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pagamento-lista.css',
})
export class PagamentoLista implements OnInit{
  pagamentos$: Observable<Pagamento[]> | undefined;
  pagamentosOriginais = signal<Pagamento[]>([]);
  pagamentosFiltrados = signal<Pagamento[]>([]);
  listaMotoristas = signal<Motorista[]>([]);
  mapaMotoristas: { [id: number]: string } = {};

  filtroMotorista: string = ''; 
  filtroMes: string = ''; 
  filtroStatus: string = ''; 
  filtroData: string = ''; 

  exibindoModalExclusao: boolean = false;
  idPagamentoExcluir: number | null = null;
  mensagemErro: string = '';

  readonly opcoesStatus = [
    { valor: 'PAGO', rotulo: 'Pago', classe: 'bg-green-100 text-green-800', ponto: 'bg-green-500' },
    { valor: 'PENDENTE', rotulo: 'Pendente', classe: 'bg-yellow-100 text-yellow-800', ponto: 'bg-yellow-500' },
    { valor: 'RECUSADO', rotulo: 'Recusado', classe: 'bg-red-100 text-red-800', ponto: 'bg-red-500' },
  ];
  menuStatus = signal<{ pagamento: Pagamento; top: number; left: number } | null>(null);

  constructor(
    private service: PagamentoService,
    public authService: AuthService, 
    private http: HttpClient,
    private motoristaService: MotoristaService
  ) {}

  ngOnInit(): void {
    this.carregarMotoristas();
    this.carregarPagamentos();
  }

  carregarMotoristas(): void {
    this.motoristaService.listarTodos().subscribe({
      next: (motoristas) => {
        this.listaMotoristas.set(motoristas || []);
        const mapa: { [id: number]: string } = {};
        (motoristas || []).forEach(m => {
          if (m.id) {
            mapa[m.id] = m.nome;
          }
        });
        this.mapaMotoristas = mapa;
      },
      error: (err) => console.error('Erro ao buscar motoristas:', err)
    });
  }

  obterNomeMotorista(pagamento: Pagamento): string {
    if (pagamento.nomeMotorista && pagamento.nomeMotorista !== 'Motorista Desconhecido') {
      return pagamento.nomeMotorista;
    }
    if (pagamento.motoristaId && this.mapaMotoristas[pagamento.motoristaId]) {
      return this.mapaMotoristas[pagamento.motoristaId];
    }
    return pagamento.motoristaId ? `Motorista #${pagamento.motoristaId}` : 'Não informado';
  }

  carregarPagamentos(): void {
    const perfil = this.authService.getPerfil();
    const usuario = this.authService.getUsuarioLogado() || {};

    const request$ = perfil === 'MOTORISTA'
      ? this.service.listarPorMotorista(usuario.id)
      : this.service.listarTodos();

    request$.subscribe({
      next: (dados) => {
        this.pagamentosOriginais.set(dados ?? []);
        this.aplicarFiltros();
      }, 
      error: (err) => console.error('Erro ao buscar pagamentos', err)
    });
  }

  aplicarFiltros(): void {
    const filtrados = this.pagamentosOriginais().filter(pag => {
      let matchMotorista = true;
      if (this.filtroMotorista) {
        const termo = this.filtroMotorista.trim().toLowerCase();
        const nomeStr = this.obterNomeMotorista(pag).toLowerCase();
        const idStr = String(pag.motoristaId || '');
        matchMotorista = idStr === termo || nomeStr.includes(termo);
      }
      const matchMes = this.filtroMes ? pag.periodoReferencia === this.filtroMes : true; 
      const matchStatus = this.filtroStatus ? pag.statusPagamento === this.filtroStatus : true; 
      const matchData = this.filtroData ? pag.dataPagamento === this.filtroData : true; 

      return matchMotorista && matchMes && matchStatus && matchData;
    });
    this.pagamentosFiltrados.set(filtrados);
  }

  limparFiltros(): void {
    this.filtroMotorista = ''; 
    this.filtroMes = ''; 
    this.filtroStatus = ''; 
    this.filtroData = ''; 
    this.aplicarFiltros();
  }

  estiloStatus(status: string) {
    return this.opcoesStatus.find(o => o.valor === status) ?? this.opcoesStatus[1];
  }

  abrirMenuStatus(pagamento: Pagamento, event: MouseEvent): void {
    event.stopPropagation();
    if (this.menuStatus()?.pagamento.id === pagamento.id) {
      this.menuStatus.set(null);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const larguraMenu = 160;
    this.menuStatus.set({
      pagamento,
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2 - larguraMenu / 2,
    });
  }

  @HostListener('document:click')
  @HostListener('window:scroll')
  @HostListener('window:resize')
  fecharMenuStatus(): void {
    if (this.menuStatus()) this.menuStatus.set(null);
  }

  alterarStatus(pagamento: Pagamento, novoStatus: string): void {
    this.menuStatus.set(null);
    if (pagamento.statusPagamento === novoStatus) return;

    this.http.patch(`${getApiBaseUrl()}/pagamentos/status/${pagamento.id}`, `"${novoStatus}"`, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => {
        this.pagamentosOriginais.update(lista =>
          lista.map(p => p.id === pagamento.id ? { ...p, statusPagamento: novoStatus } : p)
        );
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao atualizar status.');
      }
    });
  }

  abrirComprovante(dataUrl: string): void {
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
      this.idPagamentoExcluir = id;
      this.mensagemErro = '';
      this.exibindoModalExclusao = true;
    }
  }

  fecharModalExclusao(): void {
    this.exibindoModalExclusao = false;
    this.idPagamentoExcluir = null;
    this.mensagemErro = '';
  }

  confirmarExclusao(): void {
    if (this.idPagamentoExcluir) {
      this.service.excluir(this.idPagamentoExcluir).subscribe({
        next: () => {
          this.fecharModalExclusao();
          this.carregarPagamentos();
        },
        error: (err: any) => {
          console.error(err);
          this.mensagemErro = 'Erro ao excluir pagamento.';
        }
      });
    }
  }
}
