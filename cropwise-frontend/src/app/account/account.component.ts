import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { NavbarComponent } from "../navbar/navbar.component"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"

@Component({
  selector: "app-account",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.css"],
})
export class AccountComponent implements OnInit {
  usernameForm: FormGroup
  passwordForm: FormGroup

  userEmail: string | null = null
  username: string | null = null

  isLoadingUsername = false
  isLoadingPassword = false

  usernameSuccess = false
  passwordSuccess = false

  usernameError = ""
  passwordError = ""

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.usernameForm = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(3)]],
    })

    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required, Validators.minLength(6)]],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validator: this.passwordMatchValidator },
    )
  }

  async ngOnInit(): Promise<void> {
    try {
      // Get current user using the Promise-based method
      const user = await this.authService.getCurrentUser()

      if (user) {
        console.log("User found in account:", user.email)
        this.userEmail = user.email
        this.username = user.displayName

        // Set initial username value in form
        this.usernameForm.patchValue({
          username: this.username,
        })
      } else {
        console.log("No user found in account")
        this.router.navigate(["/login"])
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      this.router.navigate(["/login"])
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get("newPassword")?.value
    const confirmPassword = g.get("confirmPassword")?.value

    if (newPassword === confirmPassword) {
      return null
    }

    return { mismatch: true }
  }

  onUsernameSubmit(): void {
    if (this.usernameForm.invalid) {
      return
    }

    this.isLoadingUsername = true
    this.usernameSuccess = false
    this.usernameError = ""

    const { username } = this.usernameForm.value

    try {
      this.authService.updateUsername(username);
      this.isLoadingUsername = false;
      this.usernameSuccess = true;
      this.username = username;

      // Reset success message after 3 seconds
      setTimeout(() => {
        this.usernameSuccess = false;
      }, 3000);
    } catch (error: any) {
      this.isLoadingUsername = false;
      this.usernameError = error.message || "Failed to update username. Please try again.";
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      return
    }

    this.isLoadingPassword = true
    this.passwordSuccess = false
    this.passwordError = ""

    const { newPassword, currentPassword } = this.passwordForm.value

    // First, reauthenticate the user with their current password
    // For simplicity, we're just updating the password directly
    // In a real app, you would need to reauthenticate first
    try {
      this.authService.updateUserPassword(newPassword);
      this.isLoadingPassword = false;
      this.passwordSuccess = true;

      // Reset form
      this.passwordForm.reset();

      // Reset success message after 3 seconds
      setTimeout(() => {
        this.passwordSuccess = false;
      }, 3000);
    } catch (error: any) {
      this.isLoadingPassword = false;
      this.passwordError = error.message || "Failed to update password. Please try again.";
    }
  }
}
