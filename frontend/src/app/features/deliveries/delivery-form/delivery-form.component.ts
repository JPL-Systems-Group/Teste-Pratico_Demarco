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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-delivery-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatToolbarModule, MatIconModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="page-container">
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/orders"><mat-icon>arrow_back</mat-icon></button>
        <span>Registrar Entrega</span>
      </mat-toolbar>

      <div class="content">
        <mat-card class="form-card">
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Número do Pedido</mat-label>
                <input matInput formControlName="orderNumber" placeholder="ex: ORD-001">
                <mat-error>Obrigatório</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Data/Hora da Entrega</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="deliveredAt">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error>Obrigatório</mat-error>
              </mat-form-field>

              <div class="actions">
                <button mat-button type="button" routerLink="/orders">Cancelar</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                  <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                  <span *ngIf="!loading">Registrar Entrega</span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { height: 100vh; display: flex; flex-direction: column; }
    .content { padding: 24px; overflow: auto; }
    .form-card { max-width: 500px; margin: 0 auto; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class DeliveryFormComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private deliveryService: DeliveryService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      orderNumber: ['', Validators.required],
      deliveredAt: [new Date(), Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    const payload = {
      orderNumber: this.form.value.orderNumber,
      deliveredAt: new Date(this.form.value.deliveredAt).toISOString()
    };

    this.deliveryService.register(payload).subscribe({
      next: () => {
        this.snackBar.open('Entrega registrada com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Falha ao registrar entrega', 'Fechar', { duration: 3000 });
      }
    });
  }
}
