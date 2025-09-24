import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  logError(message: string, error?: any) {
    // Aqui você pode customizar: enviar para backend, salvar em arquivo, etc.
    console.error('[LOG ERROR]', message, error);
  }
}
