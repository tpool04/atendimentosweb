import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ServicoCreateRequest {
  nome: string;
  valor: number;
}

export interface ServicoGetResponse {
  idServico: number;
  nome: string;
  valor: number;
  profissionais: any[];
}

@Injectable({ providedIn: 'root' })
export class ServicoService {
  deleteServico(id: number): Observable<any> {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete(`${this.apiUrl}/${id}`, headers ? { headers, responseType: 'text' } : { responseType: 'text' });
  }
  private apiUrl = environment.atendimentosApi + 'api/servicos';

  constructor(private http: HttpClient) {}

  createServico(request: ServicoCreateRequest): Observable<ServicoGetResponse> {
  const token = localStorage.getItem('ACCESS_TOKEN');
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  return this.http.post<ServicoGetResponse>(this.apiUrl, request, headers ? { headers } : {});
  }
}
