import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { getAuth } from "firebase/auth"
import { getDatabase, ref, push, set } from "firebase/database"
import { app } from "../firebase.config"
import { HttpClient, HttpClientModule } from "@angular/common/http"  // Changed type to actual import

@Component({
  selector: "app-farm-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: "./farm-form.component.html",
  styleUrls: ["./farm-form.component.css"],
})
export class FarmFormComponent implements OnInit {
  farmForm: FormGroup
  auth = getAuth(app)
  database = getDatabase(app)
  userId: string | null = null
  soilTypes = ["Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky", "Other"]
  submitSuccess = false
  submitError = false
  errorMessage = ""
  http: HttpClient  // Changed type to HttpClient

  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient  // Inject HttpClient here
  ) {
    this.http = httpClient;  // Assign the injected HttpClient to the http property
    this.farmForm = this.fb.group({
      farmName: ["", Validators.required],
      farmSize: ["", [Validators.required, Validators.min(0.1)]],
      location: ["", Validators.required],
      soilType: ["", Validators.required],
      yieldPerformance: ["", Validators.required],
      cropHistory: ["", Validators.required],
    })
  }

  ngOnInit(): void {
    // Get current user ID
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userId = user.uid
      }
    })
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
  
          // Use Google Maps API to get formatted address
          this.http
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCcc6zOYLbxuISNgPKpHgAjzQZ8MJcBziM`,
            )
            .subscribe({
              next: (response: any) => {
                if (response.results && response.results.length > 0) {
                  const formattedAddress = response.results[0].formatted_address;
                  this.farmForm.patchValue({ location: formattedAddress });
                  console.log("Location set to:", formattedAddress);
                } else {
                  // If geocoding fails, just use coordinates
                  this.farmForm.patchValue({ location: `${latitude}, ${longitude}` });
                  console.log("Location set to coordinates:", `${latitude}, ${longitude}`);
                }
              },
              error: (error: any) => {
                console.error("Error getting address:", error);
                // Fallback to coordinates
                this.farmForm.patchValue({ location: `${latitude}, ${longitude}` });
                console.log("Location set to coordinates after error:", `${latitude}, ${longitude}`);
              },
            });
          
          // IMPORTANT: Remove this line as it overrides the async result from Google Maps API
          // this.farmForm.patchValue({ location: `${latitude}, ${longitude}` })
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please enter it manually.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  onSubmit(): void {
    if (this.farmForm.valid && this.userId) {
      const formData = {
        ...this.farmForm.value,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      }

      // Option 1: Send data to Flask backend
      // Uncomment this section when your Flask backend is ready
      this.http.post("http://localhost:5000/api/farm-data", formData).subscribe({
        next: (response: any) => {
          console.log("Farm data saved successfully:", response);
          this.submitSuccess = true;
          this.submitError = false;
          this.farmForm.reset();

          // Reset success message after 3 seconds
          setTimeout(() => {
            this.submitSuccess = false;
          }, 3000);
        },
        error: (error: { message: string }) => {
          console.error("Error saving farm data:", error);
          this.submitError = true;
          this.errorMessage = error.message || "Failed to save farm data. Please try again.";
        },
      });
    }
  }
}
