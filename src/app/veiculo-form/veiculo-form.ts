import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { VeiculoService } from '../services/veiculo';

@Component({
  selector: 'app-veiculo-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './veiculo-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
      placaCarreta1: [''], 
      placaCarreta2: ['']
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idVeiculoEdicao = Number(idParam);
      
      this.service.buscarPorId(this.idVeiculoEdicao).subscribe({
        next: (dados) => {
          console.log('Dados recebidos do Java para edição:', dados); 
        
          this.formulario.patchValue({
            placa: dados.placa,
            placaCarreta1: dados.placaCarreta1,
            placaCarreta2: dados.placaCarreta2
          });
        },
        error: (err) => {
          console.error('Erro ao buscar dados do veículo:', err);
          this.mensagemErro = 'Não foi possível carregar os dados do veículo para edição.';
        }
      });
    }
  }

salvar(): void {
  if (this.formulario.valid) {
    this.mensagemErro = ''; 

    const dados = this.formulario.value;
    const dadosParaEnviar: any= {
      ...dados,
      placa: dados.placa ? dados.placa.toUpperCase().trim() : '',
      placaCarreta1: dados.placaCarreta1 ? dados.placaCarreta1.toUpperCase().trim() : null,
      placaCarreta2: dados.placaCarreta2 ? dados.placaCarreta2.toUpperCase().trim() : null
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
