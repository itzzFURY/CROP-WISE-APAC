import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private apiUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  getFarms(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.FARM_DATA_BY_ID(userId)}`);
  }

  getFarmById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.FARM_DATA}/${id}`);
  }

  createFarm(farmData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.FARM_DATA}`, farmData);
  }

  updateFarm(id: string, farmData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.FARM_DATA_UPDATE(id)}`, farmData);
  }

  deleteFarm(id: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.FARM_DATA_DELETE(id)}?userId=${userId}`);
  }
} 