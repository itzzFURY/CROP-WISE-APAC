import { Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { getAuth } from "firebase/auth"
import { getFirestore, doc } from "firebase/firestore"
import { getStorage, ref } from "firebase/storage"
import { app } from "./firebase.config"
import { HttpClientModule } from "@angular/common/http"
import { CommonModule } from "@angular/common"

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [
    `
    :host {
      display: block;
      min-height: 100vh;
    }
  `,
  ],
})
export class AppComponent {
  title = "cropwise-frontend"

  // Use these as class properties
  user = auth.currentUser
  docRef = doc(db, "collection", "docId")
  storageRef = ref(storage, "path/to/file")
}
