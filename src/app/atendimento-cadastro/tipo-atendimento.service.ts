import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoAtendimento {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoAtendimentoService {
  private apiUrl = 'http://localhost:8080/api/servicos';

  constructor(private http: HttpClient) { }

  listarTipos(): Observable<TipoAtendimento[]> {
    return this.http.get<TipoAtendimento[]>(this.apiUrl);
  }
}
