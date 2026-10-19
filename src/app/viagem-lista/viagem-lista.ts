import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Viagem } from '../models/viagem';
import { ViagemService } from '../services/viagem';
import { AuthService } from '../services/auth';
import { MotoristaService } from '../services/motorista';
import { Motorista } from '../models/motorista';
import { IbgeService } from '../services/ibge';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-viagem-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './viagem-lista.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './viagem-lista.css',
})
export class ViagemLista implements OnInit {
  viagens = signal<Viagem[]>([]);
  viagensFiltradas = signal<Viagem[]>([]);
  carregando = signal<boolean>(true);
  exibindoModalExclusao: boolean = false; 
  idViagemExcluir: number | null = null; 
  mensagemErro: string = ''; 
  mensagemAlertaModal: string = '';  

  listaMotoristas = signal<Motorista[]>([]);
  listaCidades = signal<string[]>([]);
  mapaMotoristas: { [id: number]: string } = {};

  filtroMotorista: string = '';
  filtroStatus: string = '';
  filtroDataInicio: string = '';
  filtroDataFim: string = '';
  filtroOrigemDestino: string = '';

  readonly opcoesStatus = [
    { valor: 'EM_ANDAMENTO', rotulo: 'Em Andamento', classe: 'bg-yellow-100 text-yellow-800', ponto: 'bg-yellow-500' },
    { valor: 'FINALIZADA', rotulo: 'Finalizada', classe: 'bg-green-100 text-green-800', ponto: 'bg-green-500' },
    { valor: 'CANCELADA', rotulo: 'Cancelada', classe: 'bg-red-100 text-red-800', ponto: 'bg-red-500' },
  ];
  menuStatus = signal<{ viagem: Viagem; top: number; left: number } | null>(null);

  constructor(
    private service: ViagemService, 
    private motoristaService: MotoristaService,
    private ibgeService: IbgeService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarMotoristas();
    this.carregarCidades();
    this.carregarViagens();
  }

  carregarCidades(): void {
    this.ibgeService.listarMunicipios().subscribe({
      next: (cidades) => this.listaCidades.set(cidades),
      error: (err) => console.error('Erro ao carregar cidades do IBGE:', err)
    });
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
      error: (err) => console.error('Erro ao carregar motoristas:', err)
    });
  }

  obterNomeMotorista(viagem: Viagem): string {
    if (viagem.nomeMotorista && viagem.nomeMotorista !== 'Motorista Desconhecido') {
      return viagem.nomeMotorista;
    }
    if (viagem.motoristaId && this.mapaMotoristas[viagem.motoristaId]) {
      return this.mapaMotoristas[viagem.motoristaId];
    }
    return viagem.motoristaId ? `Motorista #${viagem.motoristaId}` : 'Não informado';
  }

  carregarViagens(): void {
    this.carregando.set(true);
    const perfil = this.authService.getPerfil();
    const usuario = this.authService.getUsuarioLogado() || {};
    const motoristaId = usuario.id || this.authService.getUsuarioId();

    const request$ = (perfil === 'MOTORISTA' && motoristaId)
      ? this.service.listarPorMotorista(Number(motoristaId))
      : this.service.listarTodos();

    request$.subscribe({
      next: (dados) => {
        this.viagens.set(dados || []);
        this.aplicarFiltros();
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar viagens:', err);
        this.viagens.set([]);
        this.viagensFiltradas.set([]);
        this.carregando.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    const lista = this.viagens();
    const termoMotorista = (this.filtroMotorista || '').toLowerCase().trim();
    const status = this.filtroStatus;
    const dtInicio = this.filtroDataInicio;
    const dtFim = this.filtroDataFim;
    const rota = (this.filtroOrigemDestino || '').toLowerCase().trim();

    const filtradas = lista.filter(v => {
      if (termoMotorista) {
        const nomeMot = this.obterNomeMotorista(v).toLowerCase();
        const idMotStr = String(v.motoristaId || '');
        if (!nomeMot.includes(termoMotorista) && idMotStr !== termoMotorista) {
          return false;
        }
      }

      if (status && v.statusViagem !== status) {
        return false;
      }

      if (dtInicio && v.dataViagem && v.dataViagem < dtInicio) {
        return false;
      }

      if (dtFim && v.dataViagem && v.dataViagem > dtFim) {
        return false;
      }

      if (rota) {
        const origem = (v.origem || '').toLowerCase();
        const destino = (v.destino || '').toLowerCase();
        if (!origem.includes(rota) && !destino.includes(rota)) {
          return false;
        }
      }

      return true;
    });

    this.viagensFiltradas.set(filtradas);
  }

  limparFiltros(): void {
    this.filtroMotorista = '';
    this.filtroStatus = '';
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
    this.filtroOrigemDestino = '';
    this.aplicarFiltros();
  }

  obterValorTonelada(viagem: Viagem): number {
    if (viagem.valorTonelada != null && Number(viagem.valorTonelada) > 0) {
      return Number(viagem.valorTonelada);
    }
    if (viagem.valorFrete && viagem.pesoTonelada && Number(viagem.pesoTonelada) > 0) {
      return Number(viagem.valorFrete) / Number(viagem.pesoTonelada);
    }
    return 0;
  }

  obterValorTotalFrete(viagem: Viagem): number {
    if (viagem.valorFrete != null && Number(viagem.valorFrete) > 0) {
      return Number(viagem.valorFrete);
    }
    if (viagem.pesoTonelada && viagem.valorTonelada) {
      return Number(viagem.pesoTonelada) * Number(viagem.valorTonelada);
    }
    return 0;
  }

  calcularTotalFrete(): number {
    return this.viagensFiltradas().reduce((acc, v) => acc + this.obterValorTotalFrete(v), 0);
  }

  calcularTotalComissao(): number {
    return this.viagensFiltradas().reduce((acc, v) => acc + (Number(v.valorComissao) || 0), 0);
  }

  calcularTotalPeso(): number {
    return this.viagensFiltradas().reduce((acc, v) => acc + (Number(v.pesoTonelada) || 0), 0);
  }

  formatarData(dataStr: string | undefined): string {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
  }

  gerarRelatorioPDF(): void {
    const dados = this.viagensFiltradas();
    if (!dados || dados.length === 0) {
      alert('Não há viagens para gerar o relatório com os filtros atuais.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(31, 41, 55);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setFillColor(234, 179, 8);
    doc.rect(0, 28, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SILVA & SOUZA TRANSPORTES', 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(209, 213, 219);
    doc.text('Relatório Gerencial de Viagens e Fretes', 14, 19);

    const dataHoraAtual = new Date().toLocaleString('pt-BR');
    doc.setFontSize(8);
    doc.setTextColor(229, 231, 235);
    doc.text(`Emitido em: ${dataHoraAtual}`, pageWidth - 14, 12, { align: 'right' });
    const usuarioLogado = this.authService.getUsuarioLogado();
    const nomeUsuario = usuarioLogado?.nome || (this.authService.getPerfil() === 'GESTOR' ? 'Gestor' : 'Motorista');
    doc.text(`Gerado por: ${nomeUsuario} (${this.authService.getPerfil()})`, pageWidth - 14, 18, { align: 'right' });

    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(14, 34, pageWidth - 28, 14, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    doc.text('Filtros Aplicados:', 18, 40);

    doc.setFont('helvetica', 'normal');
    let motoristaTexto = 'Todos';
    if (this.filtroMotorista) {
      motoristaTexto = this.mapaMotoristas[Number(this.filtroMotorista)] || this.filtroMotorista;
    }
    const statusTexto = this.filtroStatus ? (this.opcoesStatus.find(s => s.valor === this.filtroStatus)?.rotulo || this.filtroStatus) : 'Todos';
    const periodoTexto = (this.filtroDataInicio || this.filtroDataFim) 
      ? `${this.filtroDataInicio ? this.formatarData(this.filtroDataInicio) : 'Início'} até ${this.filtroDataFim ? this.formatarData(this.filtroDataFim) : 'Hoje'}` 
      : 'Todo o histórico';
    const rotaTexto = this.filtroOrigemDestino || 'Todas as rotas';

    doc.text(`Motorista: ${motoristaTexto}   |   Status: ${statusTexto}   |   Período: ${periodoTexto}   |   Rota: ${rotaTexto}`, 18, 44);

    const totalViagens = dados.length;
    const totalFrete = this.calcularTotalFrete();
    const totalComissao = this.calcularTotalComissao();
    const totalPeso = this.calcularTotalPeso();

    const tableData = dados.map(v => [
      this.formatarData(v.dataViagem),
      this.obterNomeMotorista(v),
      v.origem || '-',
      v.destino || '-',
      (Number(v.pesoTonelada) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
      this.obterValorTonelada(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      this.obterValorTotalFrete(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      (Number(v.valorComissao) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      this.opcoesStatus.find(s => s.valor === v.statusViagem)?.rotulo || v.statusViagem || '-'
    ]);

    const footRow = [
      'TOTAIS',
      `${totalViagens} Viagens`,
      '',
      '',
      `${totalPeso.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`,
      '',
      totalFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      ''
    ];

    autoTable(doc, {
      startY: 52,
      head: [['Data', 'Motorista', 'Origem', 'Destino', 'Peso (Ton)', 'Valor Frete', 'Total Frete', 'Comissão', 'Status']],
      body: tableData,
      foot: [footRow],
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [55, 65, 81],
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      footStyles: {
        fillColor: [243, 244, 246],
        textColor: [17, 24, 39],
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 22 },
        1: { cellWidth: 38, fontStyle: 'bold' },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { halign: 'right', cellWidth: 24 },
        5: { halign: 'right', cellWidth: 26, fontStyle: 'bold', textColor: [55, 65, 81] },
        6: { halign: 'right', cellWidth: 30, fontStyle: 'bold', textColor: [22, 101, 52] },
        7: { halign: 'right', cellWidth: 30, fontStyle: 'bold', textColor: [30, 64, 175] },
        8: { halign: 'center', cellWidth: 29 }
      },
      didDrawPage: (data) => {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(156, 163, 175);
        doc.text(
          'Transportadora Silva & Souza - Sistema de Gestão Operacional e Financeira',
          14,
          pageHeight - 6
        );
        doc.text(
          `Página ${data.pageNumber}`,
          pageWidth - 14,
          pageHeight - 6,
          { align: 'right' }
        );
      }
    });

    const dataHojeIso = new Date().toISOString().slice(0, 10);
    doc.save(`relatorio-viagens-${dataHojeIso}.pdf`);
  }

  estiloStatus(status: string | undefined) {
    return this.opcoesStatus.find(o => o.valor === status) ?? this.opcoesStatus[0];
  }

  abrirMenuStatus(viagem: Viagem, event: MouseEvent): void {
    event.stopPropagation();
    if (this.menuStatus()?.viagem.id === viagem.id) {
      this.menuStatus.set(null);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const larguraMenu = 160;
    this.menuStatus.set({
      viagem,
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

  alterarStatus(viagem: Viagem, novoStatus: string): void {
    this.menuStatus.set(null);
    if (!viagem.id || viagem.statusViagem === novoStatus) return;

    this.service.atualizarStatus(viagem.id, novoStatus).subscribe({
      next: () => {
        this.viagens.update(lista =>
          lista.map(v => v.id === viagem.id ? { ...v, statusViagem: novoStatus } : v)
        );
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Erro ao atualizar status da viagem', err);
        alert(err.error?.message || 'Não foi possível alterar o status da viagem.');
      }
    });
  }

  abrirModalExclusao(id: number | undefined): void {
    if(id) {
      this.idViagemExcluir = id; 
      this.mensagemErro = ''; 
      this.exibindoModalExclusao = true;
    }
  }

  fecharModalExclusao(): void {
    this.exibindoModalExclusao = false; 
    this.idViagemExcluir = null; 
    this.mensagemErro = ''; 
  }

  confirmarExclusao(): void {
    if (this.idViagemExcluir) {
      this.service.excluir(this.idViagemExcluir).subscribe({
        next: () => {
          this.fecharModalExclusao();
          this.carregarViagens();
        },
        error: (err) => {
          console.error(err);
          this.mensagemErro = err.error?.message || 'Erro ao excluir viagem. Verifique se ela já está concluída ou possui despesas vinculadas.';
        }
      });
    }
  }
}
