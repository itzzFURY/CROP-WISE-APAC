import { Injectable } from "@angular/core"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
} from "firebase/auth"
import { app } from "./firebase.config"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private auth = getAuth(app)

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

  async register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      return userCredential.user
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

  get currentUser() {
    return this.auth.currentUser
  }

  // Add a method to check if user is authenticated
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null
  }

  // Add a method to get the current user as a Promise
  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe()
        resolve(user)
      }, reject)
    })
  }
}
