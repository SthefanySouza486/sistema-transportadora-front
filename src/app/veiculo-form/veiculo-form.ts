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
      if (this.idVeiculoEdicao) {
        this.service.atualizar(this.idVeiculoEdicao, this.formulario.value).subscribe({
          next: () => this.router.navigate(['/veiculos']),
          error: (err) => {
            console.error('Erro ao atualizar veículo:', err);
            const msg = err.error?.message || 'Erro no servidor ao atualizar o veículo.';
            alert(msg);
          }
        });
      } else {
        this.service.cadastrar(this.formulario.value).subscribe({
          next: () => this.router.navigate(['/veiculos']),
          error: (err) => {
            console.error('Erro ao salvar veículo:', err);
            const msg = err.error?.message || 'Erro no servidor ao cadastrar o veículo.';
            alert(msg);
          }
        });
      }
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}
