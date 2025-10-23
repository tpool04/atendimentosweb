import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-listar-clientes',
  templateUrl: './listar-clientes.component.html',
  styleUrls: ['./listar-clientes.component.css']
})
export class ListarClientesComponent implements OnInit {
  clientes: any[] = [];
  mensagemErro: string = '';
  perfil: string | null = null;
  sortField: string = 'nome';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.perfil = localStorage.getItem('PERFIL');
    if (this.perfil !== 'ADMIN') {
      // Redireciona se não for admin
      // (comportamento semelhante ao listar-servicos)
      window.location.href = '/acessar-conta';
      return;
    }
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>(`${environment.clienteService}api/clientes/listar-clientes`, { headers }).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.clientes = res;
          this.sortClientes();
        } else {
          this.mensagemErro = 'Resposta inesperada ao listar clientes.';
        }
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao buscar clientes.';
        console.error('Erro ao listar clientes:', err);
      }
    });
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.sortClientes();
  }

  private sortClientes() {
    const field = this.sortField;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    this.clientes.sort((a: any, b: any) => {
      const va = (a[field] || '') + '';
      const vb = (b[field] || '') + '';
      return va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' }) * dir;
    });
  }

  excluirCliente(cliente: any) {
    if (!confirm(`Confirma exclusão do cliente ${cliente.nome || cliente.idCliente || cliente.id}?`)) return;
    const id = cliente.idCliente || cliente.id;
    if (!id) {
      alert('ID do cliente não encontrado.');
      return;
    }
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.delete(`${environment.clienteService}api/clientes/${id}`, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(c => (c.idCliente || c.id) !== id);
      },
      error: (err) => {
        console.error('Erro ao excluir cliente:', err);
        alert('Erro ao excluir cliente. Veja console para detalhes.');
      }
    });
  }
}
