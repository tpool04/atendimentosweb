import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  private base = `${environment.authService}api/auth/password`;

  constructor(private http: HttpClient) { }

  forgot(email: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.base}/forgot`, { email }, { headers, responseType: 'text' });
  }

  reset(token: string, newPassword: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.base}/reset`, { token, newPassword }, { headers, responseType: 'text' });
  }
}
