// ...existing code...
import { Component, OnInit, ViewChild } from '@angular/core';
import { Login2FAComponent } from './login-2fa.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoggingService } from '../logging.service';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  nomeCliente: string = '';
  perfilCliente: string = '';
  show2FAModal: boolean = false;
  tempLoginResult: any = null;

  isLoading = false;

  mensagem_erro: string = '';

 
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private authService: AuthService,
    private loggingService: LoggingService
  ) { }
 
  formLogin = new FormGroup({
    cpf: new FormControl('', [Validators.required]),
    senha: new FormControl('', [Validators.required]),
  });
 
  get form(): any {
    return this.formLogin.controls;
  }
 
  ngOnInit(): void {
  // ...existing code...
  }
 
  onSubmit(): void {
    this.isLoading = true;
    this.httpClient.post(environment.atendimentosApi + "api/acessar-conta",
      this.formLogin.value).subscribe({
        next: (result: any) => {
          this.isLoading = false;
          if (result.nome && result.nome.startsWith('2FA necessário. Use o ID:')) {
            // 2FA está ativado para esse usuário, abrir modal
            this.tempLoginResult = result;
            this.show2FAModal = true;
          } else if (result.autenticado === true && result.token) {
            // 2FA não está ativado, pode logar normalmente
            localStorage.setItem("ACCESS_TOKEN", result.token);
            localStorage.setItem("NOME_CLIENTE", result.nome);
            if (result.idCliente) {
              localStorage.setItem("ID_CLIENTE", String(result.idCliente));
            }
            if (result.perfil) {
              localStorage.setItem("PERFIL", result.perfil);
            }
            this.authService.setLogado(true);
            this.router.navigate(["/consultar-atendimentos"]);
          } else {
            this.mensagem_erro = 'Ative o 2FA antes de acessar sua conta.';
          }
        },
        error: (e) => {
          this.isLoading = false;
          this.loggingService.logError('Erro ao fazer login', e);
          if (e.error && typeof e.error === 'object' && e.error.message) {
            this.mensagem_erro = e.error.message;
          } else if (typeof e.error === 'string') {
            this.mensagem_erro = e.error;
          } else {
            this.mensagem_erro = 'Erro ao fazer login. Verifique usuário e senha.';
          }
        }
      });
  }

  on2FAConfirmado(codigo: string) {
  console.log('[2FA] Código recebido do modal:', codigo);
    // ...existing code...
    this.loggingService.logError('Enviando POST para /api/confirmar-2fa', {
      url: environment.atendimentosApi + 'api/confirmar-2fa',
      payload: {
        idCliente: this.tempLoginResult?.idCliente,
        codigo: codigo
      },
      headers: { Authorization: `Bearer ${this.tempLoginResult?.token}` }
    });
    if (!this.tempLoginResult) return;
    const token = localStorage.getItem('ACCESS_TOKEN');
    const idCliente = this.tempLoginResult.idCliente;
    const headers = { 'Content-Type': 'application/json' };
    this.isLoading = true;
    this.httpClient.post(environment.atendimentosApi + 'api/confirmar-2fa', {
      idCliente: Number(idCliente),
      codigo: Number(codigo)
    }, { headers }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.verified && res.token) {
          localStorage.setItem("ACCESS_TOKEN", res.token);
          localStorage.setItem("NOME_CLIENTE", res.nome || this.tempLoginResult.nome);
          if (idCliente) {
            localStorage.setItem("ID_CLIENTE", String(idCliente));
          }
          if (res.perfil) {
            localStorage.setItem("PERFIL", res.perfil);
          }
          // ...existing code...
          this.authService.setLogado(true);
          this.show2FAModal = false;
          this.tempLoginResult = null;
          this.router.navigate(["/consultar-atendimentos"]);
        } else {
          this.mensagem_erro = 'Código 2FA inválido. Tente novamente.';
        }
      },
      error: (err) => {
      
        this.isLoading = false;
        this.loggingService.logError('Erro ao validar código 2FA', err);
        this.mensagem_erro = 'Erro ao validar código 2FA.';
      }
    });
  }

  on2FAFechado() {
    this.show2FAModal = false;
    this.tempLoginResult = null;
  }
  }
 
