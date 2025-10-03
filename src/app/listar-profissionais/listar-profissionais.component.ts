import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.perfil = localStorage.getItem('PERFIL');
    this.carregarServicos();
    this.carregarProfissionais();
  }

  carregarServicos() {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  this.http.get<any[]>(`${environment.atendimentosApi}api/servicos`, { headers }).subscribe({
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
    console.log('abrirCadastro chamado');
    this.profissionalEditando = {
      idProfissional: null,
      nome: '',
      telefone: '',
      servicos: [],
      valor: null,
      preco: null
    };
    this.modoCadastro = true;
    this.cdr.detectChanges();
  }

  aoAtualizar() {
  this.profissionalEditando = null;
  this.modoCadastro = false;
  this.carregarProfissionais();
  }

  carregarProfissionais() {
    this.isLoading = true;
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  this.http.get<any[]>(`${environment.atendimentosApi}api/profissionais/detalhados`, { headers }).subscribe({
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

  excluirProfissional(id: number) {
  if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
  const token = localStorage.getItem('ACCESS_TOKEN');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  this.http.delete(`${environment.atendimentosApi}api/profissionais/${id}`, { headers }).subscribe({
    next: () => {
      this.carregarProfissionais();
    },
    error: (err) => {
      this.mensagemErro = 'Erro ao excluir profissional.';
    }
  });
}
}
