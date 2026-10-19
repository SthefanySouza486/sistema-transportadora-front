import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.css',
})
export class Login implements OnInit {
  formularioLogin: FormGroup;
  mensagemErro = signal<string>(''); 
  carregando = signal<boolean>(false);
  mostrarSenha: boolean = false; 

  constructor(
    private formBuilder: FormBuilder,
    private router: Router, 
    private authService: AuthService
  ) {
    this.formularioLogin = this.formBuilder.group({
      usuario: ['', Validators.required],
      senha: ['', Validators.required], 
      lembrar: [true]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLogado()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const usuarioSalvo = localStorage.getItem('usuario_salvo');
    if (usuarioSalvo) {
      this.formularioLogin.patchValue({
        usuario: usuarioSalvo,
        lembrar: true
      });
    }
  }

  entrar(): void {
    this.mensagemErro.set('');

    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      this.mensagemErro.set('Preencha o usuário e a senha para entrar no sistema.');
      return;
    }

    const { usuario, senha, lembrar } = this.formularioLogin.value;
    const usuarioLimpo = (usuario || '').trim();
    const senhaLimpo = (senha || '').trim();

    if (lembrar) {
      localStorage.setItem('usuario_salvo', usuarioLimpo);
    } else {
      localStorage.removeItem('usuario_salvo');
    }

    this.carregando.set(true);

    this.authService.fazerLogin({ usuario: usuarioLimpo, senha: senhaLimpo }, !!lembrar).subscribe({
      next: (resposta: any) => {
        this.carregando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.carregando.set(false);
        const mensagem = err.error?.message || 'Acesso negado: Usuário ou senha incorretos.';
        this.mensagemErro.set(mensagem);
      }
    });
  }
}