import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-ativar-2fa',
  templateUrl: './ativar-2fa.component.html',
  styleUrls: ['./ativar-2fa.component.css']
})
export class Ativar2FAComponent {
  get qrCodeImgUrl(): string {
    if (!this.qrCodeUrl) return '';
    // Se vier uma URL de imagem, extrai o parâmetro 'data' dela
    if (this.qrCodeUrl.startsWith('https://api.qrserver.com')) {
      const url = new URL(this.qrCodeUrl);
      const dataParam = url.searchParams.get('data');
      if (dataParam && dataParam.startsWith('otpauth://')) {
        return 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(dataParam) + '&size=200x200&ecc=M&margin=0';
      }
      // Se não for otpauth, retorna vazio
      return '';
    }
    // Se vier direto a string otpauth://...
    if (this.qrCodeUrl.startsWith('otpauth://')) {
      return 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(this.qrCodeUrl) + '&size=200x200&ecc=M&margin=0';
    }
    // Se vier qualquer outra coisa, retorna vazio
    return '';
  }
  get qrCodeLink(): string {
    return 'https://qrcode.show/' + encodeURIComponent(this.qrCodeUrl);
  }
  qrCodeUrl: string = '';
  secret: string = '';
  codigo: string = '';
  mensagem: string = '';
  isLoading: boolean = false;
  @Output() ativado = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  abrirModal(userId: number) {
    console.log('[2FA] abrirModal chamado para userId:', userId);
    this.isLoading = true;
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post<any>(`http://localhost:8080/api/2fa/ativar/${userId}`, {}, { headers }).subscribe({
      next: (res) => {
        console.log('[2FA] Resposta do backend:', res);
  // res.otpAuthUrl já é o link do QR Code pronto
  console.log('[2FA] Valor de otpAuthUrl recebido:', res.otpAuthUrl);
  this.qrCodeUrl = res.otpAuthUrl;
        this.secret = res.secret;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[2FA] Erro ao ativar 2FA:', err);
        this.mensagem = 'Erro ao gerar QR Code.';
        this.isLoading = false;
      }
    });
  }

  confirmarCodigo() {
    this.isLoading = true;
  const token = localStorage.getItem('ACCESS_TOKEN');
  console.log('[2FA] Token JWT enviado:', token);
    const idCliente = localStorage.getItem('ID_CLIENTE'); // ajuste conforme onde o id está salvo
    const payload = {
      idCliente: Number(idCliente),
      codigo: this.codigo
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    console.log('[2FA] Token enviado:', token);
    console.log('[2FA] idCliente enviado:', idCliente);
    console.log('[2FA] Payload enviado:', payload);
    console.log('[2FA] Header Authorization:', headers.get('Authorization'));
    this.http.post<any>('http://localhost:8080/api/confirmar-2fa', payload, { headers }).subscribe({
      next: (res) => {
        if (res.verified) {
          this.mensagem = 'Autenticação em dois fatores ativada com sucesso! Você está mais protegido.';
          this.qrCodeUrl = '';
          this.codigo = '';
          setTimeout(() => {
            this.mensagem = '';
            this.ativado.emit();
          }, 2000);
        } else {
          this.mensagem = 'Código inválido. Tente novamente.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.mensagem = 'Erro ao validar código.';
        this.isLoading = false;
      }
    });
  }
}
