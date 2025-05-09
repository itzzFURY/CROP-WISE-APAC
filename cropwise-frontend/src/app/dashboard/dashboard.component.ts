import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"
import { NavbarComponent } from "../navbar/navbar.component"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <div class="dashboard-container">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <div class="welcome-section">
          <h1>Welcome to CropWise</h1>
          <p>Your smart farming assistant powered by AI</p>
          <p *ngIf="userEmail" class="user-info">Signed in as: <strong>{{ userEmail }}</strong></p>
        </div>
        
        <div class="dashboard-cards">
          <div class="card" (click)="navigateTo('/farm-form')">
            <div class="card-icon">📝</div>
            <h3>Farm Form</h3>
            <p>Add or update your farm details</p>
          </div>
          
          <div class="card" (click)="navigateTo('/crop-suggestions')">
            <div class="card-icon">🌱</div>
            <h3>Crop Suggestions</h3>
            <p>Get AI-powered crop recommendations</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f7fa;
    }
    
    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .welcome-section {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .welcome-section h1 {
      color: #2c3e50;
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    
    .welcome-section p {
      color: #7f8c8d;
      font-size: 1.2rem;
      margin-bottom: 5px;
    }
    
    .user-info {
      background-color: #e8f4fc;
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      margin-top: 10px;
    }
    
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 30px;
    }
    
    .card {
      background-color: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      text-align: center;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .card-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }
    
    .card h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    
    .card p {
      color: #7f8c8d;
    }
  `,
  ],
})
export class DashboardComponent implements OnInit {
  userEmail: string | null = null

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    console.log("Dashboard component initialized")
    const user = this.authService.currentUser
    if (user) {
      console.log("User found in dashboard:", user.email)
      this.userEmail = user.email
    } else {
      console.log("No user found in dashboard")
    }
  }

  navigateTo(path: string): void {
    console.log("Navigating to:", path)
    this.router.navigate([path])
  }
}
