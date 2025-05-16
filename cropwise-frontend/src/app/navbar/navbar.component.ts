import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterModule } from "@angular/router"
import { AuthService } from "../auth.service"
import { trigger, transition, style, animate, state } from '@angular/animations'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faBars, faTimes, faHome, faLeaf, faLightbulb, faUser, faHeadset, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  template: `
    <nav class="navbar" [class.mobile-menu-open]="isMobileMenuOpen">
      <div class="navbar-brand">
        <fa-icon [icon]="faLeaf" class="brand-icon"></fa-icon>
        <span (click)="navigateTo('/dashboard')" class="brand-name">CropWise</span>
      </div>
      
      <button class="hamburger" (click)="toggleMobileMenu()" [class.active]="isMobileMenuOpen">
        <fa-icon [icon]="isMobileMenuOpen ? faTimes : faBars"></fa-icon>
      </button>
      
      <div class="navbar-menu" [class.active]="isMobileMenuOpen">
        <button class="nav-button" 
                [routerLink]="['/dashboard']" 
                routerLinkActive="active"
                (click)="closeMenu()">
          <fa-icon [icon]="faHome"></fa-icon>
          <span>Dashboard</span>
        </button>
        <button class="nav-button" 
                [routerLink]="['/farm-form']" 
                routerLinkActive="active"
                (click)="closeMenu()">
          <fa-icon [icon]="faLeaf"></fa-icon>
          <span>Farm Form</span>
        </button>
        <button class="nav-button" 
                [routerLink]="['/crop-suggestions']" 
                routerLinkActive="active"
                (click)="closeMenu()">
          <fa-icon [icon]="faLightbulb"></fa-icon>
          <span>Crop Suggestions</span>
        </button>
        <button class="nav-button" 
                [routerLink]="['/account']" 
                routerLinkActive="active"
                (click)="closeMenu()">
          <fa-icon [icon]="faUser"></fa-icon>
          <span>Account</span>
        </button>
        <button class="nav-button" 
                [routerLink]="['/support']" 
                routerLinkActive="active"
                (click)="closeMenu()">
          <fa-icon [icon]="faHeadset"></fa-icon>
          <span>Support</span>
        </button>
        <button class="nav-button logout" (click)="logout()">
          <fa-icon [icon]="faSignOutAlt"></fa-icon>
          <span>Logout</span>
        </button>
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
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      transition: all 0.3s ease;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
      width: 100%;
      margin: 0 auto;
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .navbar-brand:hover {
      transform: scale(1.05);
    }
    
    .brand-icon {
      font-size: 1.8rem;
      color: white;
      transition: transform 0.3s ease;
    }
    
    .navbar-brand:hover .brand-icon {
      transform: rotate(15deg);
    }
    
    .brand-name {
      font-size: 1.5rem;
      font-weight: 700;
      transition: color 0.3s ease;
    }
    
    .navbar-brand:hover .brand-name {
      color: #e8f4fc;
    }
    
    .navbar-menu {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .nav-button {
      background-color: transparent;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      overflow: hidden;
    }
    
    .nav-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    
    .nav-button:hover::before {
      transform: translateX(0);
    }
    
    .nav-button fa-icon {
      font-size: 1.1rem;
      transition: transform 0.3s ease;
    }
    
    .nav-button:hover fa-icon {
      transform: scale(1.2);
    }
    
    .nav-button span {
      position: relative;
      z-index: 1;
    }
    
    .nav-button.active {
      background-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .nav-button.active::before {
      transform: translateX(0);
    }
    
    .logout {
      background-color: rgba(220, 53, 69, 0.9);
      margin-left: 10px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .logout:hover {
      background-color: rgba(220, 53, 69, 1);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .logout fa-icon {
      color: white;
    }

    .logout span {
      font-weight: 500;
    }
    
    .hamburger {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 5px;
      transition: transform 0.3s ease;
    }
    
    .hamburger:hover {
      transform: scale(1.1);
    }
    
    .hamburger.active {
      transform: rotate(90deg);
    }
    
    @media (max-width: 768px) {
      .navbar {
        border-radius: 0;
        width: 100%;
        margin: 0;
        padding: 12px 20px;
      }
      
      .hamburger {
        display: block;
        z-index: 1000;
      }
      
      .navbar-menu {
        position: fixed;
        top: 0;
        right: -100%;
        width: 80%;
        max-width: 300px;
        height: 100vh;
        background-color: #27ae60;
        flex-direction: column;
        padding: 80px 20px 20px;
        transition: right 0.3s ease;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
        z-index: 999;
      }
      
      .navbar-menu.active {
        right: 0;
      }
      
      .nav-button {
        width: 100%;
        justify-content: flex-start;
        padding: 12px 15px;
        border-radius: 12px;
      }
      
      .nav-button fa-icon {
        width: 20px;
      }
      
      .nav-button.active {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateX(10px);
      }
      
      .mobile-menu-open::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: -1;
      }
    }
    
    @media (max-width: 480px) {
      .brand-name {
        font-size: 1.2rem;
      }
      
      .brand-icon {
        font-size: 1.5rem;
      }
      
      .navbar {
        padding: 12px 20px;
      }
    }
    `,
  ],
})
export class NavbarComponent {
  isMobileMenuOpen = false;
  
  // Font Awesome icons
  faBars = faBars;
  faTimes = faTimes;
  faHome = faHome;
  faLeaf = faLeaf;
  faLightbulb = faLightbulb;
  faUser = faUser;
  faHeadset = faHeadset;
  faSignOutAlt = faSignOutAlt;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu(): void {
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  logout(): void {
    this.authService
      .logout()
      .then(() => {
        this.router.navigate(["/login"]);
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  }
}
