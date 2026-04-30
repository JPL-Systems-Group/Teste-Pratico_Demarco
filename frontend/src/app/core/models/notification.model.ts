export interface Notification {
  id: string;
  type: 'OrderCreated' | 'DeliveryRegistered';
  message: string;
  referenceId: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface SignalRNotification {
  type: string;
  message: string;
  referenceId: string;
  createdAt: string;
}
