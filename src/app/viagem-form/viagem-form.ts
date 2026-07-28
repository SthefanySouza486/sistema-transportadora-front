import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Motorista } from '../models/motorista';
import { Veiculo } from '../models/veiculo';
import { ViagemService } from '../services/viagem';
import { VeiculoService } from '../services/veiculo';
import { MotoristaService } from '../services/motorista';

@Component({
  selector: 'app-viagem-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './viagem-form.html',
  styleUrl: './viagem-form.css',
})
export class ViagemForm implements OnInit{
  formulario: FormGroup; 
  idViagemEdicao: number | null = null;

  listaMotoristas: Motorista[] =[]; 
  listaVeiculos: Veiculo[] = []; 

  constructor(
    private formBuilder: FormBuilder, 
    private viagemService: ViagemService, 
    private motoristaService: MotoristaService, 
    private veiculoService: VeiculoService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this. formulario = this.formBuilder.group({
      motoristaId: ['', Validators.required], 
      veiculoId: ['', Validators.required], 
      dataViagem: ['', Validators.required],
      origem: ['', Validators.required], 
      destino: ['', Validators.required], 
      dinheiroEntregue: [0], 
      pesoTonelada: ['', [Validators.required, Validators.min(0.1)]], 
      valorTonelada: ['', [Validators.required, Validators.min(0.1)]]
    });
  }

  ngOnInit(): void {
      this.motoristaService.listarTodos().subscribe(dados => this.listaMotoristas = dados); 
      this.veiculoService.listarTodos().subscribe(dados => this.listaVeiculos = dados);
      
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.idViagemEdicao = Number(idParam);
        this.viagemService.buscarPorId(this.idViagemEdicao).subscribe(dados => {
          this.formulario.patchValue(dados);
        });
      }
  }

  salvar(): void {
    if (this.formulario.valid) {
      if (this.idViagemEdicao) {
        this.viagemService.atualizar(this.idViagemEdicao, this.formulario.value).subscribe({
          next: (viagemSalva) => {
            alert(`Sucesso! A viagem foi atualizada. \nFrete Calculado: R$ ${viagemSalva.valorFrete}\nComissão: R$ ${viagemSalva.valorComissao}`);
            this.router.navigate(['/viagens']);
          },
          error: (erro) => {
            console.error(erro); 
            alert('Erro ao atualizar a viagem. Verifique o console.'); 
          }
        });
      } else {
        this.viagemService.cadastrar(this.formulario.value).subscribe({
          next: (viagemSalva) => {
            alert(`Sucesso! A viagem foi registrada. \nFrete Calculado: R$ ${viagemSalva.valorFrete}\nComissão: R$ ${viagemSalva.valorComissao}`);
            this.router.navigate(['/viagens']);
          }, 
          error: (erro) => {
            console.error(erro); 
            alert('Erro ao registrar a viagem. Verifique o console.'); 
          }
        }); 
      }
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}
