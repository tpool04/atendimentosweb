import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  perfil: string | null = null;
  title = 'atendimentosweb';
  nomeCliente: string | null = null;
  isLogado: boolean = false;

  constructor(private router: Router, public authService: AuthService) {
    this.nomeCliente = localStorage.getItem('NOME_CLIENTE');
    this.perfil = localStorage.getItem('PERFIL');
    this.isLogado = !!localStorage.getItem('ACCESS_TOKEN');
    console.log('[AppComponent] Inicialização: isLogado =', this.isLogado, 'nomeCliente =', this.nomeCliente, 'perfil =', this.perfil);
    this.authService.logado$.subscribe((logado) => {
      this.isLogado = logado;
      this.nomeCliente = localStorage.getItem('NOME_CLIENTE');
      this.perfil = localStorage.getItem('PERFIL');
      console.log('[AppComponent] AuthService mudou: isLogado =', this.isLogado, 'nomeCliente =', this.nomeCliente, 'perfil =', this.perfil);
    });
  }

  ngOnInit(): void {}

  logoff(): void {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('NOME_CLIENTE');
  localStorage.removeItem('PERFIL');
  this.authService.setLogado(false);
  console.log('[AppComponent] Logoff executado. isLogado =', this.isLogado);
  this.router.navigate(['/acessar-conta']);
  }
}
