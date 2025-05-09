import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span (click)="navigateTo('/dashboard')" class="brand-name">CropWise</span>
      </div>
      
      <div class="navbar-menu">
        <button class="nav-button" (click)="navigateTo('/dashboard')">Dashboard</button>
        <button class="nav-button" (click)="navigateTo('/farm-form')">Farm Form</button>
        <button class="nav-button" (click)="navigateTo('/crop-suggestions')">Crop Suggestions</button>
        <button class="nav-button logout" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [
    `
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #27ae60;
      padding: 15px 30px;
      color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
    }
    
    .brand-name {
      font-size: 1.5rem;
      font-weight: 700;
      cursor: pointer;
    }
    
    .navbar-menu {
      display: flex;
      gap: 10px;
    }
    
    .nav-button {
      background-color: transparent;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }
    
    .nav-button:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .logout {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .logout:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        padding: 15px;
      }
      
      .navbar-brand {
        margin-bottom: 15px;
      }
      
      .navbar-menu {
        width: 100%;
        flex-wrap: wrap;
      }
      
      .nav-button {
        flex: 1;
        min-width: 120px;
        text-align: center;
      }
    }
  `,
  ],
})
export class NavbarComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  navigateTo(path: string): void {
    console.log("Navigating to:", path)
    this.router.navigate([path])
  }

  logout(): void {
    this.authService
      .logout()
      .then(() => {
        console.log("Logged out successfully")
        this.router.navigate(["/login"])
      })
      .catch((error) => {
        console.error("Logout error:", error)
      })
  }
}
