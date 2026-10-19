import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { GestorService } from '../services/gestor';

@Component({
  selector: 'app-gestor-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './gestor-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './gestor-form.css',
})
export class GestorForm {
  formulario: FormGroup;
  idGestorEdicao: number | null = null;
  mensagemErro: string = '';
  mostrarSenha: boolean = false; 

  constructor(
    private formBuilder: FormBuilder,
    private gestorService: GestorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.formBuilder.group({
      nome: ['', Validators.required],
      senha: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idGestorEdicao = Number(idParam);
      
      this.gestorService.buscarPorId(this.idGestorEdicao).subscribe({
        next: (dados) => {
          this.formulario.patchValue(dados); 
          
          this.formulario.get('senha')?.clearValidators();
          this.formulario.get('senha')?.updateValueAndValidity();
        },
        error: (err) => {
          console.error('Erro ao carregar dados do gestor:', err);
          this.mensagemErro = 'Não foi possível carregar os dados para edição.';
        }
      });
    }
  }

  salvar(): void {
    if (this.formulario.valid) {
      this.mensagemErro = '';
      const dadosEnvio = this.formulario.getRawValue();

      if (this.idGestorEdicao) {
        this.gestorService.atualizar(this.idGestorEdicao, dadosEnvio).subscribe({
          next: () => this.router.navigate(['/gestores']),
          error: (err) => this.tratarErro(err)
        });
      } else {
        this.gestorService.cadastrar(dadosEnvio).subscribe({
          next: () => this.router.navigate(['/gestores']),
          error: (err) => this.tratarErro(err)
        });
      }
    } else {
      this.formulario.markAllAsTouched();
    }
  }

  private tratarErro(err: any): void {
    console.error('Erro na requisição:', err);
    this.mensagemErro = err.error?.message || 'Erro do servidor ao processar o cadastro.';
  }
}
