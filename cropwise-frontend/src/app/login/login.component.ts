import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <h2>{{isLoggedIn ? 'Welcome, ' + currentUser?.email : 'Login'}}</h2>
      
      @if (!isLoggedIn) {
        <div class="form-container">
          <button (click)="showLogin = !showLogin" class="toggle-button">
            {{showLogin ? 'Create Account' : 'Back to Login'}}
          </button>
          
          @if (showLogin) {
            <form (ngSubmit)="login()">
              <div>
                <label for="email">Email:</label>
                <input type="email" id="email" [(ngModel)]="email" name="email" required>
              </div>
              <div>
                <label for="password">Password:</label>
                <input type="password" id="password" [(ngModel)]="password" name="password" required>
              </div>
              <button type="submit">Login</button>
            </form>
          } @else {
            <form (ngSubmit)="register()">
              <div>
                <label for="email">Email:</label>
                <input type="email" id="email" [(ngModel)]="email" name="email" required>
              </div>
              <div>
                <label for="password">Password:</label>
                <input type="password" id="password" [(ngModel)]="password" name="password" required>
              </div>
              <div>
                <label for="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword" required>
              </div>
              <button type="submit">Register</button>
            </form>
          }
        </div>
      }

      @if (isLoggedIn) {
        <p>You are logged in as: {{currentUser?.email}}</p>
        <button (click)="logout()">Logout</button>
      }
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .form-container {
      margin-top: 20px;
    }
    .toggle-button {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 20px;
    }
    .toggle-button:hover {
      background-color: #0056b3;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  confirmPassword = '';
  isLoggedIn = false;
  currentUser: any = null;
  showLogin = true;

  constructor(private authService: AuthService) {
    this.checkAuthStatus();
  }

  async login() {
    try {
      const user = await this.authService.login(this.email, this.password);
      this.currentUser = user;
      this.isLoggedIn = true;
      alert('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  }

  async register() {
    try {
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      
      const user = await this.authService.register(this.email, this.password);
      this.currentUser = user;
      this.isLoggedIn = true;
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.currentUser = null;
      this.isLoggedIn = false;
      alert('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed.');
    }
  }

  checkAuthStatus() {
    const user = this.authService.currentUser;
    if (user) {
      this.currentUser = user;
      this.isLoggedIn = true;
    }
  }
}