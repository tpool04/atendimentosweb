import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Login2FAComponent } from './login/login-2fa.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxMaskModule, IConfig } from 'ngx-mask'
 
export const options: Partial<IConfig | null> | (() => Partial<IConfig>) = null;
 
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AtendimentoCadastroComponent } from './atendimento-cadastro/atendimento-cadastro.component';

import { AtendimentoConsultaComponent } from './atendimento-consulta/atendimento-consulta.component';
import { AtendimentoReagendarComponent } from './atendimento-reagendar/atendimento-reagendar.component';
 
//mapemento das rotas para cada componente

import { CadastroConsultaComponent } from './consulta-cadastro/cadastro-consulta.component';
import { ClienteEditarComponent } from './cliente-editar/cliente-editar.component';
import { Ativar2FAComponent } from './ativar-2fa/ativar-2fa.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'acessar-conta' },
  { path: 'acessar-conta', component: LoginComponent },
  { path: 'criar-conta', component: RegisterComponent },
  { path: 'cadastrar-atendimentos', component: AtendimentoCadastroComponent },
  { path: 'consultar-atendimentos', component: AtendimentoConsultaComponent },
  { path: 'consulta-cadastro', component: CadastroConsultaComponent },
  { path: 'editar-cliente', component: ClienteEditarComponent },
  { path: 'editar-atendimento/:id', component: AtendimentoReagendarComponent },
]
 
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AtendimentoCadastroComponent,
    AtendimentoConsultaComponent,
    CadastroConsultaComponent,
    ClienteEditarComponent,
    AtendimentoReagendarComponent,
    Ativar2FAComponent,
    Login2FAComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxMaskModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

