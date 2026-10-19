import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MotoristaService } from '../services/motorista';
import { GestorService } from '../services/gestor';

@Component({
  selector: 'app-motorista-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './motorista-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,})
export class MotoristaFormComponent implements OnInit {
  formulario: FormGroup;
  idMotoristaEdicao: number | null = null;
  mensagemErro: string = ''; 
  mostrarSenha: boolean = false; 

  constructor(
    private formBuilder: FormBuilder,
    private motoristaService: MotoristaService,
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
      this.motoristaService.buscarPorId(this.idMotoristaEdicao).subscribe({
        next: (dados) => {
          this.formulario.patchValue(dados);
          this.formulario.get('senha')?.clearValidators();
          this.formulario.get('senha')?.updateValueAndValidity();
        },
        error: (err) => {
          console.error('Erro ao carregar dados do motorista:', err);
          this.mensagemErro = 'Não foi possível carregar os dados para edição.';
        }
      });
    }
  }

  salvar(): void {
    if (this.formulario.valid) {
      this.mensagemErro = '';
      const dadosEnvio = this.formulario.getRawValue();

      if (this.idMotoristaEdicao) {
        this.motoristaService.atualizar(this.idMotoristaEdicao, dadosEnvio).subscribe({
          next: () => this.router.navigate(['/motoristas']),
          error: (err) => this.tratarErro(err)
        });
      } else {
        this.motoristaService.cadastrar(dadosEnvio).subscribe({
          next: () => this.router.navigate(['/motoristas']),
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

