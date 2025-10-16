import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-atendimento-reagendar',
  templateUrl: './atendimento-reagendar.component.html',
  styleUrls: ['./atendimento-reagendar.component.css']
})
export class AtendimentoReagendarComponent implements OnInit {
  servicos: any[] = [];
  profissionais: any[] = [];
  todosProfissionais: any[] = [];
  form: FormGroup;
  mensagem: string = '';
  idAtendimento: number = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      idServico: ['', Validators.required],
      idProfissional: ['', Validators.required],
      dataHora: ['', Validators.required],
      observacoes: ['']
    });
  }

  voltarParaConsulta(): void {
    this.router.navigate(['/consultar-atendimentos']);
  }

  private formatarDataHora(iso: string): string {
    if (!iso) return '';
    const [date, time] = iso.split('T');
    const [ano, mes, dia] = date.split('-');
    return `${dia}/${mes}/${ano} ${time?.slice(0,5)}`;
  }

  ngOnInit(): void {
    // Carregar serviços e profissionais antes de buscar atendimento
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    // Supondo que existam endpoints para listar serviços e profissionais
    Promise.all([
      this.http.get<any[]>(`${environment.atendimentoService}api/servicos`, { headers }).toPromise(),
      this.http.get<any[]>(`${environment.atendimentoService}api/profissionais`, { headers }).toPromise()
    ]).then(([servicos, profissionais]) => {
      this.servicos = servicos || [];
      this.todosProfissionais = profissionais || [];
      this.profissionais = profissionais || [];
      this.route.paramMap.subscribe(params => {
        const idAtendimento = params.get('id');
        const idCliente = localStorage.getItem('ID_CLIENTE');
        if (idAtendimento && idCliente) {
          this.idAtendimento = +idAtendimento;
          this.http.get<any>(`${environment.clienteService}api/clientes/${idCliente}/atendimentos/${idAtendimento}`, { headers }).subscribe({
            next: (res) => {
              console.log('Resposta do backend ao buscar atendimento:', res);
              const atendimento = res.atendimento || res;
              // Buscar idServico pelo nomeServico
              let idServico = '';
              let profissionaisFiltrados: any[] = [];
              if (atendimento.nomeServico && this.servicos.length > 0) {
                const servicoObj = this.servicos.find(s => s.nome === atendimento.nomeServico);
                if (servicoObj) {
                  idServico = servicoObj.idServico;
                  profissionaisFiltrados = servicoObj.profissionais || [];
                }
              }
              // Buscar idProfissional pelo nomeProfissional, mas só setar se existir na lista filtrada
              let idProfissional = '';
              if (atendimento.nomeProfissional && profissionaisFiltrados.length > 0) {
                const profissionalObj = profissionaisFiltrados.find(p => p.nome === atendimento.nomeProfissional);
                if (profissionalObj) {
                  idProfissional = profissionalObj.idProfissional;
                }
              }
              // Converter dataHora para yyyy-MM-ddTHH:mm
              let dataHoraFormatada = '';
              if (atendimento.dataHora) {
                const [data, hora] = atendimento.dataHora.split(' ');
                const [dia, mes, ano] = data.split('/');
                dataHoraFormatada = `${ano}-${mes}-${dia}T${hora}`;
              }
              this.profissionais = profissionaisFiltrados;
              this.form.patchValue({
                idServico: idServico,
                idProfissional: idProfissional,
                dataHora: dataHoraFormatada,
                observacoes: atendimento.observacoes || ''
              });
            },
            error: (err) => {
              this.mensagem = 'Erro ao carregar atendimento para edição.';
              console.error('Erro ao buscar atendimento:', err);
            }
          });
        }
      });
    });
  }

  onTipoServicoChange(): void {
    const idServico = Number(this.form.value.idServico);
    if (!isNaN(idServico) && idServico > 0) {
      const servicoSelecionado = this.servicos.find(s => s.idServico === idServico);
      this.profissionais = servicoSelecionado ? servicoSelecionado.profissionais : [];
      this.form.patchValue({ idProfissional: '' });
    } else {
      this.profissionais = [];
      this.form.patchValue({ idProfissional: '' });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const [data, hora] = this.form.value.dataHora.split('T');
    const body = {
      idServico: Number(this.form.value.idServico),
      idProfissional: Number(this.form.value.idProfissional),
      data: data.split('-').reverse().join('/'), // "dd/MM/yyyy"
      hora: hora,
      novaObservacao: (this.form.value.observacoes ?? '').toString()
    };
    this.http.put(`${environment.atendimentoService}api/atendimentos/reagendar/${this.idAtendimento}`, body, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.mensagem = 'Atendimento reagendado com sucesso!';
        setTimeout(() => { this.router.navigate(['/consultar-atendimentos']); }, 1200);
      },
      error: (err: any) => {
        let erroDetalhe = '';
        if (err?.error) {
          if (typeof err.error === 'string') {
            erroDetalhe = err.error;
          } else if (err.error.mensagem) {
            erroDetalhe = err.error.mensagem;
          } else {
            erroDetalhe = JSON.stringify(err.error);
          }
        } else {
          erroDetalhe = err?.message || JSON.stringify(err);
        }
        this.mensagem = 'Erro ao reagendar atendimento.' + (erroDetalhe ? ' Detalhe: ' + erroDetalhe : '');
        alert(this.mensagem);
        console.error('Erro ao reagendar atendimento:', err);
      }
    });
  }
}
