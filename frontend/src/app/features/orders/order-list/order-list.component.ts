import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatTableModule, MatButtonModule, MatChipsModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatCardModule, MatToolbarModule
  ],
  template: `
    <div class="page-container">
      <mat-toolbar color="primary" class="page-toolbar">
        <span>Painel de Pedidos</span>
        <span class="spacer"></span>
        <a mat-stroked-button routerLink="/orders/new" style="margin-right:8px; color:white; border-color:white">
          <mat-icon>add</mat-icon> Novo Pedido
        </a>
        <a mat-stroked-button routerLink="/deliveries/new" style="color:white; border-color:white">
          <mat-icon>local_shipping</mat-icon> Registrar Entrega
        </a>
      </mat-toolbar>

      <div class="content">
        <div *ngIf="loading" class="spinner-center">
          <mat-spinner></mat-spinner>
        </div>

        <mat-card *ngIf="!loading">
          <mat-card-content>
            <table mat-table [dataSource]="orders" class="full-width">
              <ng-container matColumnDef="orderNumber">
                <th mat-header-cell *matHeaderCellDef>Nº do Pedido</th>
                <td mat-cell *matCellDef="let o">{{ o.orderNumber }}</td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let o">{{ o.description }}</td>
              </ng-container>
              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef>Valor</th>
                <td mat-cell *matCellDef="let o">{{ o.value | currency:'BRL' }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let o">
                  <mat-chip [class]="o.status === 'Delivered' ? 'chip-delivered' : 'chip-pending'">
                    {{ statusLabel(o.status) }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="city">
                <th mat-header-cell *matHeaderCellDef>Cidade</th>
                <td mat-cell *matCellDef="let o">{{ o.address.city }} / {{ o.address.state }}</td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Criado em</th>
                <td mat-cell *matCellDef="let o">{{ o.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            <p *ngIf="orders.length === 0" class="empty-state">
              Nenhum pedido encontrado. Crie o primeiro!
            </p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { height: 100vh; display: flex; flex-direction: column; }
    .spacer { flex: 1; }
    .content { padding: 24px; flex: 1; overflow: auto; }
    .full-width { width: 100%; }
    .spinner-center { display: flex; justify-content: center; padding: 48px; }
    .empty-state { text-align: center; padding: 32px; color: #666; }
    .chip-delivered { background-color: #c8e6c9 !important; color: #2e7d32 !important; }
    .chip-pending { background-color: #fff9c4 !important; color: #f57f17 !important; }
  `]
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  displayedColumns = ['orderNumber', 'description', 'value', 'status', 'city', 'createdAt'];

  private liveEventSub?: Subscription;

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.liveEventSub = this.notificationService.liveEvent$.subscribe(event => {
      if (event) this.loadOrders();
    });
  }

  ngOnDestroy(): void {
    this.liveEventSub?.unsubscribe();
  }

  statusLabel(status: string): string {
    return status === 'Delivered' ? 'Entregue' : 'Pendente';
  }

  loadOrders(): void {
    this.orderService.getAll().subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Falha ao carregar pedidos', 'Fechar', { duration: 3000 });
      }
    });
  }
}
