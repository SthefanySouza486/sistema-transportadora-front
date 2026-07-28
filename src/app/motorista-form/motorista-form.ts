import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MotoristaService } from '../services/motorista';

@Component({
  selector: 'app-motorista-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './motorista-form.html'
})
export class MotoristaFormComponent implements OnInit {
  formulario: FormGroup;
  idMotoristaEdicao: number | null = null;
  tituloFormulario = 'Cadastrar Novo Motorista';

  constructor(
    private formBuilder: FormBuilder,
    private service: MotoristaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.formBuilder.group({
      nome: ['', Validators.required],
      telefone: ['', Validators.required],
      senha: ['', Validators.required],
      comissao: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idMotoristaEdicao = Number(idParam);
      this.tituloFormulario = 'Editar Motorista';
      
      this.service.buscarPorId(this.idMotoristaEdicao).subscribe(motorista => {
        this.formulario.patchValue({
          nome: motorista.nome,
          telefone: motorista.telefone,
          comissao: motorista.comissao
        });
      });
    }
  }

salvar(): void {
    if (this.formulario.valid) {
      if (this.idMotoristaEdicao) {
        
        this.service.atualizar(this.idMotoristaEdicao, this.formulario.value).subscribe({
          next: () => {
            this.router.navigate(['/motoristas']);
          },
          error: (err) => {
            console.error('Erro ao atualizar:', err);
            const msg = err.error?.message || 'Erro no servidor ao atualizar o motorista.';
            alert(msg);
          }
        });

      } else {
        
        this.service.cadastrar(this.formulario.value).subscribe({
          next: () => {
            this.router.navigate(['/motoristas']);
          },
          error: (err) => {
            console.error('Erro ao cadastrar:', err);
            const msg = err.error?.message || 'Erro no servidor ao cadastrar o motorista.';
            alert(msg);
          }
        });

      }
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}