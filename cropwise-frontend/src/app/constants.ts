/**
 * Application-wide constants
 */

// API URLs
export const API_CONFIG = {
  // Base URL for API endpoints
  BASE_URL: "https://crop-wise-20182939470.australia-southeast2.run.app/",

  // API endpoints
  ENDPOINTS: {
    // Farm data endpoints
    FARM_DATA: "/api/farm-data",
    FARM_DATA_BY_ID: (userId: string) => `/api/farm-data/${userId}`,
    FARM_DATA_UPDATE: (farmId: string) => `/api/farm-data/${farmId}`,
    FARM_DATA_DELETE: (farmId: string) => `/api/farm-data/${farmId}`,

    // Crop suggestions endpoints
    CROP_SUGGESTIONS: "/api/crop-suggestions",
    SAVED_SUGGESTIONS: "/api/saved-suggestions",
    SAVED_SUGGESTIONS_BY_ID: (farmId: string) => `/api/saved-suggestions/${farmId}`,

    // Chatbot endpoints
    CHATBOT: "/api/chatbot",
    CHAT_HISTORY: (userId: string) => `/api/chat-history/${userId}`,
  },
}

// Environment configuration
export const ENV_CONFIG = {
  // Is this a production environment?
  IS_PRODUCTION: false,

  // Version information
  APP_VERSION: "1.0.0",
}

// Feature flags
export const FEATURES = {
  ENABLE_GOOGLE_AUTH: true,
  ENABLE_CHATBOT: true,
}
