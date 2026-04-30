export interface CreateDeliveryRequest {
  orderNumber: string;
  deliveredAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  deliveredAt: string;
  registeredBy: string;
  createdAt: string;
}
