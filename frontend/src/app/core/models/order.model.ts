export interface Address {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  description: string;
  value: number;
  status: 'Pending' | 'Delivered';
  address: Address;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  orderNumber: string;
  description: string;
  value: number;
  address: Address;
}

export interface ViaCepResponse {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}
