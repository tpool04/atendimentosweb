import { Component, OnInit } from '@angular/core';
import { ServicoService, ServicoCreateRequest, ServicoGetResponse } from '../servico.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-listar-servicos',
  templateUrl: './listar-servicos.component.html',
  styleUrls: ['./listar-servicos.component.css']
})
export class ListarServicosComponent implements OnInit {
  excluirServico(id: number) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    this.servicoService.deleteServico(id).subscribe({
      next: () => {
        this.servicos = this.servicos.filter(s => s.idServico !== id);
      },
      error: (err) => {
        if (err.status === 409) {
          this.mensagemErro = 'Não é possível excluir: possui atendimentos futuros.';
        } else if (err.status === 404) {
          this.mensagemErro = 'Serviço não encontrado.';
        } else {
          this.mensagemErro = 'Erro ao excluir serviço!';
        }
      }
    });
  }
  mostrarModalCadastro: boolean = false;
  cadastroNome: string = '';
  cadastroValor: number | null = null;
  mensagemErroCadastro: string = '';
  onCadastrarServico() {
    if (!this.cadastroNome || this.cadastroValor == null) {
      this.mensagemErroCadastro = 'Preencha todos os campos.';
      return;
    }
    this.mensagemErroCadastro = '';
    const request: ServicoCreateRequest = {
      nome: this.cadastroNome,
      valor: this.cadastroValor
    };
    this.criarServico(request);
    this.mostrarModalCadastro = false;
    this.cadastroNome = '';
    this.cadastroValor = null;
  }
  servicoEditando: any = null;
  novoNome: string = '';
  novoValor: number | null = null;
  mensagemErro: string = '';
  servicos: any[] = [];
  perfil: string | null = null;

  constructor(private http: HttpClient, private router: Router, private servicoService: ServicoService) {}
  criarServico(request: ServicoCreateRequest) {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = { Authorization: `Bearer ${token}` };
    this.servicoService.createServico(request).subscribe({
      next: (response) => {
        this.servicos.push(response);
        // Se quiser fechar modal ou limpar campos, faça aqui
      },
      error: () => {
        this.mensagemErro = 'Erro ao cadastrar serviço!';
      }
    });
  }

  ngOnInit(): void {
    this.perfil = localStorage.getItem('PERFIL');
    if (this.perfil !== 'ADMIN') {
      this.router.navigate(['/acessar-conta']);
      return;
    }
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  this.http.get<any[]>(`${environment.atendimentosApi}api/servicos/all`, { headers }).subscribe({
      next: (res) => this.servicos = res,
      error: () => this.servicos = []
    });
  }

  abrirModalEditar(servico: any) {
    this.servicoEditando = servico;
    this.novoNome = servico.nome;
    this.novoValor = servico.valor;
    this.mensagemErro = '';
  }

  fecharModalEditar() {
    this.servicoEditando = null;
    this.novoNome = '';
    this.novoValor = null;
    this.mensagemErro = '';
  }

  salvarEdicao() {
    if (!this.novoNome || this.novoValor == null) {
      this.mensagemErro = 'Preencha todos os campos.';
      return;
    }
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = { Authorization: `Bearer ${token}` };
  this.http.put(`${environment.atendimentosApi}api/servicos/${this.servicoEditando.idServico}`, {
      nome: this.novoNome,
      valor: this.novoValor
    }, { headers }).subscribe({
      next: () => {
        this.fecharModalEditar();
        this.ngOnInit();
      },
      error: () => {
        this.mensagemErro = 'Erro ao editar serviço!';
      }
    });
  }
}
