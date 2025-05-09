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
  isSignUp = false
  isLoading = false
  errorMessage = ""

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.authForm = this.createForm()
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.currentUser) {
      this.router.navigate(["/dashboard"])
    }
  }

  createForm(): FormGroup {
    return this.fb.group(
      {
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: [""],
      },
      { validator: this.passwordMatchValidator },
    )
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get("password")?.value
    const confirmPassword = g.get("confirmPassword")?.value

    if (password === confirmPassword || !confirmPassword) {
      return null
    }

    return { mismatch: true }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const { email, password } = this.authForm.value

    if (this.isSignUp) {
      this.authService
        .register(email, password)
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
}
