import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { VeiculoService } from '../services/veiculo';

@Component({
  selector: 'app-veiculo-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './veiculo-form.html',
  styleUrl: './veiculo-form.css',
})
export class VeiculoForm implements OnInit {
  formulario: FormGroup; 
  idVeiculoEdicao: number | null = null;
  mensagemErro: string = ''; 

  constructor( 
    private formBuilder: FormBuilder, 
    private service: VeiculoService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.formBuilder.group({
      placa: ['', Validators.required], 
      tipo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idVeiculoEdicao = Number(idParam);
      this.service.buscarPorId(this.idVeiculoEdicao).subscribe(dados => {
        this.formulario.patchValue(dados);
      });
    }
  }
salvar(): void {
  if (this.formulario.valid) {
    this.mensagemErro = ''; 

    const dados = this.formulario.value;
    const dadosParaEnviar = {
      ...dados,
      tipo: dados.tipo ? dados.tipo.toUpperCase().trim() : ''
    };

    if (this.idVeiculoEdicao) {
      this.service.atualizar(this.idVeiculoEdicao, dadosParaEnviar).subscribe({
        next: () => this.router.navigate(['/veiculos']),
        error: (err) => {
          console.error('Erro ao atualizar veículo:', err);
          this.mensagemErro = err.error?.message || 'Erro ao atualizar. Verifique os dados e tente novamente.';
        }
      });
    } else {
      this.service.cadastrar(dadosParaEnviar).subscribe({
        next: () => this.router.navigate(['/veiculos']),
        error: (err) => {
          console.error('Erro ao salvar veículo:', err);
          this.mensagemErro = err.error?.message || 'Erro ao cadastrar. O veículo já existe ou os dados são inválidos.';
        }
      });
    }
  } else {
    this.formulario.markAllAsTouched();
  }
}
}
