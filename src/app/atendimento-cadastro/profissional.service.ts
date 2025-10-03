import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profissional {
  idProfissional: number;
  nome: string;
  telefone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {
  private apiUrl = environment.atendimentosApi + 'api/profissionais';

  constructor(private http: HttpClient) { }

  listarProfissionais(): Observable<Profissional[]> {
    return this.http.get<Profissional[]>(this.apiUrl);
  }

  listarPorTipoServico(tipoServicoId: number): Observable<Profissional[]> {
    return this.http.get<Profissional[]>(`${this.apiUrl}?servico=${tipoServicoId}`);
  }
}
