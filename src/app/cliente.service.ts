import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class ClienteService {
	private clienteApi = environment.clienteService + 'api/clientes';
	private atendimentoApi = environment.atendimentoService + 'api/atendimentos';

	constructor(private http: HttpClient) { }

	/** Retorna os dados do cliente autenticado (usa token) */
	obterClienteAutenticado(): Observable<any> {
		const token = localStorage.getItem('ACCESS_TOKEN');
		const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
		return this.http.get<any>(`${this.clienteApi}/me`, { headers });
	}

	/** Chama GET /api/atendimentos/cliente no atendimento-service para obter atendimentos do cliente autenticado */
	obterAtendimentosDoClienteAutenticado(): Observable<any[]> {
		const token = localStorage.getItem('ACCESS_TOKEN');
		const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
		return this.http.get<any[]>(`${this.atendimentoApi}/cliente`, { headers });
	}
}
