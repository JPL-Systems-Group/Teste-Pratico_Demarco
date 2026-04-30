import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatToolbarModule, MatIconModule
  ],
  template: `
    <div class="page-container">
      <mat-toolbar color="primary">
        <button mat-icon-button routerLink="/orders"><mat-icon>arrow_back</mat-icon></button>
        <span>New Order</span>
      </mat-toolbar>

      <div class="content">
        <mat-card class="form-card">
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <h3>Order Details</h3>
              <div class="row">
                <mat-form-field appearance="outline" class="col">
                  <mat-label>Order Number</mat-label>
                  <input matInput formControlName="orderNumber">
                  <mat-error>Required</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline" class="col">
                  <mat-label>Value (R$)</mat-label>
                  <input matInput type="number" formControlName="value" min="0.01">
                  <mat-error>Must be greater than zero</mat-error>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
                <mat-error>Required</mat-error>
              </mat-form-field>

              <h3>Delivery Address</h3>
              <div formGroupName="address">
                <div class="row">
                  <mat-form-field appearance="outline" class="col-small">
                    <mat-label>CEP</mat-label>
                    <!-- maxlength=9 allows NNNNN-NNN (8 digits + 1 dash per ViaCEP spec) -->
                    <input matInput formControlName="cep" placeholder="00000-000"
                           maxlength="9" (input)="onCepInput($event)">
                    <mat-hint *ngIf="cepLoading">Looking up CEP...</mat-hint>
                    <mat-error *ngIf="form.get('address.cep')?.hasError('required')">Required</mat-error>
                    <mat-error *ngIf="form.get('address.cep')?.hasError('pattern')">Invalid CEP (use 00000-000)</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="col-large">
                    <mat-label>Street</mat-label>
                    <input matInput formControlName="street">
                    <mat-error>Required</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="col-small">
                    <mat-label>Number</mat-label>
                    <input matInput formControlName="number">
                    <mat-error>Required</mat-error>
                  </mat-form-field>
                </div>
                <div class="row">
                  <mat-form-field appearance="outline" class="col">
                    <mat-label>Neighborhood</mat-label>
                    <input matInput formControlName="neighborhood">
                    <mat-error>Required</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="col">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city">
                    <mat-error>Required</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="col-small">
                    <mat-label>State</mat-label>
                    <input matInput formControlName="state" maxlength="2">
                    <mat-error>Required</mat-error>
                  </mat-form-field>
                </div>
              </div>

              <div class="actions">
                <button mat-button type="button" routerLink="/orders">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                  <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                  <span *ngIf="!loading">Save Order</span>
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
    .form-card { max-width: 800px; margin: 0 auto; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; }
    .col { flex: 1; min-width: 200px; }
    .col-small { flex: 0 0 150px; }
    .col-large { flex: 2; min-width: 200px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    h3 { color: #3f51b5; margin: 16px 0 8px; }
  `]
})
export class OrderFormComponent {
  form: FormGroup;
  loading = false;
  cepLoading = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      orderNumber: ['', Validators.required],
      description: ['', Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]],
      address: this.fb.group({
        cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
        street: ['', Validators.required],
        number: ['', Validators.required],
        neighborhood: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', [Validators.required, Validators.maxLength(2)]]
      })
    });

    // Trigger lookup after user stops typing for 400ms with a fully formatted CEP
    this.form.get('address.cep')!.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(cep => this.lookupCep(cep));
  }

  // Auto-formats digits as NNNNN-NNN while the user types
  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Keep only digits
    let digits = input.value.replace(/\D/g, '').slice(0, 8);
    // Insert dash after the 5th digit
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    this.form.get('address.cep')!.setValue(formatted, { emitEvent: true });
  }

  private lookupCep(cep: string): void {
    // Only proceed when the full NNNNN-NNN pattern is present
    if (!cep || cep.length !== 9) return;

    this.cepLoading = true;
    this.orderService.getAddressByCep(cep).subscribe({
      next: (addr) => {
        this.cepLoading = false;
        this.form.patchValue({
          address: {
            street: addr.street,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state
          }
        });
      },
      error: () => {
        this.cepLoading = false;
        this.snackBar.open('CEP not found', 'Close', { duration: 2000 });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    this.orderService.create(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Order created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Failed to create order', 'Close', { duration: 3000 });
      }
    });
  }
}
