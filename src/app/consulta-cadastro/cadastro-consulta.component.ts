import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Ativar2FAComponent } from '../ativar-2fa/ativar-2fa.component';

@Component({
  selector: 'app-cadastro-consulta',
  templateUrl: './cadastro-consulta.component.html'
})
export class CadastroConsultaComponent implements OnInit {
  perfil: string | null = null;
  cliente: any;
  endereco: any;
  @ViewChild('ativar2FAComponent') ativar2FAComponent!: Ativar2FAComponent;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.perfil = localStorage.getItem('PERFIL');
    console.log('[DEBUG] Valor de perfil no localStorage:', this.perfil);
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  this.http.get<any>(`${environment.clienteService}api/clientes/me`, { headers }).subscribe({
      next: (res) => {
        // Alguns backends retornam { cliente, endereco }, outros retornam um objeto plano com os campos
        if (res) {
          if (res.cliente || res.endereco) {
            this.cliente = res.cliente || null;
            this.endereco = res.endereco || null;
          } else {
            // Mapear campos do objeto raiz para cliente/endereco
            this.cliente = {
              nome: res.nome,
              cpf: res.cpf,
              email: res.email,
              telefone: res.telefone,
              twoFactorAtivo: res.twoFactorAtivo
            };
            this.endereco = {
              logradouro: res.logradouro,
              numero: res.numero,
              complemento: res.complemento,
              bairro: res.bairro,
              cidade: res.cidade,
              uf: res.uf,
              cep: res.cep
            };
          }
        } else {
          this.cliente = null;
          this.endereco = null;
        }
      },
      error: (err) => {
        this.cliente = null;
        this.endereco = null;
      }
    });
  }

  on2FAAtivado() {
    // Log para debug do status do 2FA
    setTimeout(() => {
      console.log('[2FA] Status twoFactorAtivo após reload:', this.cliente?.twoFactorAtivo);
    }, 500);
    alert('Autenticação de dois fatores ativada com sucesso!');
    // Recarregar dados do cliente para atualizar o status do 2FA
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = { Authorization: `Bearer ${token}` };
  this.http.get<any>(`${environment.clienteService}api/clientes/me`, { headers }).subscribe({
      next: (res) => {
        this.cliente = res.cliente;
      },
      error: () => {
        // Se falhar, mantém o alerta
      }
    });
  }
}
