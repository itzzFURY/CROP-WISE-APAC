import { Component, type OnInit, ViewChild, type ElementRef, type AfterViewChecked, HostListener, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { GeminiService, type CropSuggestion } from "../gemini.service"
import { NavbarComponent } from "../navbar/navbar.component"
import { HttpClientModule } from "@angular/common/http"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"
import { FormatMessagePipe } from "../format-message.pipe"
import { interval, Subscription } from 'rxjs'

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
  cropCount?: number
  cropCombinations?: CropCombination[]
}

interface ChatMessage {
  text: string
  sender: "user" | "bot"
  timestamp: Date
  farmId: string // To track which farm this message belongs to
}

interface CropCombination {
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

@Component({
  selector: "app-crop-suggestions",
  standalone: true,
  imports: [CommonModule, NavbarComponent, HttpClientModule, FormsModule, FormatMessagePipe],
  templateUrl: "./crop-suggestions.component.html",
  styleUrls: ["./crop-suggestions.component.css"],
})
export class CropSuggestionsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild("chatMessages")
  private chatMessagesContainer!: ElementRef
  private startY = 0
  private isDragging = false
  private dragThreshold = 100 // Pixels to drag before closing

  suggestions: CropSuggestion[] = []
  weatherData: any = null
  analysis = ""
  loading = false
  error: string | null = null
  userId: string | null = null
  farms: Farm[] = []
  selectedFarm: Farm | null = null
  hasSavedSuggestions = false
  lastUpdated: Date | null = null

  // Crop count selection
  showCropCountSelector = false
  selectedCropCount: number | null = null

  // Crop combinations
  cropCombinations: CropCombination[] = []

  // Chatbot properties
  isChatbotOpen = false
  chatMessages: ChatMessage[] = []
  currentMessage = ""
  isChatLoading = false
  unreadMessages = 0
  suggestedQuestions = [
    "Which crop has the highest yield potential?",
    "What are the best fertilizers for these crops?",
    "How much water do these crops need?",
    "What are the common pests for these crops?",
    "When is the best time to plant?",
  ]

  customCropCount: number = 2

  searchQuery: string = ''
  loadingStep: number = 0
  private loadingInterval: Subscription | null = null

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
        this.loadAllChatHistory()
      } else {
        console.log("No authenticated user")
        this.router.navigate(["/login"])
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      this.router.navigate(["/login"])
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom()
  }

  @HostListener("touchstart", ["$event"])
  onTouchStart(event: TouchEvent) {
    if (!this.isChatbotOpen) return

    // Only start dragging if touch is near the top of the chatbot
    const touch = event.touches[0]
    const chatbotPanel = document.querySelector(".chatbot-panel")
    if (!chatbotPanel) return

    const rect = chatbotPanel.getBoundingClientRect()
    if (touch.clientY - rect.top < 50) {
      this.startY = touch.clientY
      this.isDragging = true
    }
  }

  @HostListener("touchmove", ["$event"])
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return

    const touch = event.touches[0]
    const dragDistance = touch.clientY - this.startY

    if (dragDistance > 0) {
      // Prevent default scrolling behavior when dragging down
      event.preventDefault()

      const chatbotPanel = document.querySelector(".chatbot-panel")
      if (chatbotPanel) {
        // Apply a transform to follow the finger
        const scale = 1 - dragDistance / 500
        chatbotPanel.setAttribute(
          "style",
          `transform: translateY(${dragDistance}px) scale(${scale}); opacity: ${scale};`,
        )
      }

      // If dragged past threshold, close the chatbot
      if (dragDistance > this.dragThreshold) {
        this.isDragging = false
        this.toggleChatbot()
      }
    }
  }

  @HostListener("touchend")
  onTouchEnd() {
    if (!this.isDragging) return

    // Reset the chatbot panel position
    const chatbotPanel = document.querySelector(".chatbot-panel")
    if (chatbotPanel) {
      chatbotPanel.setAttribute("style", "")
    }

    this.isDragging = false
  }

  scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer && this.chatMessagesContainer.nativeElement) {
        const element = this.chatMessagesContainer.nativeElement
        element.scrollTop = element.scrollHeight
      }
    } catch (err) {
      console.error("Error scrolling to bottom:", err)
    }
  }

  loadFarms(): void {
    if (!this.userId) return

    console.log("Loading farms for user:", this.userId)
    this.loading = true
    this.error = null

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

    // Reset crop count selector
    this.showCropCountSelector = false
    this.selectedCropCount = null

    // Clear current suggestions
    this.suggestions = []
    this.weatherData = null
    this.analysis = ""
    this.cropCombinations = []

    // Check if we have saved suggestions for this farm
    this.loadSavedSuggestions(farm.id)

    // Add a welcome message for this farm if there are no messages yet
    if (this.getCurrentFarmChatHistory().length === 0) {
      this.addBotMessage(
        `Hello! I'm your CropWise Assistant for ${farm.farmName}. Once you've generated crop suggestions, I can answer your questions about the recommended crops. Feel free to ask me anything!`,
      )
    }
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

          // Load crop count and combinations if available
          if (savedSuggestion.cropCount) {
            this.selectedCropCount = savedSuggestion.cropCount
          }

          if (savedSuggestion.cropCombinations) {
            this.cropCombinations = savedSuggestion.cropCombinations
          }

          // Add a message from the chatbot about the loaded suggestions
          this.addBotMessage(
            `I've loaded the crop suggestions for ${this.selectedFarm?.farmName}. Ask me anything about these recommendations!`,
          )
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

  showCropCountSelection(): void {
    this.showCropCountSelector = true;
    this.customCropCount = 2;  // Set default value to 2 when opening modal
  }

  cancelCropCountSelection(): void {
    this.showCropCountSelector = false;
    this.customCropCount = 2;  // Reset to 2 when canceling
  }

  selectCropCount(count: number): void {
    this.selectedCropCount = count
  }

  getCropCountDescription(count: number): string {
    switch (count) {
      case 1:
        return "Single crop for the entire farm area"
      case 2:
        return "Two crops - most common for small to medium farms"
      case 3:
        return "Three crops for diversified farming"
      default:
        return ""
    }
  }

  calculateArea(percentage: number): string {
    if (!this.selectedFarm) return "0"
    const area = (percentage / 100) * this.selectedFarm.farmSize
    return area.toFixed(2)
  }

  getSuggestions(): void {
    console.log("Getting suggestions for farm:", this.selectedFarm)
    if (!this.selectedFarm) {
      this.error = "Please select a farm to get crop suggestions"
      return
    }

    if (!this.customCropCount || this.customCropCount < 1) {
      this.error = "Please enter a valid number of crops"
      return
    }

    this.loading = true
    this.error = null
    this.showCropCountSelector = false
    this.loadingStep = 0

    // Start loading animation
    this.startLoadingAnimation()

    // Log to check what's being sent
    console.log(`Requesting suggestions for ${this.customCropCount} crops`)

    // Get crop suggestions based on selected farm data and crop count
    this.geminiService.getCropSuggestions(this.selectedFarm, this.customCropCount).subscribe({
      next: (response: {
        suggestions: CropSuggestion[]
        weatherData: any
        analysis: string
        cropCombinations?: CropCombination[]
        error?: string
      }) => {
        // Stop loading animation
        this.stopLoadingAnimation()
        
        console.log("Crop suggestions received:", response)
        console.log("Weather data received:", response.weatherData)

        // Check if there's an error in the response
        if (response.error) {
          this.error = `Error: ${response.error}`
          this.loading = false
          return
        }

        // Check if we got valid suggestions
        if (!response.suggestions || response.suggestions.length === 0) {
          this.error = "No crop suggestions were generated. Please try again."
          this.loading = false
          return
        }

        this.suggestions = response.suggestions
        this.weatherData = response.weatherData
        this.analysis = response.analysis
        
        // Ensure crop combinations are properly set
        if (this.customCropCount > 1 && response.cropCombinations) {
          console.log("Setting crop combinations:", response.cropCombinations)
          this.cropCombinations = response.cropCombinations
        } else {
          this.cropCombinations = []
        }
        
        this.loading = false
        this.hasSavedSuggestions = true
        this.lastUpdated = new Date()
        this.selectedCropCount = this.customCropCount

        // Save the suggestions
        this.saveSuggestions()

        // Add a message from the chatbot about the new suggestions
        if (this.customCropCount === 1) {
          this.addBotMessage(
            `I've analyzed your farm data and generated a crop suggestion for ${this.selectedFarm?.farmName}. Ask me anything about this recommendation!`,
          )
        } else {
          this.addBotMessage(
            `I've analyzed your farm data and generated ${this.customCropCount} crop suggestions for ${this.selectedFarm?.farmName}, including ${this.cropCombinations.length} optimal combinations and area distribution. Ask me anything about these recommendations!`,
          )
        }

        // Scroll to suggestions
        setTimeout(() => {
          const element = document.querySelector(".suggestions-list")
          if (element && this.suggestions.length > 0) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
      },
      error: (error: any) => {
        // Stop loading animation
        this.stopLoadingAnimation()
        
        console.error("Error getting crop suggestions:", error)
        this.error = "Failed to get crop suggestions. Please try again."
        this.loading = false
      },
    })
  }

  private startLoadingAnimation(): void {
    this.loadingStep = 0;
    this.loadingInterval = interval(3000).subscribe(() => {
      if (this.loadingStep < 3) {
        this.loadingStep++;
        // Add a message for each step
        switch (this.loadingStep) {
          case 1:
            this.addBotMessage("Analyzing soil conditions and nutrient levels...");
            break;
          case 2:
            this.addBotMessage("Checking weather patterns and seasonal forecasts...");
            break;
          case 3:
            this.addBotMessage("Generating optimal crop combinations...");
            break;
        }
      } else {
        this.stopLoadingAnimation();
      }
    });
  }

  private stopLoadingAnimation(): void {
    if (this.loadingInterval) {
      this.loadingInterval.unsubscribe();
      this.loadingInterval = null;
    }
    this.loadingStep = 0;
  }

  ngOnDestroy(): void {
    this.stopLoadingAnimation();
  }

  saveSuggestions(): void {
    if (!this.selectedFarm || !this.userId || this.suggestions.length === 0) return

    const savedSuggestion: SavedSuggestion = {
      farmId: this.selectedFarm.id,
      suggestions: this.suggestions,
      weatherData: this.weatherData,
      analysis: this.analysis,
      timestamp: new Date().toISOString(),
      cropCount: this.selectedCropCount || 1,
      cropCombinations: this.cropCombinations,
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

  getCompatibilityColor(score: number): string {
    if (score >= 80) {
      return "#4CAF50" // Green for high compatibility
    } else if (score >= 60) {
      return "#FFC107" // Yellow for medium compatibility
    } else {
      return "#F44336" // Red for low compatibility
    }
  }

  navigateToFarmForm(): void {
    this.router.navigate(["/farm-form"])
  }

  // Chatbot methods
  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen

    if (this.isChatbotOpen) {
      // Reset unread count when opening the chatbot
      this.unreadMessages = 0

      // Focus on input field
      setTimeout(() => {
        const inputElement = document.querySelector(".chat-input input") as HTMLInputElement
        if (inputElement) {
          inputElement.focus()
        }
      }, 100)
    }
  }

  // Get chat history for the current farm only
  getCurrentFarmChatHistory(): ChatMessage[] {
    if (!this.selectedFarm) return []
    return this.chatMessages.filter((message) => message.farmId === this.selectedFarm?.id)
  }

  // Load all chat history from storage
  loadAllChatHistory(): void {
    this.geminiService.getChatHistory(this.userId || "").subscribe({
      next: (chatHistory: any[]) => {
        if (chatHistory && chatHistory.length > 0) {
          console.log("Loaded chat history:", chatHistory)
          // Convert string timestamps to Date objects
          this.chatMessages = chatHistory.map((message) => ({
            ...message,
            timestamp: typeof message.timestamp === "string" ? new Date(message.timestamp) : message.timestamp,
          })) as ChatMessage[];
        }
      },
      error: (error) => {
        console.error("Error loading chat history:", error)
      },
    })
  }

  // Save chat history
  saveChatHistory(): void {
    if (!this.userId) return

    this.geminiService.saveChatHistory(this.userId, this.chatMessages).subscribe({
      next: (response) => {
        console.log("Chat history saved successfully")
      },
      error: (error) => {
        console.error("Error saving chat history:", error)
      },
    })
  }

  // Add a bot message
  addBotMessage(text: string): void {
    if (!this.selectedFarm) return

    const message: ChatMessage = {
      text,
      sender: "bot",
      timestamp: new Date(),
      farmId: this.selectedFarm.id,
    }

    this.chatMessages.push(message)

    // If chatbot is closed, increment unread count
    if (!this.isChatbotOpen) {
      this.unreadMessages++
    }

    // Save chat history
    this.saveChatHistory()
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isChatLoading || !this.selectedFarm) return

    // Add user message to chat
    const userMessage: ChatMessage = {
      text: this.currentMessage,
      sender: "user",
      timestamp: new Date(),
      farmId: this.selectedFarm.id,
    }

    this.chatMessages.push(userMessage)

    // Save chat history
    this.saveChatHistory()

    // Clear input field
    const messageText = this.currentMessage
    this.currentMessage = ""

    // Set loading state
    this.isChatLoading = true

    // Prepare context for the chatbot
    const context = this.prepareChatbotContext()

    // Call Gemini API for response
    this.geminiService.getChatbotResponse(messageText, context).subscribe({
      next: (response: string) => {
        // Add bot response to chat
        const botMessage: ChatMessage = {
          text: response,
          sender: "bot",
          timestamp: new Date(),
          farmId: this.selectedFarm?.id || "",
        }

        this.chatMessages.push(botMessage)
        this.isChatLoading = false

        // Save chat history
        this.saveChatHistory()
      },
      error: (error: any) => {
        console.error("Error getting chatbot response:", error)

        // Add error message
        const errorMessage: ChatMessage = {
          text: "I'm sorry, I encountered an error while processing your question. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          farmId: this.selectedFarm?.id || "",
        }

        this.chatMessages.push(errorMessage)
        this.isChatLoading = false

        // Save chat history
        this.saveChatHistory()
      },
    })
  }

  useQuestion(question: string): void {
    this.currentMessage = question
  }

  prepareChatbotContext(): string {
    // Create a context string with farm details and crop suggestions
    let context = ""

    if (this.selectedFarm) {
      context += `FARM DETAILS:\n`
      context += `Farm Name: ${this.selectedFarm.farmName}\n`
      context += `Size: ${this.selectedFarm.farmSize} acres\n`
      context += `Location: ${this.selectedFarm.location}\n`
      context += `Soil Type: ${this.selectedFarm.soilType}\n`
      context += `Yield Performance: ${this.selectedFarm.yieldPerformance}\n`
      context += `Crop History: ${this.selectedFarm.cropHistory}\n\n`
    }

    if (this.weatherData) {
      context += `WEATHER CONDITIONS:\n`
      context += `Temperature: ${this.weatherData.temperature}°C\n`
      context += `Rainfall: ${this.weatherData.rainfall} mm\n`
      context += `Humidity: ${this.weatherData.humidity}%\n`
      context += `Season: ${this.weatherData.season}\n`
      if (this.weatherData.forecast) {
        context += `Forecast: ${this.weatherData.forecast}\n`
      }
    }

    return context
  }
}