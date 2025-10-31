import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from '../auth/password.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  token: string | null = null;

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordService: PasswordService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
    });
  }

  get f() { return this.form.controls; }

  passwordsMatch(): boolean {
    return this.form.value.newPassword === this.form.value.confirmPassword;
  }

  onSubmit() {
    if (this.form.invalid) return;
    if (!this.passwordsMatch()) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }
    if (!this.token) {
      this.errorMessage = 'Token de redefinição não encontrado.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.passwordService.reset(this.token, this.form.value.newPassword as string).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Senha alterada com sucesso. Você será redirecionado para a tela de login.';
        setTimeout(() => this.router.navigate(['/acessar-conta']), 2500);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro ao redefinir senha', err);
        this.errorMessage = err?.error || 'Erro ao redefinir a senha. O token pode ser inválido ou expirado.';
      }
    });
  }
}
