import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private logadoSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('ACCESS_TOKEN'));
  logado$ = this.logadoSubject.asObservable();

  setLogado(logado: boolean) {
    this.logadoSubject.next(logado);
  }
}
