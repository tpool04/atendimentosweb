import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-listar-clientes-atendimentos',
  templateUrl: './listar-clientes-atendimentos.component.html',
  styleUrls: ['./listar-clientes-atendimentos.component.css']
})
export class ListarClientesAtendimentosComponent implements OnInit {
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  filtroData: string = '';
  filtroProfissional: string = '';
  filtroServico: string = '';
  mensagem: string = '';
  profissionaisUnicos: string[] = [];
  profissionaisTodos: string[] = [];
  servicosTodos: any[] = [];
  perfil: string | null = null;

  constructor(private http: HttpClient) {}

  atualizarListaProfissionais(): void {
    const profissionaisSet = new Set<string>();
    this.clientesFiltrados.forEach(cliente => {
      (cliente.atendimentos || []).forEach((atendimento: any) => {
        if (atendimento.nomeProfissional) {
          profissionaisSet.add(atendimento.nomeProfissional);
        }
      });
    });
    this.profissionaisUnicos = Array.from(profissionaisSet).sort();
  }

  ngOnInit(): void {
    this.perfil = localStorage.getItem('PERFIL');
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    // Busca todos os serviços cadastrados
    this.http.get<any[]>(`${environment.atendimentosApi}api/servicos/all`, { headers }).subscribe({
      next: (servicos) => {
        this.servicosTodos = servicos;
        // Busca todos os atendimentos/clientes
        this.http.get<any[]>(`${environment.atendimentosApi}api/clientes/atendimentos-clientes`, { headers }).subscribe({
          next: (res) => {
            this.clientes = res;
            this.clientesFiltrados = res;
            this.profissionaisTodos = Array.from(new Set(res.flatMap(cliente => (cliente.atendimentos || []).map((a: any) => a.nomeProfissional)))).sort();
            this.atualizarListaProfissionais();
          },
          error: (err) => {
            this.mensagem = 'Erro ao buscar clientes e atendimentos.';
            console.error('Erro:', err);
          }
        });
      },
      error: () => {
        this.servicosTodos = [];
      }
    });
  }

  filtrarPorData(): void {
    if (!this.filtroData) {
      // Volta para mostrar apenas atendimentos de hoje em diante
      const hoje = new Date().toISOString().split('T')[0];
      this.clientesFiltrados = this.clientes.map(cliente => {
        const atendimentosFiltrados = (cliente.atendimentos || []).filter((atendimento: any) => {
          const dataAtendimento = atendimento.dataHora?.split(' ')[0];
          return dataAtendimento >= hoje;
        });
        return { ...cliente, atendimentos: atendimentosFiltrados };
      }).filter(cliente => cliente.atendimentos.length > 0);
      this.atualizarListaProfissionais();
      return;
    }
    // Filtro por data específica
    this.clientesFiltrados = this.clientes.map(cliente => {
      const atendimentosFiltrados = (cliente.atendimentos || []).filter((atendimento: any) => {
        const dataAtendimento = atendimento.dataHora?.split(' ')[0];
        return dataAtendimento === this.filtroData;
      });
      return { ...cliente, atendimentos: atendimentosFiltrados };
    }).filter(cliente => cliente.atendimentos.length > 0);
    this.atualizarListaProfissionais();
  }

  filtrarPorProfissional(): void {
    if (!this.filtroProfissional) {
      this.filtrarPorData();
      return;
    }
    // Aplica filtro de profissional sobre o resultado do filtro de data
    this.clientesFiltrados = this.clientesFiltrados.map(cliente => {
      const atendimentosFiltrados = (cliente.atendimentos || []).filter((atendimento: any) => {
        return atendimento.nomeProfissional?.toLowerCase().includes(this.filtroProfissional.toLowerCase());
      });
      return { ...cliente, atendimentos: atendimentosFiltrados };
    }).filter(cliente => cliente.atendimentos.length > 0);
    this.atualizarListaProfissionais();
  }

  filtrarPorServico(): void {
    if (!this.filtroServico) {
      this.filtrarPorProfissional();
      return;
    }
    // Aplica filtro de serviço sobre o resultado do filtro de profissional
    this.clientesFiltrados = this.clientesFiltrados.map(cliente => {
      const atendimentosFiltrados = (cliente.atendimentos || []).filter((atendimento: any) => {
        return atendimento.nomeServico === this.filtroServico;
      });
      return { ...cliente, atendimentos: atendimentosFiltrados };
    }).filter(cliente => cliente.atendimentos.length > 0);
  }

  exportarParaExcel(): void {
    const dados: any[] = [];
    
    // Preparar dados para exportação
    this.clientesFiltrados.forEach(cliente => {
      (cliente.atendimentos || []).forEach((atendimento: any) => {
        dados.push({
          'Cliente': cliente.cliente.nome,
          'CPF': cliente.cliente.cpf,
          'Email': cliente.cliente.email,
          'Telefone': cliente.cliente.telefone,
          'Data/Hora': atendimento.dataHora,
          'Serviço': atendimento.nomeServico,
          'Valor': `R$ ${atendimento.valorServico}`,
          'Profissional': atendimento.nomeProfissional,
          'Telefone Profissional': atendimento.telefoneProfissional,
          'Observações': atendimento.observacoes || ''
        });
      });
    });

    if (dados.length === 0) {
      this.mensagem = 'Nenhum dado para exportar.';
      return;
    }

    // Acessar XLSX via window
    const XLSX = (window as any).XLSX;
    
    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes e Atendimentos');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 20 },  // Cliente
      { wch: 15 },  // CPF
      { wch: 25 },  // Email
      { wch: 15 },  // Telefone
      { wch: 18 },  // Data/Hora
      { wch: 20 },  // Serviço
      { wch: 12 },  // Valor
      { wch: 20 },  // Profissional
      { wch: 18 },  // Telefone Profissional
      { wch: 30 }   // Observações
    ];
    ws['!cols'] = colWidths;

    // Download do arquivo
    const nomeArquivo = `clientes-atendimentos-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  }

  isAdmin(): boolean {
    return this.perfil === 'ADMIN';
  }

  finalizarAtendimento(atendimento: any): void {
    if (!this.isAdmin()) {
      return;
    }

    if (atendimento.status?.toUpperCase() === 'FINALIZADO') {
      return;
    }

    if (!confirm('Tem certeza que deseja finalizar este atendimento?')) {
      return;
    }

    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put(
      `${environment.atendimentosApi}api/atendimentos/${atendimento.idAtendimento}/finalizar`,
      {},
      { headers, responseType: 'text' }
    ).subscribe({
      next: () => {
        atendimento.status = 'FINALIZADO';
      },
      error: (err) => {
        this.mensagem = err?.error || 'Erro ao finalizar atendimento.';
      }
    });
  }
}
