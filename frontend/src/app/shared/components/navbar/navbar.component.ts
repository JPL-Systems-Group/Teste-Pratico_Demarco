import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-navbar">
      <a routerLink="/orders" class="brand">TechsysLog</a>
      <span class="spacer"></span>

      <button mat-icon-button [matMenuTriggerFor]="notifMenu" (click)="onBellClick()">
        <mat-icon [matBadge]="unreadCount > 0 ? unreadCount.toString() : ''" matBadgeColor="warn"
                  [matBadgeHidden]="unreadCount === 0">
          notifications
        </mat-icon>
      </button>

      <mat-menu #notifMenu="matMenu">
        <div class="notif-header" (click)="$event.stopPropagation()">
          <strong>Notifications</strong>
        </div>
        <mat-divider></mat-divider>
        <div *ngIf="notifications.length === 0" class="notif-empty" (click)="$event.stopPropagation()">
          No notifications
        </div>
        <div *ngFor="let n of notifications"
             class="notif-item"
             [class.unread]="!n.isRead"
             (click)="markAsRead(n); $event.stopPropagation()">
          <mat-icon class="notif-icon" [style.color]="n.type === 'DeliveryRegistered' ? '#4caf50' : '#3f51b5'">
            {{ n.type === 'DeliveryRegistered' ? 'local_shipping' : 'shopping_bag' }}
          </mat-icon>
          <div class="notif-body">
            <p class="notif-msg">{{ n.message }}</p>
            <small class="notif-time">{{ n.createdAt | date:'dd/MM HH:mm' }}</small>
          </div>
        </div>
      </mat-menu>

      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <button mat-menu-item disabled>{{ userName }}</button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .app-navbar { position: sticky; top: 0; z-index: 100; }
    .brand { color: white; text-decoration: none; font-size: 20px; font-weight: 500; }
    .spacer { flex: 1; }
    .notif-header { padding: 12px 16px; min-width: 300px; }
    .notif-empty { padding: 16px; color: #666; text-align: center; font-size: 14px; min-width: 300px; }
    .notif-item { display: flex; align-items: flex-start; padding: 10px 16px; cursor: pointer; gap: 12px; min-width: 300px; }
    .notif-item:hover { background: #f5f5f5; }
    .notif-item.unread { background: #e8eaf6; }
    .notif-icon { font-size: 20px; margin-top: 2px; }
    .notif-body { flex: 1; }
    .notif-msg { margin: 0; font-size: 13px; line-height: 1.4; }
    .notif-time { color: #999; font-size: 11px; }
  `]
})
export class NavbarComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  userName = '';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getCurrentUser()?.name ?? '';
    this.notificationService.notifications$.subscribe(n => this.notifications = n);
    this.notificationService.unreadCount$.subscribe(c => this.unreadCount = c);
    this.notificationService.startConnection();
    this.notificationService.loadNotifications();
  }

  onBellClick(): void {
    this.notificationService.loadNotifications();
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      this.notificationService.loadNotifications();
    });
  }

  logout(): void {
    this.notificationService.stopConnection();
    this.authService.logout();
  }
}
