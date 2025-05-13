import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { GeminiService, type CropSuggestion } from "../gemini.service"
import { NavbarComponent } from "../navbar/navbar.component"
import { HttpClientModule } from "@angular/common/http"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"

interface Farm {
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

interface SavedSuggestion {
  farmId: string
  suggestions: CropSuggestion[]
  weatherData: any
  analysis: string
  timestamp: string
}

@Component({
  selector: "app-crop-suggestions",
  standalone: true,
  imports: [CommonModule, NavbarComponent, HttpClientModule],
  templateUrl: "./crop-suggestions.component.html",
  styleUrls: ["./crop-suggestions.component.css"],
})
export class CropSuggestionsComponent implements OnInit {
  suggestions: CropSuggestion[] = []
  weatherData: any = null
  analysis = ""
  loading = false
  error = ""
  userId: string | null = null
  farms: Farm[] = []
  selectedFarm: Farm | null = null
  hasSavedSuggestions = false
  lastUpdated: Date | null = null

  constructor(
    private geminiService: GeminiService,
    private router: Router,
    private authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    console.log("CropSuggestionsComponent initialized")

    try {
      // Get current user using the Promise-based method
      const user = await this.authService.getCurrentUser()

      if (user) {
        console.log("User authenticated:", user.uid)
        this.userId = user.uid
        this.loadFarms()
      } else {
        console.log("No authenticated user")
        this.router.navigate(["/login"])
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      this.router.navigate(["/login"])
    }
  }

  loadFarms(): void {
    if (!this.userId) return

    console.log("Loading farms for user:", this.userId)
    this.loading = true
    this.error = ""

    this.geminiService.getFarmData(this.userId).subscribe({
      next: (farms: Farm[]) => {
        console.log("Farms loaded:", farms)
        this.farms = farms
        this.loading = false

        // If there's only one farm, select it automatically
        if (farms.length === 1) {
          this.selectFarm(farms[0])
        }
      },
      error: (error: any) => {
        console.error("Error loading farms:", error)
        this.error = "Failed to load farms. Please try again."
        this.loading = false
      },
    })
  }

  selectFarm(farm: Farm): void {
    console.log("Farm selected:", farm)
    this.selectedFarm = farm

    // Clear current suggestions
    this.suggestions = []
    this.weatherData = null
    this.analysis = ""

    // Check if we have saved suggestions for this farm
    this.loadSavedSuggestions(farm.id)
  }

  loadSavedSuggestions(farmId: string): void {
    if (!this.userId) return

    this.loading = true

    this.geminiService.getSavedSuggestions(farmId).subscribe({
      next: (savedSuggestion: SavedSuggestion | null) => {
        this.loading = false

        if (savedSuggestion) {
          console.log("Loaded saved suggestions:", savedSuggestion)
          this.suggestions = savedSuggestion.suggestions
          this.weatherData = savedSuggestion.weatherData
          this.analysis = savedSuggestion.analysis
          this.hasSavedSuggestions = true
          this.lastUpdated = new Date(savedSuggestion.timestamp)
        } else {
          console.log("No saved suggestions found")
          this.hasSavedSuggestions = false
          this.lastUpdated = null
        }
      },
      error: (error: any) => {
        console.error("Error loading saved suggestions:", error)
        this.loading = false
        this.hasSavedSuggestions = false
      },
    })
  }

  getSuggestions(): void {
    console.log("Getting suggestions for farm:", this.selectedFarm)
    if (!this.selectedFarm) {
      this.error = "Please select a farm to get crop suggestions"
      return
    }

    this.loading = true
    this.error = ""

    // Get crop suggestions based on selected farm data
    this.geminiService.getCropSuggestions(this.selectedFarm).subscribe({
      next: (response: { suggestions: CropSuggestion[]; weatherData: any; analysis: string }) => {
        console.log("Crop suggestions received:", response)
        this.suggestions = response.suggestions
        this.weatherData = response.weatherData
        this.analysis = response.analysis
        this.loading = false
        this.hasSavedSuggestions = true
        this.lastUpdated = new Date()

        // Save the suggestions
        this.saveSuggestions()

        // Scroll to suggestions
        setTimeout(() => {
          const element = document.querySelector(".suggestions-list")
          if (element && this.suggestions.length > 0) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
      },
      error: (error: any) => {
        console.error("Error getting crop suggestions:", error)
        this.error = "Failed to get crop suggestions. Please try again."
        this.loading = false
      },
    })
  }

  saveSuggestions(): void {
    if (!this.selectedFarm || !this.userId || this.suggestions.length === 0) return

    const savedSuggestion: SavedSuggestion = {
      farmId: this.selectedFarm.id,
      suggestions: this.suggestions,
      weatherData: this.weatherData,
      analysis: this.analysis,
      timestamp: new Date().toISOString(),
    }

    this.geminiService.saveSuggestions(savedSuggestion).subscribe({
      next: (response: any) => {
        console.log("Suggestions saved successfully:", response)
      },
      error: (error: any) => {
        console.error("Error saving suggestions:", error)
      },
    })
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) {
      return "#4CAF50" // Green for high confidence
    } else if (confidence >= 60) {
      return "#FFC107" // Yellow for medium confidence
    } else {
      return "#F44336" // Red for low confidence
    }
  }

  navigateToFarmForm(): void {
    this.router.navigate(["/farm-form"])
  }
}
