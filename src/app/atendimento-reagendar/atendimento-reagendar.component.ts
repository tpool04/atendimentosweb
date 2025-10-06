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
  voltarParaConsulta() {
    this.router.navigate(['/consultar-atendimentos']);
  }
  servicos: any[] = [];
  profissionais: any[] = [];
  todosProfissionais: any[] = [];

  private formatarDataHora(iso: string): string {
    if (!iso) return '';
    const [date, time] = iso.split('T');
    const [ano, mes, dia] = date.split('-');
    return `${dia}/${mes}/${ano} ${time?.slice(0,5)}`;
  }
  form: FormGroup;
  mensagem: string = '';
  idAtendimento: number;

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
    this.idAtendimento = 0;
  }

  ngOnInit(): void {
    this.idAtendimento = Number(this.route.snapshot.paramMap.get('id'));
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Buscar serviços e todos profissionais juntos
  this.http.get<any[]>(`${environment.atendimentosApi}api/servicos`, { headers }).subscribe({
      next: (servicos) => {
        console.log('Serviços carregados (antes do filtro):', servicos);
        const servicosValidos = servicos.filter(s => s && s.idServico);
        console.log('Serviços válidos (após filtro):', servicosValidos);
        this.servicos = servicosValidos;
        // Buscar dados do atendimento só depois dos serviços carregados
  this.http.get<any>(`${environment.atendimentosApi}api/atendimentos/${this.idAtendimento}`, { headers }).subscribe({
          next: (atendimento) => {
            // Converter dataHora para formato datetime-local
            let dataHoraInput = '';
            if (atendimento.dataHora) {
              const [data, hora] = atendimento.dataHora.split(' ');
              if (data && hora) {
                const [dia, mes, ano] = data.split('/');
                dataHoraInput = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora}`;
              }
            }
            // Buscar idServico pelo nome
            const idServico = this.servicos.find(s => s.nome === atendimento.nomeServico)?.idServico?.toString() || '';
            this.form.patchValue({
              dataHora: dataHoraInput,
              observacoes: atendimento.observacoes || '',
              idServico: idServico
            });
            // Só buscar profissionais e setar profissional depois
            if (idServico) {
              this.http.get<any[]>(`${environment.atendimentosApi}api/profissionais?servico=${idServico}`, { headers }).subscribe({
                next: (res) => {
                  this.profissionais = res;
                  console.log('[DEBUG] Nome profissional do atendimento:', atendimento.nomeProfissional);
                  console.log('[DEBUG] Profissionais retornados:', res);
                  // Buscar idProfissional pelo nome exatamente como veio do backend
                  const idProfissional = res.find(p => p.nome === atendimento.nomeProfissional)?.idProfissional?.toString() || '';
                  console.log('[DEBUG] idProfissional encontrado:', idProfissional);
                  setTimeout(() => {
                    this.form.patchValue({
                      idProfissional: idProfissional
                    });
                  }, 0);
                },
                error: () => {
                  this.profissionais = [];
                }
              });
            }
          },
          error: (err) => {
            this.mensagem = 'Erro ao buscar dados do atendimento.';
            console.error('Erro ao buscar dados do atendimento:', err);
          }
        });
      },
      error: (err) => {
        this.mensagem = 'Erro ao buscar serviços.';
        console.error('Erro ao buscar serviços:', err);
      }
    });

    // Atualizar profissionais ao trocar serviço
    this.form.get('idServico')?.valueChanges.subscribe(idServico => {
  this.profissionais = [];
  this.form.get('idProfissional')?.setValue('');
  console.log('idServico selecionado (valueChanges):', idServico);
  if (!idServico || idServico === 'undefined') return;
      this.profissionais = [];
      this.form.get('idProfissional')?.setValue('');
      if (!idServico) return;
  this.http.get<any[]>(`${environment.atendimentosApi}api/profissionais?servico=${idServico}`, { headers }).subscribe({
        next: (res) => {
          console.log('Profissionais retornados da API:', res);
          this.profissionais = res;
        },
        error: (err) => {
          this.mensagem = 'Erro ao buscar profissionais do serviço.';
          this.profissionais = [];
          console.error('Erro ao buscar profissionais do serviço:', err);
        }
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const token = localStorage.getItem('ACCESS_TOKEN');
    console.log('Token JWT usado no reagendamento:', token);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const body = {
      idServico: Number(this.form.value.idServico),
      idProfissional: Number(this.form.value.idProfissional),
      novaDataHora: this.formatarDataHora(this.form.value.dataHora),
      novaObservacao: this.form.value.observacoes
    };
    console.log('Body enviado no reagendamento:', body);
  this.http.put(`${environment.atendimentosApi}api/atendimentos/${this.idAtendimento}/reagendar`, body, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.mensagem = 'Atendimento reagendado com sucesso!';
        setTimeout(() => {
          this.router.navigate(['/consultar-atendimentos']);
        }, 1200);
      },
      error: (err) => {
        let erroDetalhe = err?.error?.mensagem || err?.message || JSON.stringify(err);
        this.mensagem = 'Erro ao reagendar atendimento.' + (erroDetalhe ? ' Detalhe: ' + erroDetalhe : '');
        alert(this.mensagem);
        console.error('Erro ao reagendar atendimento:', err);
      }
    });
  }
}
