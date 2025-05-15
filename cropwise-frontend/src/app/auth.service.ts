import { Injectable } from "@angular/core"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { getDatabase, ref, set, get } from "firebase/database"
import { app } from "./firebase.config"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private auth = getAuth(app)
  private database = getDatabase(app)
  private googleProvider = new GoogleAuthProvider()

  constructor() {
    // Set persistence to LOCAL (persists even when browser is closed)
    setPersistence(this.auth, browserLocalPersistence)
      .then(() => {
        console.log("Firebase persistence set to LOCAL")
      })
      .catch((error) => {
        console.error("Error setting persistence:", error)
      })
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  async register(email: string, password: string, username: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user

      // Set the display name (username)
      await updateProfile(user, {
        displayName: username,
      })

      // Save additional user data to the database
      await this.saveUserData(user.uid, {
        email: email,
        username: username,
        createdAt: new Date().toISOString(),
      })

      return user
    } catch (error) {
      throw error
    }
  }

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider)
      const user = result.user

      // Check if this is a new user
      const userRef = ref(this.database, `users/${user.uid}`)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        // This is a new user, save their data
        await this.saveUserData(user.uid, {
          email: user.email,
          username: user.displayName || `User${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date().toISOString(),
          authProvider: "google",
        })
      }

      return user
    } catch (error) {
      throw error
    }
  }

  async logout() {
    try {
      await signOut(this.auth)
    } catch (error) {
      throw error
    }
  }

  // Add password reset functionality
  async sendPasswordResetEmail(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email)
      return true
    } catch (error) {
      throw error
    }
  }

  // Update username
  async updateUsername(username: string) {
    try {
      const user = this.auth.currentUser
      if (!user) throw new Error("No authenticated user")

      await updateProfile(user, {
        displayName: username,
      })

      // Update username in database
      await this.updateUserData(user.uid, { username })

      return true
    } catch (error) {
      throw error
    }
  }

  // Update password
  async updateUserPassword(newPassword: string) {
    try {
      const user = this.auth.currentUser
      if (!user) throw new Error("No authenticated user")

      await updatePassword(user, newPassword)
      return true
    } catch (error) {
      throw error
    }
  }

  // Save user data to database
  private async saveUserData(userId: string, data: any) {
    try {
      const userRef = ref(this.database, `users/${userId}`)
      await set(userRef, data)
      return true
    } catch (error) {
      console.error("Error saving user data:", error)
      throw error
    }
  }

  // Update user data in database
  private async updateUserData(userId: string, data: any) {
    try {
      // Get current data first
      const userRef = ref(this.database, `users/${userId}`)
      const snapshot = await get(userRef)
      const currentData = snapshot.val() || {}

      // Update with new data
      await set(userRef, {
        ...currentData,
        ...data,
        updatedAt: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error("Error updating user data:", error)
      throw error
    }
  }

  get currentUser() {
    return this.auth.currentUser
  }

  // Add a method to check if user is authenticated
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null
  }

  // Add a method to get the current user as a Promise
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe()
        resolve(user)
      }, reject)
    })
  }
}
