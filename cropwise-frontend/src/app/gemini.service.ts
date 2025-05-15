import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, of } from "rxjs"
import { catchError, map } from "rxjs/operators"

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
  cropCombinations?: CropCombination[]
  error?: string
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
  cropCount?: number
  cropCombinations?: CropCombination[]
}

export interface CropCombination {
  crops: {
    cropName: string
    percentage: number
  }[]
  compatibilityScore: number
  compatibilityReasons: string[]
  plantingSequence: string
  rotationBenefits: string
  additionalNotes?: string
}

export interface ChatMessage {
  text: string
  sender: "user" | "bot"
  timestamp: Date | string
  farmId: string
}

@Injectable({
  providedIn: "root",
})
export class GeminiService {
  private apiUrl = "http://localhost:5000/api" // Your Flask backend URL

  constructor(private http: HttpClient) {}

  // Get crop suggestions from Gemini API via Flask backend
  getCropSuggestions(farmData: any, cropCount = 1): Observable<GeminiResponse> {
    console.log(`Requesting crop suggestions with count: ${cropCount}`, farmData)
    return this.http
      .post<GeminiResponse>(`${this.apiUrl}/crop-suggestions`, {
        ...farmData,
        cropCount,
      })
      .pipe(
        catchError((error) => {
          console.error("Error in getCropSuggestions:", error)
          // Return a default response with error information
          return of({
            suggestions: [],
            weatherData: {
              temperature: 25,
              rainfall: 10,
              humidity: 60,
              season: "Unknown",
            },
            analysis: `Error getting crop suggestions: ${error.message || "Unknown error"}`,
            cropCombinations: [],
            error: error.message || "Failed to get crop suggestions",
          })
        }),
      )
  }

  // Get farm data from Firebase
  getFarmData(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/farm-data/${userId}`).pipe(
      catchError((error) => {
        console.error("Error fetching farm data:", error)
        return of([])
      }),
    )
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
    return this.http.post(`${this.apiUrl}/saved-suggestions`, savedSuggestion).pipe(
      catchError((error) => {
        console.error("Error saving suggestions:", error)
        return of({ error: "Failed to save suggestions" })
      }),
    )
  }

  // Get chatbot response from Gemini API
  getChatbotResponse(message: string, context: string): Observable<string> {
    console.log("Sending chatbot request with context length:", context.length)
    return this.http
      .post<{ response: string }>(`${this.apiUrl}/chatbot`, {
        message,
        context,
      })
      .pipe(
        catchError((error) => {
          console.error("Error getting chatbot response:", error)
          return of({ response: "I'm sorry, I encountered an error while processing your question. Please try again." })
        }),
        // Extract the response field from the response object
        map((response: { response: string }) => response.response),
      )
  }

  // Get chat history for a user
  getChatHistory(userId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/chat-history/${userId}`).pipe(
      catchError((error) => {
        console.error("Error fetching chat history:", error)
        return of([])
      }),
    )
  }

  // Save chat history for a user
  saveChatHistory(userId: string, chatHistory: ChatMessage[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat-history/${userId}`, { chatHistory }).pipe(
      catchError((error) => {
        console.error("Error saving chat history:", error)
        return of({ error: "Failed to save chat history" })
      }),
    )
  }
}
