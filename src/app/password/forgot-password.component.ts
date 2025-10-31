import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PasswordService } from '../auth/password.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private fb: FormBuilder, private passwordService: PasswordService) { }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
  const email = this.form.value.email as string;
  this.passwordService.forgot(email).subscribe({
      next: (res) => {
        this.isLoading = false;
        // backend returns generic message; show friendly confirmation
        this.successMessage = 'Se o e-mail existir, você receberá instruções para redefinir sua senha.';
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro ao solicitar reset de senha', err);
        this.errorMessage = 'Não foi possível processar a solicitação. Tente novamente mais tarde.';
      }
    });
  }
}
