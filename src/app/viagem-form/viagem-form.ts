import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Motorista } from '../models/motorista';
import { Veiculo } from '../models/veiculo';
import { ViagemService } from '../services/viagem';
import { VeiculoService } from '../services/veiculo';
import { MotoristaService } from '../services/motorista';
import { AuthService } from '../services/auth';
import { IbgeService } from '../services/ibge';
import { MoedaDirective } from '../directives/moeda';

@Component({
  selector: 'app-viagem-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MoedaDirective],
  templateUrl: './viagem-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './viagem-form.css',
})
export class ViagemForm implements OnInit{
  formulario: FormGroup; 
  idViagemEdicao: number | null = null;

  listaMotoristas = signal<Motorista[]>([]); 
  listaVeiculos = signal<Veiculo[]>([]); 
  listaCidades = signal<string[]>([]);

  mensagemErro: string = ''; 
  mensagemSucesso: string = ''; 
  carregandoOpcoes: boolean = true; 

  constructor(
    private formBuilder: FormBuilder, 
    private viagemService: ViagemService, 
    private motoristaService: MotoristaService, 
    private veiculoService: VeiculoService, 
    private ibgeService: IbgeService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.formBuilder.group({
      motoristaId: ['', Validators.required], 
      veiculoId: ['', Validators.required], 
      dataViagem: ['', Validators.required],
      origem: ['', Validators.required], 
      destino: ['', Validators.required], 
      dinheiroEntregue: [0], 
      pesoTonelada: ['', [Validators.required, (control) => {
        const val = control.value;
        if (!val) return null;
        const num = Number(String(val).replace(',', '.'));
        return (!isNaN(num) && num > 0) ? null : { min: { min: 0.001, actual: val } };
      }]], 
      valorTonelada: ['', [Validators.required, Validators.min(0.1)]]
    });
  }

  ngOnInit(): void {
    this.carregarDadosIniciais(); 

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idViagemEdicao = Number(idParam);
      this.viagemService.buscarPorId(this.idViagemEdicao).subscribe(dados => {
        if (dados && dados.pesoTonelada != null) {
          const num = Number(dados.pesoTonelada);
          dados.pesoTonelada = num.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) as any;
        }
        this.formulario.patchValue(dados);
      });
    } else {
      if (this.authService.getPerfil() === 'MOTORISTA') {
        const usuario = this.authService.getUsuarioLogado();
        const usuarioId = usuario?.id || this.authService.getUsuarioId();
        if (usuarioId) {
          this.formulario.patchValue({ motoristaId: Number(usuarioId) });
        }
      }
    }
  }

  carregarDadosIniciais(): void {
    this.carregandoOpcoes = true; 
    let motoristasProntos = false; 
    let veiculosProntos = false; 

    const checarSeTerminou = () => {
      if(motoristasProntos && veiculosProntos) {
        this.carregandoOpcoes = false;
      }
    }; 

    this.motoristaService.listarTodos().subscribe({
      next: (dados) => { this.listaMotoristas.set(dados); motoristasProntos = true; checarSeTerminou(); }, 
      error: () => { motoristasProntos = true; checarSeTerminou(); }
    });

    this.veiculoService.listarTodos().subscribe({
      next: (dados) => { this.listaVeiculos.set(dados); veiculosProntos = true; checarSeTerminou(); }, 
      error: () => { veiculosProntos = true; checarSeTerminou(); }
    }); 

    this.ibgeService.listarMunicipios().subscribe({
      next: (cidades) => this.listaCidades.set(cidades),
      error: (err) => console.error('Erro ao carregar municípios do IBGE:', err)
    });
  }

  obterPesoNormalizado(): number {
    const valorBruto = String(this.formulario.get('pesoTonelada')?.value || '0').trim(); 
    if (!valorBruto) return 0; 

    let numero = Number(valorBruto.replace(',', '.')); 

    if (numero > 1000) {
      numero = numero / 1000; 
    }
    return isNaN(numero) ? 0 : numero; 
  }

  calcularValorTotalFrete(): number {
    const peso = this.obterPesoNormalizado(); 
    const valorTon = Number(String(this.formulario.get('valorTonelada')?.value || '0').replace(',', '.')); 
    return peso * (isNaN(valorTon) ? 0 : valorTon);
  }

  salvar(): void {
    if (this.formulario.valid) {
      this.mensagemErro = '';
      this.mensagemSucesso = '';

      let motoristaIdFinal = this.formulario.get('motoristaId')?.value;
      if (!motoristaIdFinal && this.authService.getPerfil() === 'MOTORISTA') {
        const usuario = this.authService.getUsuarioLogado() || {};
        motoristaIdFinal = usuario.id || Number(this.authService.getUsuarioId());
      }

      if (!motoristaIdFinal) {
        this.mensagemErro = 'Erro: Selecione um motorista válido para a viagem.';
        return;
      }

      const dadosParaEnviar = {
        ...this.formulario.value,
        motoristaId: Number(motoristaIdFinal),
        pesoTonelada: this.obterPesoNormalizado(),
        valorTonelada: Number(String(this.formulario.get('valorTonelada')?.value || 0).replace(',', '.')),
        dinheiroEntregue: Number(String(this.formulario.get('dinheiroEntregue')?.value || 0).replace(',', '.'))
      };

    console.log("DADOS ENVIADOS PARA O JAVA:", dadosParaEnviar);

    if (this.idViagemEdicao) {
      this.viagemService.atualizar(this.idViagemEdicao, dadosParaEnviar).subscribe({
        next: () => {
          this.mensagemSucesso = 'Viagem atualizada com sucesso!';
          setTimeout(() => this.router.navigate(['/viagens']), 1500);
        },
        error: (err) => {
          console.error('Erro no back-end:', err);
          this.mensagemErro = err.error?.message || 'Erro do servidor ao atualizar.';
        }
      });
    } else {
      this.viagemService.cadastrar(dadosParaEnviar).subscribe({
        next: () => {
          this.mensagemSucesso = 'Viagem lançada com sucesso!';
          setTimeout(() => this.router.navigate(['/viagens']), 1500);
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

