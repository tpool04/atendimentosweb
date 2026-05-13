import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { environment } from '../environments/environment';

interface ClienteServicoAnalytics {
  clienteId: number;
  clienteNome: string;
  servicoId: number;
  servicoTipo: string;
  dataAtendimento?: string | null;
  totalExecutado: number;
}

@Component({
  selector: 'app-dashboard-clientes',
  templateUrl: './dashboard-clientes.component.html',
  styleUrls: ['./dashboard-clientes.component.css']
})
export class DashboardClientesComponent implements OnInit, AfterViewChecked {
  @ViewChild('graficoServicos') graficoServicosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoPizzaServicos') graficoPizzaServicosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoLinhaDatas') graficoLinhaDatasRef!: ElementRef<HTMLCanvasElement>;

  analytics: ClienteServicoAnalytics[] = [];
  rankingServicos: Array<{ servicoTipo: string; totalExecutado: number }> = [];
  rankingClientes: Array<{ clienteId: number; clienteNome: string; totalExecutado: number }> = [];
  rankingDatas: Array<{ data: string; total: number }> = [];
  mensagem = '';
  carregando = false;
  perfil: string | null = null;

  private graficoBarrasInstancia: any = null;
  private graficoPizzaInstancia: any = null;
  private graficoLinhaInstancia: any = null;
  private graficoPendente = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (!token) {
      this.router.navigate(['/acessar-conta']);
      return;
    }

    this.perfil = localStorage.getItem('PERFIL');
    if (this.perfil !== 'ADMIN') {
      this.router.navigate(['/consultar-atendimentos']);
      return;
    }

    this.carregarDashboard();
  }

  ngAfterViewChecked(): void {
    if (this.graficoPendente && this.graficoServicosRef && this.graficoPizzaServicosRef && this.graficoLinhaDatasRef) {
      this.graficoPendente = false;
      this.renderizarGraficos();
    }
  }

  carregarDashboard(): void {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.carregando = true;
    this.mensagem = '';
    this.analytics = [];
    this.rankingServicos = [];
    this.rankingClientes = [];
    this.rankingDatas = [];

    this.destruirGraficos();

    forkJoin({
      analytics: this.http.get<any[]>(`${environment.atendimentosApi}analytics/clientes/servicos`, { headers }),
      atendimentosClientes: this.http.get<any[]>(`${environment.atendimentosApi}api/clientes/atendimentos-clientes`, { headers })
    }).subscribe({
      next: ({ analytics, atendimentosClientes }) => {
        const dadosNormalizados = Array.isArray(analytics)
          ? analytics.map((item: any) => ({
              clienteId: Number(item.clienteId) || 0,
              clienteNome: item.clienteNome || 'Cliente',
              servicoId: Number(item.servicoId) || 0,
              servicoTipo: item.servicoTipo || 'Servico',
              dataAtendimento: item.dataAtendimento || item.dataHora || null,
              totalExecutado: Number(item.totalExecutado) || 0
            }))
          : [];

        this.analytics = dadosNormalizados;
        this.montarRankings();
        const analyticsComData = dadosNormalizados.some((item) => !!item.dataAtendimento);
        const fonteTimeline = analyticsComData
          ? dadosNormalizados
          : (Array.isArray(atendimentosClientes) ? atendimentosClientes : []);
        this.montarTimelineDatas(fonteTimeline);

        if (this.analytics.length === 0) {
          this.mensagem = 'Nenhum dado encontrado para o dashboard de clientes.';
        }

        this.carregando = false;
        this.graficoPendente = true;
      },
      error: (err) => {
        this.mensagem = 'Erro ao carregar dashboard de clientes.';
        this.carregando = false;
        console.error('Erro ao carregar dashboard de clientes:', err);
      }
    });
  }

  private montarRankings(): void {
    const mapaServicos = new Map<string, number>();
    const mapaClientes = new Map<number, { clienteNome: string; totalExecutado: number }>();

    this.analytics.forEach(item => {
      mapaServicos.set(item.servicoTipo, (mapaServicos.get(item.servicoTipo) || 0) + item.totalExecutado);

      const clienteAtual = mapaClientes.get(item.clienteId);
      if (!clienteAtual) {
        mapaClientes.set(item.clienteId, {
          clienteNome: item.clienteNome,
          totalExecutado: item.totalExecutado
        });
      } else {
        mapaClientes.set(item.clienteId, {
          clienteNome: clienteAtual.clienteNome,
          totalExecutado: clienteAtual.totalExecutado + item.totalExecutado
        });
      }
    });

    this.rankingServicos = Array.from(mapaServicos.entries())
      .map(([servicoTipo, totalExecutado]) => ({ servicoTipo, totalExecutado }))
      .sort((a, b) => b.totalExecutado - a.totalExecutado);

    this.rankingClientes = Array.from(mapaClientes.entries())
      .map(([clienteId, dados]) => ({
        clienteId,
        clienteNome: dados.clienteNome,
        totalExecutado: dados.totalExecutado
      }))
      .sort((a, b) => b.totalExecutado - a.totalExecutado);
  }

  private renderizarGraficos(): void {
    const Chart = (window as any).Chart;
    if (!Chart || !this.graficoServicosRef || !this.graficoPizzaServicosRef || !this.graficoLinhaDatasRef || this.rankingServicos.length === 0) {
      return;
    }

    const ctxBarras = this.graficoServicosRef.nativeElement.getContext('2d');
    const ctxPizza = this.graficoPizzaServicosRef.nativeElement.getContext('2d');
    const ctxLinha = this.graficoLinhaDatasRef.nativeElement.getContext('2d');
    if (!ctxBarras || !ctxPizza || !ctxLinha) {
      return;
    }

    this.destruirGraficos();

    const labels = this.rankingServicos.map(item => item.servicoTipo);
    const valores = this.rankingServicos.map(item => item.totalExecutado);
    const coresPizza = [
      '#1d4ed8', '#0ea5e9', '#14b8a6', '#22c55e', '#eab308',
      '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'
    ];

    this.graficoBarrasInstancia = new Chart(ctxBarras, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Total Executado por Servico',
          data: valores,
          backgroundColor: '#1d4ed8',
          borderRadius: 8,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            title: { display: true, text: 'Quantidade' }
          },
          x: {
            title: { display: true, text: 'Servico' }
          }
        }
      }
    });

    this.graficoPizzaInstancia = new Chart(ctxPizza, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Participacao por Servico',
          data: valores,
          backgroundColor: labels.map((_, idx) => coresPizza[idx % coresPizza.length]),
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });

    this.graficoLinhaInstancia = new Chart(ctxLinha, {
      type: 'line',
      data: {
        labels: this.rankingDatas.map(item => item.data),
        datasets: [{
          label: 'Atendimentos por data',
          data: this.rankingDatas.map(item => item.total),
          fill: true,
          backgroundColor: 'rgba(30, 64, 175, 0.16)',
          borderColor: '#1e40af',
          pointBackgroundColor: '#0f172a',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            title: { display: true, text: 'Quantidade de atendimentos' }
          },
          x: {
            title: { display: true, text: 'Data' }
          }
        }
      }
    });
  }

  private montarTimelineDatas(clientesAtendimentos: any[]): void {
    const mapaDatas = new Map<string, number>();

    if (!Array.isArray(clientesAtendimentos)) {
      this.rankingDatas = [];
      return;
    }

    clientesAtendimentos.forEach((item: any) => {
      const dataDireta = this.normalizarDataAtendimento(item?.dataAtendimento || item?.dataHora);
      if (dataDireta) {
        const peso = this.obterTotalExecutado(item);
        mapaDatas.set(dataDireta, (mapaDatas.get(dataDireta) || 0) + peso);
        return;
      }

      const atendimentos = Array.isArray(item?.atendimentos) ? item.atendimentos : [];
      atendimentos.forEach((atendimento: any) => {
        const dataNormalizada = this.normalizarDataAtendimento(atendimento?.dataAtendimento || atendimento?.dataHora);
        if (!dataNormalizada) {
          return;
        }
        const peso = this.obterTotalExecutado(atendimento);
        mapaDatas.set(dataNormalizada, (mapaDatas.get(dataNormalizada) || 0) + peso);
      });
    });

    this.rankingDatas = Array.from(mapaDatas.entries())
      .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
      .map(([data, total]) => ({
        data: this.formatarData(data),
        total
      }));
  }

  private normalizarDataAtendimento(dataHora: string | null | undefined): string | null {
    if (!dataHora || typeof dataHora !== 'string') {
      return null;
    }

    const dataIsoDireta = dataHora.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataIsoDireta)) {
      return dataIsoDireta;
    }

    const primeiraParte = dataHora.split(' ')[0] || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(primeiraParte)) {
      return primeiraParte;
    }

    const dataObj = new Date(dataHora);
    if (Number.isNaN(dataObj.getTime())) {
      return null;
    }

    return dataObj.toISOString().slice(0, 10);
  }

  private formatarData(dataIso: string): string {
    const partes = dataIso.split('-');
    if (partes.length !== 3) {
      return dataIso;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private obterTotalExecutado(item: any): number {
    const valor = Number(item?.totalExecutado);
    return Number.isFinite(valor) && valor > 0 ? valor : 1;
  }

  private destruirGraficos(): void {
    if (this.graficoBarrasInstancia) {
      this.graficoBarrasInstancia.destroy();
      this.graficoBarrasInstancia = null;
    }

    if (this.graficoPizzaInstancia) {
      this.graficoPizzaInstancia.destroy();
      this.graficoPizzaInstancia = null;
    }

    if (this.graficoLinhaInstancia) {
      this.graficoLinhaInstancia.destroy();
      this.graficoLinhaInstancia = null;
    }
  }

  get totalGeralExecutado(): number {
    return this.analytics.reduce((acc, item) => acc + item.totalExecutado, 0);
  }

  get totalServicos(): number {
    return this.rankingServicos.length;
  }

  get totalClientes(): number {
    return this.rankingClientes.length;
  }
}