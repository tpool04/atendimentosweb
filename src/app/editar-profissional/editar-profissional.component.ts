// ...existing code...
// ...existing code...
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-editar-profissional',
  templateUrl: './editar-profissional.component.html',
  styleUrls: ['./editar-profissional.component.css']
})
export class EditarProfissionalComponent implements OnInit {
  @Input() profissional: any;
  @Input() servicosDisponiveis: any[] = [];
  @Input() cadastro = false;
  @Output() atualizado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

// ...existing code...

// ...existing code...

  onServicoChange(event: any, idServico: number) {
    const servicos: number[] = this.form.value.servicos || [];
    if (event.target && event.target.checked) {
      if (!servicos.includes(idServico)) {
        this.form.patchValue({ servicos: [...servicos, idServico] });
      }
      // Inicializa valor ao marcar (se não existir)
      if (this.servicosValores[idServico] === undefined) {
        const servicoObj = this.servicosDisponiveis.find(s => s.idServico === idServico);
        this.servicosValores[idServico] = servicoObj?.valor ?? servicoObj?.preco ?? 0;
      }
    } else {
      this.form.patchValue({ servicos: servicos.filter(id => id !== idServico) });
      // Remove valor do serviço ao desmarcar
      delete this.servicosValores[idServico];
    }
  }

  form: FormGroup;
  mensagemErro = '';
  isLoading = false;
  servicosValores: { [idServico: number]: number } = {};

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      telefone: ['', Validators.required],
      servicos: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('[DEBUG] EditarProfissionalComponent ngOnInit chamado', {
      profissional: this.profissional,
      cadastro: this.cadastro,
      servicosDisponiveis: this.servicosDisponiveis
    });
    if (this.profissional) {
      this.form.patchValue({
        nome: this.profissional.nome,
        telefone: this.profissional.telefone,
        servicos: this.profissional.servicos?.map((s: any) => s.idServico) || []
      });
      // Inicializa valores dos serviços já vinculados (edição)
      if (this.profissional.servicos && this.profissional.servicos.length) {
        for (const s of this.profissional.servicos) {
          this.servicosValores[s.idServico] = s.valor ?? s.preco ?? 0;
        }
      } else if (this.cadastro) {
        // Cadastro: inicializa valores dos serviços disponíveis
        this.servicosValores = {};
        for (const servico of this.servicosDisponiveis) {
          this.servicosValores[servico.idServico] = servico.valor ?? servico.preco ?? 0;
        }
      }
    }
    // Para cadastro: inicializa valores dos serviços marcados
    if (this.cadastro && this.form.value.servicos && this.form.value.servicos.length) {
      for (const id of this.form.value.servicos) {
        if (this.servicosValores[id] === undefined) {
          const servicoObj = this.servicosDisponiveis.find(s => s.idServico === id);
          this.servicosValores[id] = servicoObj?.preco ?? 0;
        }
      }
    }
  }

  getServicoValor(idServico: number): number {
    return this.servicosValores[idServico] ?? 0;
  }

  onServicoValorChange(idServico: number, valor: string) {
    this.servicosValores[idServico] = parseFloat(valor) || 0;
  }

  salvar() {
    if (this.form.invalid) return;
    this.isLoading = true;
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    // Envia array de objetos { idServico, valor }
    const servicos = (this.form.value.servicos as number[]).map(id => {
      let valor = this.servicosValores[id];
      if (valor === undefined) {
        const servicoObj = this.servicosDisponiveis.find(s => s.idServico === id);
        valor = servicoObj?.preco ?? 0;
        this.servicosValores[id] = valor;
      }
      return { idServico: id, valor };
    });
    // Remove formatação do telefone para o backend
    const telefoneSemFormatacao = (this.form.value.telefone || '').replace(/\D/g, '');
    const payload = {
      ...this.form.value,
      telefone: telefoneSemFormatacao,
      servicos
    };
    console.log('Payload enviado ao backend:', payload);
    if (this.cadastro) {
      // Cadastro: POST
  this.http.post(`${environment.atendimentosApi}api/profissionais`, payload, { headers }).subscribe({
        next: (res) => {
          this.isLoading = false;
          const msg = (res as any)?.message;
          if (msg) {
            alert(msg);
          } else {
            alert('Profissional cadastrado com sucesso.');
          }
          this.atualizado.emit();
        },
        error: (err) => {
          console.error('Erro ao cadastrar profissional:', err);
          // Tratamento específico para telefone duplicado
          if (err.error && typeof err.error === 'object') {
            if (JSON.stringify(err.error).includes('duplicate key value') && JSON.stringify(err.error).includes('telefone')) {
              this.mensagemErro = 'Já existe um profissional cadastrado com este telefone.';
              alert(this.mensagemErro);
            } else {
              this.mensagemErro = err.error.message || JSON.stringify(err.error);
            }
          } else if (err.error && typeof err.error === 'string' && err.error.includes('duplicate key value') && err.error.includes('telefone')) {
            this.mensagemErro = 'Já existe um profissional cadastrado com este telefone.';
            alert(this.mensagemErro);
          } else {
            this.mensagemErro = err.error || err.statusText || 'Erro ao cadastrar profissional.';
          }
          this.isLoading = false;
        }
      });
    } else {
      // Edição: PUT
  this.http.put(`${environment.atendimentosApi}api/profissionais/${this.profissional.idProfissional}`, payload, { headers }).subscribe({
        next: (res) => {
          this.isLoading = false;
          const msg = (res as any)?.message;
          if (msg) {
            alert(msg);
          } else {
            alert('Profissional atualizado com sucesso.');
          }
          this.atualizado.emit();
        },
        error: (err) => {
          // Log detalhado para depuração
          console.error('Erro ao salvar profissional:', err);
          if (err.error && typeof err.error === 'object') {
            this.mensagemErro = err.error.message || JSON.stringify(err.error);
          } else {
            this.mensagemErro = err.error || err.statusText || 'Erro ao atualizar profissional.';
          }
          this.isLoading = false;
        }
      });
    }
  }
}
