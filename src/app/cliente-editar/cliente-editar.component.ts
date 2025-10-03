import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cliente-editar',
  templateUrl: './cliente-editar.component.html'
})
export class ClienteEditarComponent implements OnInit {
  buscarEnderecoPorCep(event: any): void {
    const rawCep = (event.target as HTMLInputElement).value;
    const cep = rawCep.replace(/\D/g, '');
    if (rawCep.length === 9) {
      this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
        next: (res) => {
          if (res.erro) {
            this.mensagem = 'CEP não encontrado.';
            this.form.patchValue({
              logradouro: '',
              bairro: '',
              cidade: '',
              uf: ''
            });
            return;
          }
          this.form.patchValue({
            logradouro: res.logradouro,
            bairro: res.bairro,
            cidade: res.localidade,
            uf: res.uf
          });
        },
        error: () => {
          this.mensagem = 'Erro ao buscar endereço pelo CEP.';
          this.form.patchValue({
            logradouro: '',
            bairro: '',
            cidade: '',
            uf: ''
          });
        }
      });
    } else {
      this.form.patchValue({
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: ''
      });
    }
  }
  form: FormGroup;
  mensagem: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', Validators.required],
      cep: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  this.http.get<any>(`${environment.atendimentosApi}api/clientes/me`, { headers }).subscribe({
      next: (res) => {
        let cep = res.endereco.cep || '';
        // Formatar para 12345-678 se vier como 12345678
        if (cep.length === 8 && cep.indexOf('-') === -1) {
          cep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        this.form.patchValue({
          nome: res.cliente.nome,
          cpf: res.cliente.cpf,
          email: res.cliente.email,
          telefone: res.cliente.telefone,
          logradouro: res.endereco.logradouro,
          numero: res.endereco.numero,
          complemento: res.endereco.complemento,
          bairro: res.endereco.bairro,
          cidade: res.endereco.cidade,
          uf: res.endereco.uf,
          cep: cep
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
  const token = localStorage.getItem('ACCESS_TOKEN');
  console.log('Token JWT usado na atualização:', token);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const body = {
      nome: this.form.value.nome,
      cpf: this.form.value.cpf,
      email: this.form.value.email,
      telefone: this.form.value.telefone,
      logradouro: this.form.value.logradouro,
      numero: this.form.value.numero,
      complemento: this.form.value.complemento,
      bairro: this.form.value.bairro,
      cidade: this.form.value.cidade,
      uf: this.form.value.uf,
      cep: this.form.value.cep
    };
  console.log('Body enviado na atualização:', body);
  this.http.put(`${environment.atendimentosApi}api/clientes/me`, body, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.mensagem = 'Dados atualizados com sucesso!';
        setTimeout(() => {
          this.router.navigate(['/consulta-cadastro']);
        }, 1200);
      },
      error: (err) => {
        console.error('Erro ao atualizar dados:', err);
        if (err && err.error && err.error.message) {
          this.mensagem = 'Erro ao atualizar dados: ' + err.error.message;
        } else if (err && err.status) {
          this.mensagem = `Erro ao atualizar dados (status ${err.status})`;
        } else {
          this.mensagem = 'Erro ao atualizar dados.';
        }
      }
    });
  }
}
