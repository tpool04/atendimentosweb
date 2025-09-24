import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Ativar2FAComponent } from '../ativar-2fa/ativar-2fa.component';

@Component({
  selector: 'app-cadastro-consulta',
  templateUrl: './cadastro-consulta.component.html'
})
export class CadastroConsultaComponent implements OnInit {
  cliente: any;
  endereco: any;
  @ViewChild('ativar2FAComponent') ativar2FAComponent!: Ativar2FAComponent;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.http.get<any>('http://localhost:8080/api/clientes/me', { headers }).subscribe({
      next: (res) => {
        this.cliente = res.cliente;
        this.endereco = res.endereco;
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
    this.http.get<any>('http://localhost:8080/api/clientes/me', { headers }).subscribe({
      next: (res) => {
        this.cliente = res.cliente;
      },
      error: () => {
        // Se falhar, mantém o alerta
      }
    });
  }
}
