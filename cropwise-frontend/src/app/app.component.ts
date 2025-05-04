import { Component } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';
import { app } from './firebase.config';
import { LoginComponent } from './login/login.component';

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cropwise-frontend';

  // Use these as class properties
  user = auth.currentUser;
  docRef = doc(db, 'collection', 'docId');
  storageRef = ref(storage, 'path/to/file');
}