import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { getDatabase, ref, push, set, get, child } from "firebase/database"
import { app } from "./app/firebase.config"
import { API_CONFIG } from "./app/constants"

export interface FarmData {
  userId: string
  farmName: string
  farmSize: number
  location: string
  soilType: string
  yieldPerformance: string
  cropHistory: string
  timestamp: string
}

@Injectable({
  providedIn: "root",
})
export class FarmService {
  private apiUrl = API_CONFIG.BASE_URL // Use the base URL from constants
  private database = getDatabase(app)

  constructor(private http: HttpClient) {}

  // Save farm data via Flask backend
  saveFarmData(farmData: FarmData): Observable<any> {
    return this.http.post(`${this.apiUrl}${API_CONFIG.ENDPOINTS.FARM_DATA}`, farmData)
  }

  // Get farm data for a user via Flask backend
  getFarmDataByUserId(userId: string): Observable<FarmData[]> {
    return this.http.get<FarmData[]>(`${this.apiUrl}${API_CONFIG.ENDPOINTS.FARM_DATA_BY_ID(userId)}`)
  }

  // Direct Firebase methods (alternative if Flask backend is not ready)
  saveFarmDataDirectly(userId: string, farmData: Omit<FarmData, "userId">): Promise<any> {
    const farmListRef = ref(this.database, `farms/${userId}`)
    const newFarmRef = push(farmListRef)
    return set(newFarmRef, {
      ...farmData,
      userId,
      timestamp: new Date().toISOString(),
    })
  }

  getFarmDataDirectly(userId: string): Promise<any> {
    const dbRef = ref(this.database)
    return get(child(dbRef, `farms/${userId}`))
  }
}
