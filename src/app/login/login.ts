import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  formularioLogin: FormGroup;
  erroLogin = false; 

  constructor(
    private formBuilder: FormBuilder,
    private router: Router, 
    private authService: AuthService
  ) {
    this.formularioLogin = this.formBuilder.group({
      usuario: ['', Validators.required],
      senha: ['', Validators.required]
    });
  }

  entrar(): void {
    if (this.formularioLogin.valid) {
      this.erroLogin = false; 

      this.authService.fazerLogin(this.formularioLogin.value).subscribe({
        next: (resposta) => {
          console.log('Login aprovado! Redirecionando...', resposta);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Erro no login', err);
          this.erroLogin = true; 
        }
      });
    } else {
      this.formularioLogin.markAllAsTouched();
    }
  }
}
