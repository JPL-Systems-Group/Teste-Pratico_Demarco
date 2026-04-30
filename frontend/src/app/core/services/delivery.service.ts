import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDeliveryRequest, Delivery } from '../models/delivery.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  constructor(private http: HttpClient) {}

  register(request: CreateDeliveryRequest): Observable<Delivery> {
    return this.http.post<Delivery>(`${environment.apiUrl}/deliveries`, request);
  }
}
