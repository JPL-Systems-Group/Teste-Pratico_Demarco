import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { Notification, SignalRNotification } from '../models/notification.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hubConnection: signalR.HubConnection | null = null;

  private _notifications = new BehaviorSubject<Notification[]>([]);
  readonly notifications$ = this._notifications.asObservable();

  private _unreadCount = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this._unreadCount.asObservable();

  private _liveEvent = new BehaviorSubject<SignalRNotification | null>(null);
  readonly liveEvent$ = this._liveEvent.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  startConnection(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/notifications?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveNotification', (payload: SignalRNotification) => {
      this._liveEvent.next(payload);
      this.loadNotifications();
    });

    this.hubConnection.start().catch(err =>
      console.error('SignalR connection error:', err)
    );
  }

  stopConnection(): void {
    this.hubConnection?.stop();
  }

  loadNotifications(): void {
    this.http.get<Notification[]>(`${environment.apiUrl}/notifications`).subscribe({
      next: notifications => {
        this._notifications.next(notifications);
        this._unreadCount.next(notifications.filter(n => !n.isRead).length);
      }
    });
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<Notification>(
      `${environment.apiUrl}/notifications/${id}/read`, {}
    );
  }
}
