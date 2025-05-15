import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  authForm: FormGroup
  resetForm: FormGroup
  isSignUp = false
  isLoading = false
  errorMessage = ""
  showResetForm = false
  resetSuccess = false
  resetError = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.authForm = this.createAuthForm()
    this.resetForm = this.createResetForm()
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.currentUser) {
      this.router.navigate(["/dashboard"])
    }
  }

  createAuthForm(): FormGroup {
    return this.fb.group(
      {
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        username: ["", this.isSignUp ? Validators.required : null],
        confirmPassword: [""],
      },
      { validator: this.passwordMatchValidator },
    )
  }

  createResetForm(): FormGroup {
    return this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get("password")?.value
    const confirmPassword = g.get("confirmPassword")?.value

    if (password === confirmPassword || !confirmPassword) {
      return null
    }

    return { mismatch: true }
  }

  // Toggle between login and signup
  toggleSignUp(value: boolean): void {
    this.isSignUp = value

    // Update validators based on form type
    const usernameControl = this.authForm.get("username")
    if (usernameControl) {
      if (this.isSignUp) {
        usernameControl.setValidators(Validators.required)
      } else {
        usernameControl.clearValidators()
      }
      usernameControl.updateValueAndValidity()
    }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const { email, password, username } = this.authForm.value

    if (this.isSignUp) {
      this.authService
        .register(email, password, username)
        .then((user) => {
          this.isLoading = false
          this.router.navigate(["/dashboard"])
        })
        .catch((error) => {
          this.isLoading = false
          this.errorMessage = error.message || "Registration failed. Please try again."
        })
    } else {
      this.authService
        .login(email, password)
        .then((user) => {
          this.isLoading = false
          this.router.navigate(["/dashboard"])
        })
        .catch((error) => {
          this.isLoading = false
          this.errorMessage = error.message || "Login failed. Please check your credentials."
        })
    }
  }

  signInWithGoogle(): void {
    this.isLoading = true
    this.errorMessage = ""

    this.authService
      .signInWithGoogle()
      .then((user) => {
        this.isLoading = false
        this.router.navigate(["/dashboard"])
      })
      .catch((error) => {
        this.isLoading = false
        this.errorMessage = error.message || "Google sign-in failed. Please try again."
      })
  }

  onResetSubmit(): void {
    if (this.resetForm.invalid) {
      return
    }

    this.isLoading = true
    this.resetSuccess = false
    this.resetError = false
    this.errorMessage = ""

    const { email } = this.resetForm.value

    this.authService
      .sendPasswordResetEmail(email)
      .then(() => {
        this.isLoading = false
        this.resetSuccess = true

        // Clear the form
        this.resetForm.reset()

        // After 5 seconds, go back to login
        setTimeout(() => {
          this.showResetForm = false
          this.resetSuccess = false
        }, 5000)
      })
      .catch((error) => {
        this.isLoading = false
        this.resetError = true
        this.errorMessage = error.message || "Failed to send password reset email. Please try again."
      })
  }
}
