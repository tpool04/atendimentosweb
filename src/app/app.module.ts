import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxMaskModule, IConfig } from 'ngx-mask'
 
export const options: Partial<IConfig | null> | (() => Partial<IConfig>) = null;
 
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AtendimentoCadastroComponent } from './atendimento-cadastro/atendimento-cadastro.component';
import { AtendimentoConsultaComponent } from './atendimento-consulta/atendimento-consulta.component';
 
//mapemento das rotas para cada componente
const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'acessar-conta' },
  { path: 'acessar-conta', component: LoginComponent },
  { path: 'criar-conta', component: RegisterComponent },
  { path: 'cadastrar-atendimentos', component: AtendimentoCadastroComponent },
  { path: 'consultar-atendimentos', component: AtendimentoConsultaComponent },
]
 
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AtendimentoCadastroComponent,
    AtendimentoConsultaComponent
  ],
  imports: [
    BrowserModule,
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
 
