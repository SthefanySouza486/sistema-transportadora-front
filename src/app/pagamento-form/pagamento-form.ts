import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import { MotoristaService } from '../services/motorista';
import { PagamentoService } from '../services/pagamento';
import { MoedaDirective } from '../directives/moeda';

@Component({
  selector: 'app-pagamento-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MoedaDirective],
  templateUrl: './pagamento-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pagamento-form.css',
})
export class PagamentoForm implements OnInit{
  formulario: FormGroup;
  mensagemErro: string = '';
  listaMotoristas = signal<any[]>([]);
  idPagamentoEdicao: number | null = null;
  nomeArquivo = signal<string>('');
  arrastandoArquivo = signal<boolean>(false);
  private readonly tamanhoMaximoArquivo = 5 * 1024 * 1024;

  constructor(
    private formBuilder: FormBuilder,
    private pagamentoService: PagamentoService,
    private motoristaService: MotoristaService,
    private authService: AuthService,
    private router: Router, 
    private route: ActivatedRoute
  ) {
    this.formulario = this.formBuilder.group({
      motoristaId: ['', Validators.required],
      dataPagamento: ['', Validators.required],
      periodoReferencia: ['', Validators.required],
      valorPago: ['', [Validators.required, Validators.min(0.1)]],
      statusPagamento: ['PAGO', Validators.required],
      fotoComprovante: ['']
    });
  }

  ngOnInit(): void {
    this.motoristaService.listarTodos().subscribe({
      next: (dados) => this.listaMotoristas.set(dados)
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idPagamentoEdicao = Number(idParam);
      this.pagamentoService.buscarPorId(this.idPagamentoEdicao).subscribe({
        next: (dados) => {
          if (dados.periodoReferencia && dados.periodoReferencia.length > 7) {
            dados.periodoReferencia = dados.periodoReferencia.substring(0, 7);
          }
          this.formulario.patchValue(dados);
          if (dados.fotoComprovante) {
            this.nomeArquivo.set('Comprovante anexado');
          }
        },
        error: (err) => console.error('Erro ao carregar pagamento:', err)
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
      
      const dados = this.formulario.getRawValue();
      const usuarioLogado = this.authService.getUsuarioLogado() || {};
      dados.gestorId = usuarioLogado.id || 1; 

      if (this.idPagamentoEdicao) {
        this.pagamentoService.atualizar(this.idPagamentoEdicao, dados).subscribe({
          next: () => this.router.navigate(['/pagamentos']),
          error: (err) => this.tratarErro(err)
        });
      } else {
        this.pagamentoService.registrarPagamento(dados).subscribe({
          next: () => this.router.navigate(['/pagamentos']),
          error: (err) => this.tratarErro(err)
        }); 
      }
    } else {
      this.formulario.markAllAsTouched();
    }
  }

  private tratarErro(err: any): void {
    console.error(err);
    this.mensagemErro = err.error?.message || 'Erro ao salvar pagamento.';
  }
}
