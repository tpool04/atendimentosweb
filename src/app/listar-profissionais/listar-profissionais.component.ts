import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-listar-profissionais',
  templateUrl: './listar-profissionais.component.html',
  styleUrls: ['./listar-profissionais.component.css']
})
export class ListarProfissionaisComponent implements OnInit {
  profissionais: any[] = [];
  isLoading = false;
  mensagemErro = '';

  perfil: string | null = null;
  profissionalEditando: any = null;
  modoCadastro = false;
  servicosDisponiveis: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.perfil = localStorage.getItem('PERFIL');
    this.carregarServicos();
    this.carregarProfissionais();
  }

  carregarServicos() {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>('http://localhost:8080/api/servicos', { headers }).subscribe({
      next: (res) => {
        this.servicosDisponiveis = res;
      },
      error: () => {
        this.servicosDisponiveis = [];
      }
    });
  }

  abrirEdicao(profissional: any) {
    this.profissionalEditando = profissional;
    this.modoCadastro = false;
  }

  abrirCadastro() {
    this.profissionalEditando = { nome: '', telefone: '', servicos: [] };
    this.modoCadastro = true;
  }

  aoAtualizar() {
    this.profissionalEditando = null;
    this.carregarProfissionais();
  }



  carregarProfissionais() {
    this.isLoading = true;
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>('http://localhost:8080/api/profissionais/detalhados', { headers }).subscribe({
      next: (res) => {
        this.profissionais = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao carregar profissionais.';
        this.isLoading = false;
      }
    });
  }
}
