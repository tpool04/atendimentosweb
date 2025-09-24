import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-login-2fa',
  template: `
    <div *ngIf="show" class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div *ngIf="show" class="modal d-block" tabindex="-1" style="z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação em Duas Etapas</h5>
            <button type="button" class="btn-close" (click)="onClose()"></button>
          </div>
          <div class="modal-body">
            <p class="mb-2">Seu acesso está protegido com autenticação em duas etapas (2FA).</p>
            <p class="mb-2">Abra o aplicativo Google Authenticator no seu celular e digite o código de 6 dígitos gerado para sua conta.</p>
            <label for="codigo2fa"><strong>Código do Google Authenticator:</strong></label>
            <input id="codigo2fa" type="text" [(ngModel)]="codigo" maxlength="6" class="form-control mb-2" autocomplete="one-time-code" placeholder="Digite o código 2FA">
            <div *ngIf="mensagem" class="alert alert-danger mt-2">{{ mensagem }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="confirmar()" [disabled]="codigo.length !== 6">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.modal-backdrop { opacity: 0.5; }`]
})
export class Login2FAComponent {
  @Input() show = false;
  @Output() confirmado = new EventEmitter<string>();
  @Output() fechado = new EventEmitter<void>();
  codigo: string = '';
  mensagem: string = '';

  confirmar() {
    if (this.codigo.length === 6) {
      console.log('[2FA Modal] Código digitado:', this.codigo);
      this.confirmado.emit(this.codigo);
      this.codigo = '';
      this.mensagem = '';
    } else {
      this.mensagem = 'Digite o código de 6 dígitos.';
    }
  }

  onClose() {
    this.codigo = '';
    this.mensagem = '';
    this.fechado.emit();
  }
}
