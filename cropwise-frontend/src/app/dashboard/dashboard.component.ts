import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"
import { NavbarComponent } from "../navbar/navbar.component"
import { trigger, transition, style, animate } from '@angular/animations'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faSeedling, faClipboardList, faLightbulb } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, NavbarComponent, FontAwesomeModule],
  template: `
    <div class="dashboard-container">
      <app-navbar></app-navbar>
      
      <div class="dashboard-content">
        <div class="welcome-section" [@fadeInDown]>
          <h1><fa-icon [icon]="faSeedling" class="welcome-icon"></fa-icon> Welcome to CropWise</h1>
          <p>Your smart farming assistant powered by AI</p>
          <p *ngIf="userEmail" class="user-info">Signed in as: <strong>{{ userEmail }}</strong></p>
        </div>
        
        <div class="dashboard-cards">
          <div class="card" (click)="navigateTo('/farm-form')" [@fadeInUp]="{value: '', params: {delay: '0.1s'}}">
            <div class="card-icon"><fa-icon [icon]="faClipboardList"></fa-icon></div>
            <h3>Farm Form</h3>
            <p>Add or update your farm details</p>
          </div>
          
          <div class="card" (click)="navigateTo('/crop-suggestions')" [@fadeInUp]="{value: '', params: {delay: '0.3s'}}">
            <div class="card-icon"><fa-icon [icon]="faLightbulb"></fa-icon></div>
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
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
      position: relative;
      z-index: 1;
    }
    
    .dashboard-container::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: url('https://www.transparenttextures.com/patterns/diamond-upholstery.png');
      opacity: 0.08;
      z-index: 0;
      pointer-events: none;
    }
    
    .dashboard-content {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      position: relative;
      z-index: 1;
      padding-top: 8rem;
    }
    
    @media (min-width: 1024px) {
      .dashboard-content {
        padding-top: 12rem;
      }
      
      .card {
        padding: 50px 30px 40px 30px;
      }
      
      .card-icon {
        margin-bottom: 30px;
      }
      
      .card h3 {
        margin-bottom: 20px;
      }
    }
    
    @media (min-width: 1440px) {
      .dashboard-content {
        padding-top: 16rem;
      }
      
      .card {
        padding: 60px 30px 50px 30px;
      }
      
      .card-icon {
        margin-bottom: 35px;
      }
      
      .card h3 {
        margin-bottom: 25px;
      }
    }
    
    .welcome-section {
      text-align: center;
      margin-bottom: 40px;
      animation: fadeInDown 0.7s;
    }
    
    .welcome-section h1 {
      color: #2c3e50;
      font-size: 2.5rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    
    .welcome-icon {
      color: #27ae60;
      font-size: 2.2rem;
      vertical-align: middle;
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
      font-size: 1rem;
      color: #2c3e50;
      box-shadow: 0 2px 8px rgba(39, 174, 96, 0.07);
    }
    
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 30px auto;
      max-width: 900px;
    }
    
    .card {
      background: white;
      border-radius: 16px;
      padding: 36px 30px 30px 30px;
      box-shadow: 0 4px 24px rgba(39, 174, 96, 0.08), 0 1.5px 6px rgba(44, 62, 80, 0.04);
      text-align: center;
      cursor: pointer;
      transition: transform 0.25s cubic-bezier(.4,2,.3,1), box-shadow 0.25s;
      position: relative;
      overflow: hidden;
      border: 1.5px solid #e0e0e0;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(120deg, rgba(39,174,96,0.07) 0%, rgba(46,204,113,0.04) 100%);
      opacity: 0.7;
      z-index: 0;
      pointer-events: none;
    }
    
    .card:hover {
      transform: translateY(-8px) scale(1.03);
      box-shadow: 0 10px 32px rgba(39, 174, 96, 0.18), 0 2px 8px rgba(44, 62, 80, 0.08);
      border-color: #27ae60;
    }
    
    .card-icon {
      font-size: 2.5rem;
      color: #27ae60;
      margin-bottom: 18px;
      z-index: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .card h3 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 1.3rem;
      font-weight: 600;
      z-index: 1;
      position: relative;
    }
    
    .card p {
      color: #7f8c8d;
      z-index: 1;
      position: relative;
      margin: 0;
    }
    
    @media (max-width: 1024px) {
      .dashboard-cards {
        max-width: 800px;
        padding: 0 20px;
      }
    }
    
    @media (max-width: 768px) {
      .dashboard-content {
        padding-top: 6rem;
      }
      
      .welcome-section h1 {
        font-size: 2rem;
      }
      
      .welcome-section p {
        font-size: 1.1rem;
      }
      
      .dashboard-cards {
        gap: 20px;
        padding: 0 15px;
      }
      
      .card {
        padding: 30px 20px;
      }
    }
    
    @media (max-width: 480px) {
      .dashboard-content {
        padding-top: 5rem;
      }
      
      .welcome-section h1 {
        font-size: 1.8rem;
      }
      
      .welcome-section p {
        font-size: 1rem;
      }
      
      .dashboard-cards {
        grid-template-columns: 1fr;
        max-width: 400px;
        gap: 15px;
        padding: 0 10px;
      }
      
      .card {
        padding: 25px 15px;
      }
      
      .card-icon {
        font-size: 2rem;
      }
      
      .card h3 {
        font-size: 1.2rem;
      }
    }
    
    /* Animations */
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    `,
  ],
  animations: [
    trigger('fadeInDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('0.7s cubic-bezier(.4,2,.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.7s 0.1s cubic-bezier(.4,2,.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  userEmail: string | null = null
  faSeedling = faSeedling;
  faClipboardList = faClipboardList;
  faLightbulb = faLightbulb;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    console.log("Dashboard component initialized")

    try {
      // Get current user using the Promise-based method
      const user = await this.authService.getCurrentUser()

      if (user) {
        console.log("User found in dashboard:", user.email)
        this.userEmail = user.email
      } else {
        console.log("No user found in dashboard")
        this.router.navigate(["/login"])
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      this.router.navigate(["/login"])
    }
  }

  navigateTo(path: string): void {
    console.log("Navigating to:", path)
    this.router.navigate([path])
  }
}
