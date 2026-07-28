import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { DespesaService } from '../services/despesa';
import { ViagemService } from '../services/viagem';
import { Viagem } from '../models/viagem';

@Component({
  selector: 'app-despesa-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './despesa-form.html',
  styleUrl: './despesa-form.css',
})
export class DespesaForm implements OnInit{
  formulario: FormGroup; 
  idDespesaEdicao: number | null = null;
  listaViagens: Viagem[] = []; 

  constructor(
    private formBuilder: FormBuilder, 
    private despesaService: DespesaService, 
    private viagemService: ViagemService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulario = this.formBuilder.group({
      viagemId: ['', Validators.required], 
      descricao: ['', Validators.required], 
      categoria: ['', Validators.required], 
      valor: ['', [Validators.required, Validators.min(0.1)]], 
      dataDespesa: ['', Validators.required]
    });
  }

  ngOnInit(): void {
      this.viagemService.listarTodos().subscribe(dados => this.listaViagens = dados);
      
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.idDespesaEdicao = Number(idParam);
        this.despesaService.buscarPorId(this.idDespesaEdicao).subscribe(dados => {
          this.formulario.patchValue(dados);
        });
      }
  }

  salvar(): void{
    if (this.formulario.valid) {
      if (this.idDespesaEdicao) {
        this.despesaService.atualizar(this.idDespesaEdicao, this.formulario.value).subscribe({
          next: () => this.router.navigate(['/despesas']),
          error: (err) => {
            console.error(err);
            alert('Erro ao atualizar despesa.');
          }
        });
      } else {
        this.despesaService.cadastrar(this.formulario.value).subscribe({
          next: () => this.router.navigate(['/despesas']),
          error: (err) => {
            console.error(err);
            alert('Erro ao lançar despesa.');
          }
        });
      }
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}
