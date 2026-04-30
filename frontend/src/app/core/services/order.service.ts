import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, Order, ViaCepResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders`);
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

  create(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, request);
  }

  getAddressByCep(cep: string): Observable<ViaCepResponse> {
    return this.http.get<ViaCepResponse>(`${environment.apiUrl}/address/${cep}`);
  }
}
