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
import { MinhasViagens } from './minhas-viagens/minhas-viagens';
import { GestorLista } from './gestor-lista/gestor-lista';
import { GestorForm } from './gestor-form/gestor-form';
import { PagamentoForm } from './pagamento-form/pagamento-form';
import { PagamentoLista } from './pagamento-lista/pagamento-lista';

export const routes: Routes = [
  { path: 'login', component: Login }, 
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

  // rotas exclusivas do gestor
  { path: 'motoristas', component: MotoristaListaComponent, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'motoristas/novo', component: MotoristaFormComponent, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'motoristas/editar/:id', component: MotoristaFormComponent, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'veiculos', component: VeiculoLista, canActivate: [authGuard], data: { roles: ['GESTOR'] } }, 
  { path: 'veiculos/novo', component: VeiculoForm, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'veiculos/editar/:id', component: VeiculoForm, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'gestores', component: GestorLista, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'gestores/novo', component: GestorForm, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'gestores/editar/:id', component: GestorForm, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'pagamentos/novo', component: PagamentoForm, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'pagamentos/editar/:id', component: PagamentoForm, canActivate: [authGuard], data: { roles: ['GESTOR'] } },
  { path: 'pagamentos', component: PagamentoLista, canActivate: [authGuard], data: { roles: ['GESTOR', 'MOTORISTA'] } },

  // rotas tanto do gestor como do motorista
  { path: 'viagens', component: ViagemLista, canActivate: [authGuard] },
  { path: 'despesas', component: DespesaLista, canActivate: [authGuard] }, 

  // rotas excluivas do motorista
  { path: 'minhas-viagens', component: MinhasViagens, canActivate: [authGuard], data: { roles: ['MOTORISTA'] } },
  { path: 'viagens/nova', component: ViagemForm, canActivate: [authGuard], data: { roles: ['MOTORISTA', 'GESTOR'] } },
  { path: 'viagens/editar/:id', component: ViagemForm, canActivate: [authGuard], data: { roles: ['MOTORISTA', 'GESTOR'] } },
  { path: 'despesas/nova', component: DespesaForm, canActivate: [authGuard], data: { roles: ['MOTORISTA', 'GESTOR'] } },
  { path: 'despesas/editar/:id', component: DespesaForm, canActivate: [authGuard], data: { roles: ['MOTORISTA', 'GESTOR'] } },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];