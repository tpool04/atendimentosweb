import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'phoneFormat' })
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) {
      // (XX) XXXXX-XXXX
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
      // (XX) XXXX-XXXX
      return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    } else {
      return value;
    }
  }
}
