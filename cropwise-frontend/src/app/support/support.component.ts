import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NavbarComponent } from "../navbar/navbar.component"
import { AuthService } from "../auth.service"
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser"
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { 
  faHeadset,
  faQuestionCircle,
  faChevronUp,
  faChevronDown,
  faEnvelope,
  faPhone,
  faComments,
  faBug
} from '@fortawesome/free-solid-svg-icons'

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: "app-support",
  standalone: true,
  imports: [CommonModule, NavbarComponent, FontAwesomeModule],
  templateUrl: "./support.component.html",
  styleUrls: ["./support.component.css"],
})
export class SupportComponent implements OnInit {
  userEmail: string | null = null
  username: string | null = null
  googleFormUrl: SafeResourceUrl

  // Font Awesome Icons
  faHeadset = faHeadset
  faQuestionCircle = faQuestionCircle
  faChevronUp = faChevronUp
  faChevronDown = faChevronDown
  faEnvelope = faEnvelope
  faPhone = faPhone
  faComments = faComments
  faBug = faBug

  // FAQ Data
  faqs: FAQ[] = [
    {
      question: "How do I add a new farm?",
      answer: "To add a new farm, go to the Farm Management page and click the 'Add New Farm' button. Fill in the required information about your farm, including name, size, location, and soil type.",
      isOpen: false
    },
    {
      question: "How do I update my account information?",
      answer: "You can update your account information by going to the Account Settings page. There you can change your username and password.",
      isOpen: false
    },
    {
      question: "What types of crops can I get suggestions for?",
      answer: "CropWise provides suggestions for a wide variety of crops including grains, vegetables, fruits, and legumes. The suggestions are based on your farm's location, soil type, and climate conditions.",
      isOpen: false
    },
    {
      question: "How accurate are the crop suggestions?",
      answer: "Our crop suggestions are based on scientific data and local agricultural practices. However, we recommend consulting with local agricultural experts for the most accurate advice for your specific situation.",
      isOpen: false
    },
    {
      question: "Can I export my farm data?",
      answer: "Yes, you can export your farm data in various formats including PDF and CSV. Go to the Farm Management page and use the export option in the farm details section.",
      isOpen: false
    }
  ]

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

  toggleFaq(faq: FAQ): void {
    faq.isOpen = !faq.isOpen
  }
}
