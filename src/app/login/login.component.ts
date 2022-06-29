import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
 
  mensagem_erro: string = '';
 
  constructor(
    private httpClient: HttpClient
  ) { }
 
  formLogin = new FormGroup({
    cpf: new FormControl('', [Validators.required]),
    senha: new FormControl('', [Validators.required]),
  });
 
  get form(): any {
    return this.formLogin.controls;
  }
 
  ngOnInit(): void {
  }
 
  onSubmit(): void {
    this.httpClient.post(environment.atendimentosApi + "api/acessar-conta",
      this.formLogin.value, { responseType: 'text' })
      .subscribe({
        next: (result) => {
          //salvando o TOKEN obtido
          localStorage.setItem("ACCESS_TOKEN", result);
          //redirecionar o usuário para a página de consulta de atendimentos
          window.location.href = "/consultar-atendimentos";
        },
        error: (e) => {
          this.mensagem_erro = e.error;
        }
      })
  }
 
}
