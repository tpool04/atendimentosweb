import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TipoAtendimento {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoAtendimentoService {
  private apiUrl = environment.atendimentosApi + 'api/servicos';

  constructor(private http: HttpClient) { }

  listarTipos(): Observable<TipoAtendimento[]> {
    return this.http.get<TipoAtendimento[]>(this.apiUrl);
  }
}
