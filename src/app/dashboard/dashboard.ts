import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MotoristaService } from '../services/motorista';
import { ViagemService } from '../services/viagem';
import { DespesaService } from '../services/despesa';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{
  //variaveis para a parte do GESTOR
  totalFaturamento = 0;
  totalDespesasGlobal = 0;
  totalMotoristas = 0;
  lucroEstimado = 0;

  //variaveis para a parte do MOTORISTA
  meuTotalProduzido = 0; 
  minhasDespesas = 0; 
  minhaComissao = 0; 

  constructor(
    private motoristaService: MotoristaService,
    private viagemService: ViagemService,
    private despesaService: DespesaService, 
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const perfil = this.authService.getPerfil();
    const usuario = this.authService.getUsuarioLogado() || {};

    console.log("Dashboard ngOnInit iniciado. Perfil:", perfil);
    console.log("Usuario lido do localStorage:", usuario);

    if (perfil === 'GESTOR') {
      console.log("Chamando carregarDadosGestor()...");
      this.carregarDadosGestor(); 
    } else if (perfil === 'MOTORISTA') {
      if (usuario.id) {
        console.log("Chamando carregarDadosMotorista() com id:", usuario.id);
        this.carregarDadosMotorista(usuario.id);
      } else {
        console.warn("usuario.id está ausente no objeto usuario!", usuario);
        const authServiceId = this.authService.getUsuarioId();
        if (authServiceId && authServiceId !== 'undefined') {
           console.log("Usando ID salvo no authService:", authServiceId);
           this.carregarDadosMotorista(Number(authServiceId));
        }
      }
    }
  }

  carregarDadosGestor() {
   this.motoristaService.listarTodos().subscribe(res => this.totalMotoristas = res.length);

    this.viagemService.listarTodos().subscribe(res => {
      this.totalFaturamento = res.reduce((acc, v) => acc + (Number(v.valorFrete) || 0), 0);
      this.lucroEstimado = this.totalFaturamento - this.totalDespesasGlobal;
    });

    this.despesaService.listarTodos().subscribe(res => {
      this.totalDespesasGlobal = res.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      this.lucroEstimado = this.totalFaturamento - this.totalDespesasGlobal;
      this.cdr.detectChanges();
    });
  }


  carregarDadosMotorista(motoristaId: number) {
    this.viagemService.listarPorMotorista(motoristaId).subscribe({
      next: (viagens) => {
        console.log("Viagens do motorista recebidas:", viagens);
        
        this.meuTotalProduzido = viagens.reduce((acc, v) => {
          console.log("Analisando viagem id:", v.id, "valorFrete:", v.valorFrete);
          let frete: any = v.valorFrete || 0;
          if (typeof frete === 'string') { frete = frete.replace(/\./g, '').replace(',', '.'); }
          const somar = Number(frete) || 0;
          console.log("Somando:", somar);
          return acc + somar;
        }, 0);
        console.log("MEU TOTAL PRODUZIDO FINAL:", this.meuTotalProduzido);

        this.minhaComissao = viagens.reduce((acc, v) => {
          let comissao: any = v.valorComissao || 0;
          if (typeof comissao === 'string') { comissao = comissao.replace(/\./g, '').replace(',', '.'); }
          return acc + (Number(comissao) || 0);
        }, 0);
        
        const idsDasMinhasViagens = viagens.map(v => v.id);

        this.despesaService.listarTodos().subscribe(despesas => {
          const despesasDesteMotorista = despesas.filter(d => idsDasMinhasViagens.includes(d.viagemId)); 
          console.log("Despesas do motorista recebidas:", despesasDesteMotorista);
          
          this.minhasDespesas = despesasDesteMotorista.reduce((acc, d) => {
            let custo: any = d.valor || 0;
            if (typeof custo === 'string') { custo = custo.replace(/\./g, '').replace(',', '.'); }
            return acc + (Number(custo) || 0);
          }, 0);
          
          this.cdr.detectChanges();
        });
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erro ao buscar viagens do motorista:", err);
      }
    });
  }
}
