import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Atendimento {
  data: string;
  hora: string;
  idServico: number;
  idProfissional: number;
  observacoes: string;
}

@Injectable({
  providedIn: 'root'
})
export class AtendimentoService {
  private apiUrl = environment.atendimentoService + 'api/atendimentos';

  constructor(private http: HttpClient) { }

  listarMeusAtendimentos(): Observable<any[]> {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    // Ajuste a URL se necessário para buscar apenas do cliente logado
    return this.http.get<any[]>(this.apiUrl + '/meus', { headers });
  }

  /**
   * Lista atendimentos por cliente usando POST /api/por-cliente.
   * Se for necessário enviar um payload com { idCliente }, envie aqui.
   */
  listarPorCliente(idCliente?: number): Observable<any[]> {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const url = `${this.apiUrl}/por-cliente`;
    if (typeof idCliente === 'number') {
      return this.http.post<any[]>(url, { idCliente }, { headers });
    }
    // Se não tiver idCliente, tentar chamar sem payload (alguns backends aceitam)
    return this.http.post<any[]>(url, {}, { headers });
  }

  cadastrarAtendimento(atendimento: Atendimento): Observable<any> {
    const token = localStorage.getItem('ACCESS_TOKEN');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(this.apiUrl, atendimento, { headers });
  }
}
