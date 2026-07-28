import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MotoristaService } from '../services/motorista';
import { ViagemService } from '../services/viagem';
import { DespesaService } from '../services/despesa';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{
  totalFaturamento = 0;
  totalDespesas = 0;
  totalMotoristas = 0;
  lucroEstimado = 0;

  constructor(
    private motoristaService: MotoristaService,
    private viagemService: ViagemService,
    private despesaService: DespesaService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    // 1. Busca o total de motoristas cadastrados
    this.motoristaService.listarTodos().subscribe(res => this.totalMotoristas = res.length);

    // 2. Soma o faturamento total das viagens
    this.viagemService.listarTodos().subscribe(res => {
      this.totalFaturamento = res.reduce((acc, v) => acc + (v.valorFrete || 0), 0);
      this.atualizarLucro();
    });

    // 3. Soma todas as despesas operacionais lançadas
    this.despesaService.listarTodos().subscribe(res => {
      this.totalDespesas = res.reduce((acc, d) => acc + d.valor, 0);
      this.atualizarLucro();
    });
  }

  atualizarLucro() {
    this.lucroEstimado = this.totalFaturamento - this.totalDespesas;
  }
}
