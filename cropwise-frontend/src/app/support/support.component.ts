import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NavbarComponent } from "../navbar/navbar.component"
import { AuthService } from "../auth.service"
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser"

@Component({
  selector: "app-support",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: "./support.component.html",
  styleUrls: ["./support.component.css"],
})
export class SupportComponent implements OnInit {
  userEmail: string | null = null
  username: string | null = null
  googleFormUrl: SafeResourceUrl

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer,
  ) {
    // Google Form URL - replace with your actual form URL
    // This form URL is sanitized to prevent XSS attacks
    this.googleFormUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://docs.google.com/forms/d/e/1FAIpQLSfL0A_fOsmjKkuOcT2lWjxALqORz6TImKAg0hyGrzH91c7vZw/viewform?usp=header",
    )
  }

  async ngOnInit(): Promise<void> {
    try {
      // Get current user using the Promise-based method
      const user = await this.authService.getCurrentUser()

      if (user) {
        this.userEmail = user.email
        this.username = user.displayName
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
    }
  }
}
