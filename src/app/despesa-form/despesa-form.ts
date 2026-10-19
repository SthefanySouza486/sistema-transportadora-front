import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { DespesaService } from '../services/despesa';
import { ViagemService } from '../services/viagem';
import { AuthService } from '../services/auth';
import { Viagem } from '../models/viagem';
import { MoedaDirective } from '../directives/moeda';

@Component({
  selector: 'app-despesa-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MoedaDirective],
  templateUrl: './despesa-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './despesa-form.css',
})
export class DespesaForm implements OnInit{
  formulario: FormGroup; 
  idDespesaEdicao: number | null = null;
  listaViagens = signal<Viagem[]>([]); 
  nomeArquivo = signal<string>('');
  arrastandoArquivo = signal<boolean>(false);
  private readonly tamanhoMaximoArquivo = 5 * 1024 * 1024;

  mensagemErro: string = ''; 
  mensagemSucesso: string = ''; 
  carregandoOpcoes: boolean = true; 

  constructor(
    private formBuilder: FormBuilder, 
    private despesaService: DespesaService, 
    private viagemService: ViagemService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.formBuilder.group({
      viagemId: [null, Validators.required], 
      descricao: ['', Validators.required], 
      categoria: ['', Validators.required], 
      valor: ['', [Validators.required, Validators.min(0.1)]], 
      dataDespesa: ['', Validators.required], 
      fotoComprovante: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const perfil = this.authService.getPerfil();
    const usuario = this.authService.getUsuarioLogado() || {};
    const motoristaId = usuario.id || this.authService.getUsuarioId();

    const request$ = (perfil === 'MOTORISTA' && motoristaId)
      ? this.viagemService.listarPorMotorista(Number(motoristaId))
      : this.viagemService.listarTodos();

    request$.subscribe({
      next: (dados) => {
        this.listaViagens.set(dados || []); 
        this.carregandoOpcoes = false;
      }, 
      error: () => {
        this.carregandoOpcoes = false;
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idDespesaEdicao = Number(idParam); 
      this.despesaService.buscarPorId(this.idDespesaEdicao).subscribe(dados => {
        this.formulario.patchValue(dados);
        if (dados.fotoComprovante) {
          this.nomeArquivo.set('Comprovante anexado');
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.processarArquivo(input.files?.[0]);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastandoArquivo.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.arrastandoArquivo.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastandoArquivo.set(false);
    this.processarArquivo(event.dataTransfer?.files?.[0]);
  }

  removerArquivo(): void {
    this.formulario.patchValue({ fotoComprovante: '' });
    this.nomeArquivo.set('');
  }

  get comprovanteEhImagem(): boolean {
    const valor: string = this.formulario.get('fotoComprovante')?.value || '';
    return valor.startsWith('data:image');
  }

  private processarArquivo(file: File | undefined): void {
    if (!file) return;

    const tipoValido = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!tipoValido) {
      this.mensagemErro = 'Formato inválido. Envie uma imagem ou um PDF.';
      return;
    }
    if (file.size > this.tamanhoMaximoArquivo) {
      this.mensagemErro = 'Arquivo muito grande. O limite é de 5 MB.';
      return;
    }

    this.mensagemErro = '';
    const reader = new FileReader();
    reader.onload = () => {
      this.formulario.patchValue({ fotoComprovante: reader.result as string });
      this.nomeArquivo.set(file.name);
    };
    reader.readAsDataURL(file);
  }

  salvar(): void {
    if (this.formulario.valid) {
      this.mensagemErro = '';
      this.mensagemSucesso = '';

      if (this.idDespesaEdicao) {
        this.despesaService.atualizar(this.idDespesaEdicao, this.formulario.value).subscribe({
          next: () => {
            this.mensagemSucesso = 'Despesa atualizada com sucesso!';
            setTimeout(() => this.router.navigate(['/despesas']), 1500);
          },
          error: (err) => {
            console.error('Erro no back-end:', err);
            this.mensagemErro = err.error?.message || 'Erro do servidor ao atualizar.';
          }
        });
      } else {
        this.despesaService.cadastrar(this.formulario.value).subscribe({
          next: () => {
            this.mensagemSucesso = 'Despesa lançada com sucesso!';
            setTimeout(() => this.router.navigate(['/despesas']), 1500);
          },
          error: (err) => {
            console.error('Erro no back-end:', err);
            this.mensagemErro = err.error?.message || 'Erro do servidor ao salvar.';
          }
        });
      }
    } else {
      this.mensagemErro = 'Preencha todos os campos obrigatórios corretamente.';
      this.formulario.markAllAsTouched();
    }
  }
}

