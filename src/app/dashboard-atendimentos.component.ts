import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-dashboard-atendimentos',
  templateUrl: './dashboard-atendimentos.component.html',
  styleUrls: ['./dashboard-atendimentos.component.css']
})
export class DashboardAtendimentosComponent implements OnInit, AfterViewChecked {
  @ViewChild('graficoLinha') graficoLinhaRef!: ElementRef<HTMLCanvasElement>;

  analytics: Array<{ profissionalId: number; profissionalNome: string; totalAtendimentos: number }> = [];
  mensagem: string = '';
  carregando = false;
  perfil: string | null = null;
  private graficoInstancia: any = null;
  private graficoPendente = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.perfil = localStorage.getItem('PERFIL');

    if (this.perfil !== 'ADMIN') {
      this.router.navigate(['/consultar-atendimentos']);
      return;
    }

    this.carregarDashboard();
  }

  ngAfterViewChecked(): void {
    if (this.graficoPendente && this.graficoLinhaRef) {
      this.graficoPendente = false;
      this.renderizarGrafico();
    }
  }

  carregarDashboard(): void {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.carregando = true;
    this.mensagem = '';

    if (this.graficoInstancia) {
      this.graficoInstancia.destroy();
      this.graficoInstancia = null;
    }

    this.http.get<any[]>(`${environment.atendimentosApi}analytics/dashboard`, { headers }).subscribe({
      next: (res) => {
        this.analytics = Array.isArray(res)
          ? res.map((item: any) => ({
              profissionalId: Number(item.profissionalId) || 0,
              profissionalNome: item.profissionalNome || 'Profissional',
              totalAtendimentos: Number(item.totalAtendimentos) || 0
            }))
          : [];

        this.analytics.sort((a, b) => b.totalAtendimentos - a.totalAtendimentos);

        if (this.analytics.length === 0) {
          this.mensagem = 'Nenhum dado encontrado para o dashboard.';
        }
        this.carregando = false;
        this.graficoPendente = true;
      },
      error: (err) => {
        this.mensagem = 'Erro ao carregar dashboard.';
        this.carregando = false;
        console.error('Erro ao carregar dashboard:', err);
      }
    });
  }

  private renderizarGrafico(): void {
    const Chart = (window as any).Chart;
    if (!Chart || !this.graficoLinhaRef) return;

    const ctx = this.graficoLinhaRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.graficoInstancia) {
      this.graficoInstancia.destroy();
    }

    const labels = this.analytics.map(a => a.profissionalNome);
    const dados = this.analytics.map(a => a.totalAtendimentos);

    this.graficoInstancia = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total de Atendimentos',
          data: dados,
          fill: true,
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          borderColor: '#0ea5e9',
          pointBackgroundColor: '#0369a1',
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            title: { display: true, text: 'Atendimentos' }
          },
          x: {
            title: { display: true, text: 'Profissional' }
          }
        }
      }
    });
  }

  get totalGeralAtendimentos(): number {
    return this.analytics.reduce((acc, item) => acc + item.totalAtendimentos, 0);
  }
}