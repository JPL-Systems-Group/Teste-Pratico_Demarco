import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>TechsysLog</mat-card-title>
          <mat-card-subtitle>Acesse sua conta</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email" placeholder="voce@exemplo.com">
              <mat-error *ngIf="form.get('email')?.hasError('required')">E-mail é obrigatório</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">E-mail inválido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput type="password" formControlName="password">
              <mat-error *ngIf="form.get('password')?.hasError('required')">Senha é obrigatória</mat-error>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit"
                    class="full-width" [disabled]="loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Entrar</span>
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <p class="text-center">Não tem uma conta? <a routerLink="/register">Cadastre-se</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .auth-card { width: 100%; max-width: 400px; padding: 16px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    button { margin-top: 8px; }
    .text-center { text-align: center; margin-top: 8px; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.authService.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Falha ao fazer login', 'Fechar', { duration: 3000 });
      }
    });
  }
}
