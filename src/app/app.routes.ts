import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard'; 
import { MotoristaListaComponent } from './motorista-lista/motorista-lista';
import { MotoristaFormComponent } from './motorista-form/motorista-form';
import { ViagemForm } from './viagem-form/viagem-form';
import { ViagemLista } from './viagem-lista/viagem-lista';
import { VeiculoForm } from './veiculo-form/veiculo-form';
import { VeiculoLista } from './veiculo-lista/veiculo-lista';
import { DespesaLista } from './despesa-lista/despesa-lista';
import { DespesaForm } from './despesa-form/despesa-form';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: Login }, 
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

  // 1. EXCLUSIVO DO GESTOR (Administração)
  { path: 'motoristas', component: MotoristaListaComponent, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'motoristas/novo', component: MotoristaFormComponent, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'motoristas/editar/:id', component: MotoristaFormComponent, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  
  { path: 'veiculos', component: VeiculoLista, canActivate: [authGuard], data: { roles: ['GESTOR'] } }, 
  { path: 'veiculos/novo', component: VeiculoForm, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'veiculos/editar/:id', component: VeiculoForm, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  
  // 2. ACESSO COMPARTILHADO (Ambos podem VER as listas)
  { path: 'viagens', component: ViagemLista, canActivate: [authGuard] },
  { path: 'despesas', component: DespesaLista, canActivate: [authGuard] }, 

  // 3. EXCLUSIVO DO MOTORISTA (Só ele pode CADASTRAR ou EDITAR)
  { path: 'viagens/nova', component: ViagemForm, canActivate: [authGuard], data: { roles: ['MOTORISTA'] } },
  { path: 'viagens/editar/:id', component: ViagemForm, canActivate: [authGuard], data: { roles: ['MOTORISTA'] } },
  
  { path: 'despesas/nova', component: DespesaForm, canActivate: [authGuard], data: { roles: ['MOTORISTA'] } },
  { path: 'despesas/editar/:id', component: DespesaForm, canActivate: [authGuard], data: { roles: ['MOTORISTA'] } },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];