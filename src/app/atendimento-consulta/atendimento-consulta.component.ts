import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
  perfil: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.perfil = localStorage.getItem('PERFIL');
    this.carregarAtendimentos();
  }

  carregarAtendimentos(): void {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any[]>(`${environment.atendimentosApi}api/atendimentos/cliente`, { headers }).subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length > 0) {
          console.log('[DEBUG] Exemplo de atendimento:', JSON.stringify(res[0]));
        }
        if (Array.isArray(res)) {
          // Ordenar por data do serviço (assumindo campo dataHora ou similar)
          function parseDataHora(str: string): Date {
            if (!str) return new Date(0);
            // Esperado: 'dd/MM/yyyy HH:mm'
            const [data, hora] = str.split(' ');
            if (!data || !hora) return new Date(0);
            const [dia, mes, ano] = data.split('/').map(Number);
            const [h, m] = hora.split(':').map(Number);
            return new Date(ano, mes - 1, dia, h, m);
          }
          this.atendimentos = res.sort((a, b) => {
            const dataA = parseDataHora(a.dataHora);
            const dataB = parseDataHora(b.dataHora);
            return dataB.getTime() - dataA.getTime(); // ordem decrescente
          });
        } else {
          this.atendimentos = [];
          this.mensagem = 'Nenhum atendimento encontrado ou resposta inesperada.';
        }
      },
      error: (err) => {
        this.mensagem = 'Erro ao buscar atendimentos.';
        console.error('Erro ao buscar atendimentos:', err);
      }
    });
  }

  isAdmin(): boolean {
    return this.perfil === 'ADMIN';
  }

  alterarAtendimento(a: any): void {
    this.router.navigate(['/editar-atendimento', a.idAtendimento]);
  }

  excluirAtendimento(a: any): void {
    if (!confirm('Tem certeza que deseja excluir este atendimento?')) return;
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.delete(`${environment.atendimentosApi}api/atendimentos/${a.idAtendimento}`, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.atendimentos = this.atendimentos.filter(at => at.idAtendimento !== a.idAtendimento);
      },
      error: (err) => {
        alert('Erro ao excluir atendimento.');
        console.error('Erro ao excluir atendimento:', err);
      }
    });
  }

  finalizarAtendimento(a: any): void {
    if (!this.isAdmin()) {
      return;
    }

    if (a.status?.toUpperCase() === 'FINALIZADO') {
      alert('Este atendimento ja esta finalizado.');
      return;
    }

    if (!confirm('Tem certeza que deseja finalizar este atendimento?')) return;

    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put(
      `${environment.atendimentosApi}api/atendimentos/${a.idAtendimento}/finalizar`,
      {},
      { headers, responseType: 'text' }
    ).subscribe({
      next: () => {
        a.status = 'FINALIZADO';
        alert('Atendimento finalizado com sucesso.');
      },
      error: (err) => {
        alert('Erro ao finalizar atendimento.');
        console.error('Erro ao finalizar atendimento:', err);
      }
    });
  }
}
