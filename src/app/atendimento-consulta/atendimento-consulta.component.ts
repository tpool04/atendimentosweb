import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AtendimentoService } from '../atendimento-cadastro/atendimento.service';
import { ClienteService } from '../cliente.service';

@Component({
  selector: 'app-atendimento-consulta',
  templateUrl: './atendimento-consulta.component.html',
  styleUrls: ['./atendimento-consulta.component.css']
})
export class AtendimentoConsultaComponent implements OnInit {
  // Retorna true se a data/hora do atendimento for igual ou posterior à data/hora atual
  isFuturaOuHoje(dataHora: string): boolean {
    if (!dataHora) return false;
    const [data, hora] = dataHora.split(' ');
    if (!data || !hora) return false;
    const [dia, mes, ano] = data.split('/').map(Number);
    const [h, m] = hora.split(':').map(Number);
    const dataAtendimento = new Date(ano, mes - 1, dia, h, m);
    const agora = new Date();
    return dataAtendimento >= agora;
  }
  atendimentos: any[] = [];
  mensagem: string = '';

  constructor(private http: HttpClient, private router: Router, private atendimentoService: AtendimentoService,
              private clienteService: ClienteService) { }

  ngOnInit(): void {
    // Garantir que buscamos somente os atendimentos do cliente logado.
    const token = localStorage.getItem('ACCESS_TOKEN');
    const idClienteStr = localStorage.getItem('ID_CLIENTE');
    const idCliente = idClienteStr ? Number(idClienteStr) : undefined;
    if (typeof idCliente === 'number') {
      this.atendimentoService.listarPorCliente(idCliente).subscribe({
        next: (res) => {
          const lista = this.normalizeAtendimentosResponse(res);
          if (lista.length > 0) {
            this.atendimentos = this.sortAtendimentosByDataHoraDesc(lista);
          } else {
            this.atendimentos = [];
            this.mensagem = 'Nenhum atendimento encontrado ou resposta inesperada.';
          }
        },
        error: (err) => {
          console.warn('POST /api/por-cliente falhou, tentando obterAtendimentosDoClienteAutenticado como fallback', { status: err.status, body: err.error });
          // Fallback seguro: tentar o endpoint GET /atendimentos/cliente (usa token para identificar cliente)
          this.clienteService.obterAtendimentosDoClienteAutenticado().subscribe({
            next: (res2) => {
              const lista2 = this.normalizeAtendimentosResponse(res2);
              if (lista2.length > 0) {
                this.atendimentos = this.sortAtendimentosByDataHoraDesc(lista2);
              } else {
                this.atendimentos = [];
                this.mensagem = 'Nenhum atendimento encontrado ou resposta inesperada.';
              }
            },
            error: (err2) => {
              this.mensagem = 'Erro ao buscar atendimentos.';
              console.error('Erro ao buscar atendimentos (fallback obterAtendimentosDoClienteAutenticado):', err2);
            }
          });
        }
      });
    } else {
      // Se não temos ID_CLIENTE, usar endpoint baseado em token (/meus)
      // Usar o endpoint do atendimento-service que retorna os atendimentos do cliente autenticado
      this.clienteService.obterAtendimentosDoClienteAutenticado().subscribe({
        next: (res) => {
          const lista = this.normalizeAtendimentosResponse(res);
          if (lista.length > 0) {
            this.atendimentos = this.sortAtendimentosByDataHoraDesc(lista);
          } else {
            this.atendimentos = [];
            this.mensagem = 'Nenhum atendimento encontrado ou resposta inesperada.';
          }
        },
        error: (err) => {
          this.mensagem = 'Erro ao buscar atendimentos.';
          console.error('Erro ao buscar atendimentos (obterAtendimentosDoClienteAutenticado):', err);
        }
      });
    }
  }

  private normalizeAtendimentosResponse(res: any): any[] {
    // Aceita três formatos comuns:
    // 1) Array de atendimentos -> retorna direto
    // 2) Objeto com chave sendo idCliente e valor array, ex: { "2": [ ... ] } -> retorna o primeiro array encontrado
    // 3) Outro objeto -> retorna []
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (typeof res === 'object') {
      // procurar a primeira propriedade cujo valor seja um array
      for (const key of Object.keys(res)) {
        if (Array.isArray(res[key])) return res[key];
      }
      // às vezes o backend aninha um campo 'data' ou 'result'
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.result)) return res.result;
    }
    return [];
  }

  private sortAtendimentosByDataHoraDesc(lista: any[]): any[] {
    function parseDataHora(str: string): Date {
      if (!str) return new Date(0);
      const [data, hora] = str.split(' ');
      if (!data || !hora) return new Date(0);
      const [dia, mes, ano] = data.split('/').map(Number);
      const [h, m] = hora.split(':').map(Number);
      return new Date(ano, mes - 1, dia, h, m);
    }
    return lista.sort((a, b) => {
      const dataA = parseDataHora(a.dataHora);
      const dataB = parseDataHora(b.dataHora);
      return dataB.getTime() - dataA.getTime();
    });
  }

  alterarAtendimento(a: any): void {
    this.router.navigate(['/editar-atendimento', a.idAtendimento]);
  }

  excluirAtendimento(a: any): void {
    if (!confirm('Tem certeza que deseja excluir este atendimento?')) return;
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  this.http.delete(`${environment.atendimentoService}api/atendimentos/${a.idAtendimento}`, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.atendimentos = this.atendimentos.filter(at => at.idAtendimento !== a.idAtendimento);
      },
      error: (err) => {
        alert('Erro ao excluir atendimento.');
        console.error('Erro ao excluir atendimento:', err);
      }
    });
  }
}
