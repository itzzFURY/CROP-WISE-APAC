import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { HttpClient, HttpClientModule } from "@angular/common/http"
import { NavbarComponent } from "../navbar/navbar.component"
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

@Component({
  selector: "app-farm-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, NavbarComponent],
  templateUrl: "./farm-form.component.html",
  styleUrls: ["./farm-form.component.css"],
})
export class FarmFormComponent implements OnInit {
  farmForm!: FormGroup
  userId: string | null = null
  soilTypes = ["Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky", "Other"]
  submitSuccess = false
  submitError = false
  errorMessage = ""
  successMessage = ""
  http: HttpClient
  farms: Farm[] = []
  loading = true // Start with loading state
  showForm = false // Start with list view, not form
  isEditing = false
  currentFarmId: string | null = null

  constructor(
    private fb: FormBuilder,
    httpClient: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {
    this.http = httpClient
    this.initForm()
  }

  initForm(): void {
    this.farmForm = this.fb.group({
      farmName: ["", Validators.required],
      farmSize: ["", [Validators.required, Validators.min(0.1)]],
      location: ["", Validators.required],
      latitude: [""],
      longitude: [""],
      soilType: ["", Validators.required],
      yieldPerformance: ["", Validators.required],
      cropHistory: ["", Validators.required],
    })
  }

  async ngOnInit(): Promise<void> {
    console.log("Farm Form Component initialized, showForm =", this.showForm)

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

    this.loading = true
    this.showForm = false // Ensure we're showing the list view

    console.log("Loading farms for user:", this.userId)

    this.http.get<Farm[]>(`http://localhost:5000/api/farm-data/${this.userId}`).subscribe({
      next: (farms) => {
        console.log("Farms loaded:", farms)
        this.farms = farms
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading farms:", error)
        this.errorMessage = "Failed to load farms. Please try again."
        this.loading = false
        this.submitError = true
      },
    })
  }

  // Rest of the component remains the same...
  showAddFarmForm(): void {
    console.log("Showing add farm form")
    this.isEditing = false
    this.currentFarmId = null
    this.initForm() // Reset form
    this.showForm = true
  }

  editFarm(farm: Farm): void {
    console.log("Editing farm:", farm)
    this.isEditing = true
    this.currentFarmId = farm.id

    // Populate form with farm data
    this.farmForm.patchValue({
      farmName: farm.farmName,
      farmSize: farm.farmSize,
      location: farm.location,
      latitude: farm.latitude,
      longitude: farm.longitude,
      soilType: farm.soilType,
      yieldPerformance: farm.yieldPerformance,
      cropHistory: farm.cropHistory,
    })

    this.showForm = true
  }

  deleteFarm(farm: Farm): void {
    if (confirm(`Are you sure you want to delete ${farm.farmName}?`)) {
      console.log("Deleting farm:", farm)

      // We need to pass the userId as a query parameter
      this.http.delete(`http://localhost:5000/api/farm-data/${farm.id}?userId=${this.userId}`).subscribe({
        next: () => {
          console.log("Farm deleted successfully")
          this.successMessage = `Farm "${farm.farmName}" deleted successfully`
          this.submitSuccess = true
          setTimeout(() => {
            this.submitSuccess = false
          }, 3000)
          // Remove farm from local array
          this.farms = this.farms.filter((f) => f.id !== farm.id)
        },
        error: (error) => {
          console.error("Error deleting farm:", error)
          this.errorMessage = "Failed to delete farm. Please try again."
          this.submitError = true
        },
      })
    }
  }

  cancelForm(): void {
    console.log("Canceling form, returning to list view")
    this.showForm = false
    this.isEditing = false
    this.currentFarmId = null
    this.initForm() // Reset form
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          // Store latitude and longitude in the form
          this.farmForm.patchValue({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          })

          // Use Google Maps API to get formatted address
          this.http
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCcc6zOYLbxuISNgPKpHgAjzQZ8MJcBziM`,
            )
            .subscribe({
              next: (response: any) => {
                if (response.results && response.results.length > 0) {
                  const formattedAddress = response.results[0].formatted_address
                  this.farmForm.patchValue({ location: formattedAddress })
                  console.log("Location set to:", formattedAddress)
                } else {
                  // If geocoding fails, just use coordinates
                  this.farmForm.patchValue({ location: `${latitude}, ${longitude}` })
                  console.log("Location set to coordinates:", `${latitude}, ${longitude}`)
                }
              },
              error: (error: any) => {
                console.error("Error getting address:", error)
                // Fallback to coordinates
                this.farmForm.patchValue({ location: `${latitude}, ${longitude}` })
                console.log("Location set to coordinates after error:", `${latitude}, ${longitude}`)
              },
            })
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

      // Clear previous messages
      this.submitSuccess = false
      this.submitError = false

      if (this.isEditing && this.currentFarmId) {
        // Update existing farm
        console.log("Updating farm:", this.currentFarmId)
        this.http.put(`http://localhost:5000/api/farm-data/${this.currentFarmId}`, formData).subscribe({
          next: (response: any) => {
            console.log("Farm data updated successfully:", response)
            this.successMessage = "Farm updated successfully"
            this.submitSuccess = true
            this.loadFarms() // Refresh farms list

            // Reset form and go back to list view after a delay
            setTimeout(() => {
              this.showForm = false
              this.isEditing = false
              this.currentFarmId = null
              this.initForm()
            }, 1500)
          },
          error: (error: { message: string }) => {
            console.error("Error updating farm data:", error)
            this.submitError = true
            this.errorMessage = error.message || "Failed to update farm data. Please try again."
          },
        })
      } else {
        // Create new farm
        console.log("Creating new farm")
        this.http.post("http://localhost:5000/api/farm-data", formData).subscribe({
          next: (response: any) => {
            console.log("Farm data saved successfully:", response)
            this.successMessage = "Farm added successfully"
            this.submitSuccess = true
            this.loadFarms() // Refresh farms list

            // Reset form and go back to list view after a delay
            setTimeout(() => {
              this.showForm = false
              this.initForm()
            }, 1500)
          },
          error: (error: { message: string }) => {
            console.error("Error saving farm data:", error)
            this.submitError = true
            this.errorMessage = error.message || "Failed to save farm data. Please try again."
          },
        })
      }
    }
  }
}
