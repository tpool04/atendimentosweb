import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
 
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
 
  mensagem_sucesso: string = '';
  mensagem_erro: string = '';
 
  constructor(
    private httpClient: HttpClient
  ) { }
 
  formCadastro = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    cpf: new FormControl('', [Validators.required]),
    telefone: new FormControl('', [Validators.required]),
    senha: new FormControl('', [Validators.required]),
    senhaConfirmacao: new FormControl('', [Validators.required]),
    cep: new FormControl('', [Validators.required]),
    logradouro: new FormControl('', [Validators.required]),
    numero: new FormControl('', [Validators.required]),
    complemento: new FormControl('', [Validators.required]),
    bairro: new FormControl('', [Validators.required]),
    cidade: new FormControl('', [Validators.required]),
    uf: new FormControl('', [Validators.required]),
  });
 
  get form(): any {
    return this.formCadastro.controls;
  }
 
  ngOnInit(): void {
  }
 
  onKeyUp(event: any) {
    const cep = (event.target as HTMLInputElement).value;
    if (cep.length == 9) {
      this.httpClient.get(environment.viaCep + "ws/" + cep + "/json/")
        .subscribe(
          (result: any) => {
            this.formCadastro.controls['logradouro'].setValue(result.logradouro);
            this.formCadastro.controls['bairro'].setValue(result.bairro);
            this.formCadastro.controls['cidade'].setValue(result.localidade);
            this.formCadastro.controls['uf'].setValue(result.uf);
          }
        )
    }
    else {
      this.formCadastro.controls['logradouro'].setValue('');
      this.formCadastro.controls['bairro'].setValue('');
      this.formCadastro.controls['cidade'].setValue('');
      this.formCadastro.controls['uf'].setValue('');
    }
  }
 
  onSubmit() {
 
    this.mensagem_sucesso = '';
    this.mensagem_erro = '';
 
    this.httpClient.post(environment.atendimentosApi + "api/criar-conta",
      this.formCadastro.value, { responseType: 'text' })
      .subscribe({
        next: (result) => {
          this.mensagem_sucesso = result;
          this.formCadastro.reset();
        },
        error: (e) => {
          this.mensagem_erro = e.error;
        }
      })
  }
}
