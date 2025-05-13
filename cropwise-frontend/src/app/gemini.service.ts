import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { catchError } from "rxjs/operators"

export interface CropSuggestion {
  cropName: string
  confidence: number
  reasonsForSelection: string[]
  plantingTime: string
  harvestTime: string
  expectedYield: string
  waterRequirements: string
  fertilizers: string[]
  pestManagement: string[]
  capitalRequired: string
  timeToHarvest: string
  additionalNotes: string
}

export interface GeminiResponse {
  suggestions: CropSuggestion[]
  weatherData: {
    temperature: number
    rainfall: number
    humidity: number
    season: string
    forecast?: string
  }
  analysis: string
}

export interface Farm {
  id: string
  farmName: string
  farmSize: number
  location: string
  latitude: string
  longitude: string
  soilType: string
  yieldPerformance: string
  cropHistory: string
  timestamp: string
  userId: string
}

export interface SavedSuggestion {
  farmId: string
  suggestions: CropSuggestion[]
  weatherData: any
  analysis: string
  timestamp: string
}

@Injectable({
  providedIn: "root",
})
export class GeminiService {
  private apiUrl = "http://localhost:5000/api" // Your Flask backend URL

  constructor(private http: HttpClient) {}

  // Get crop suggestions from Gemini API via Flask backend
  getCropSuggestions(farmData: any): Observable<GeminiResponse> {
    return this.http.post<GeminiResponse>(`${this.apiUrl}/crop-suggestions`, farmData)
  }

  // Get farm data from Firebase
  getFarmData(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/farm-data/${userId}`)
  }

  // Get saved suggestions for a farm
  getSavedSuggestions(farmId: string): Observable<SavedSuggestion | null> {
    return this.http.get<SavedSuggestion>(`${this.apiUrl}/saved-suggestions/${farmId}`).pipe(
      catchError((error) => {
        console.error("Error fetching saved suggestions:", error)
        return of(null)
      }),
    )
  }

  // Save suggestions for a farm
  saveSuggestions(savedSuggestion: SavedSuggestion): Observable<any> {
    return this.http.post(`${this.apiUrl}/saved-suggestions`, savedSuggestion)
  }

  // Prepare the prompt for Gemini API
  prepareGeminiPrompt(farmData: any, weatherData: any): string {
    return `
You are an agricultural expert AI assistant. Based on the following farm data and weather information, suggest the best crops to plant.

FARM DATA:
- Farm Size: ${farmData.farmSize} acres
- Location: ${farmData.location}
- Soil Type: ${farmData.soilType}
- Previous Yield Performance: ${farmData.yieldPerformance}
- Crop History: ${farmData.cropHistory}

WEATHER DATA:
- Current Temperature: ${weatherData.temperature}°C
- Rainfall: ${weatherData.rainfall} mm
- Humidity: ${weatherData.humidity}%
- Season: ${weatherData.season}

Please provide 3-5 crop suggestions with the following details for each:
1. Crop Name
2. Confidence Rate (as a percentage)
3. Reasons for Selection (list at least 3 specific reasons)
4. Planting Time
5. Harvest Time
6. Expected Yield
7. Water Requirements
8. Recommended Fertilizers (list at least 2)
9. Pest Management Strategies (list at least 2)
10. Capital Required (estimated cost per acre)
11. Time to Harvest (in days/months)
12. Additional Notes or Considerations

Format your response as structured data that can be parsed as JSON.
`
  }
}
