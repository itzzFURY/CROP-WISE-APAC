import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { HttpClientModule } from "@angular/common/http"
import { RouterModule } from "@angular/router"

import { AppComponent } from "./app.component"
import { LoginComponent } from "./login/login.component"
import { FarmFormComponent } from "./farm-form/farm-form.component"
import { CropSuggestionsComponent } from "./crop-suggestions/crop-suggestions.component"
import { NavbarComponent } from "./navbar/navbar.component"
import { DashboardComponent } from "./dashboard/dashboard.component"
import { routes } from "./app.routes"
import { AuthService } from "./auth.service"
import { GeminiService } from "./gemini.service"
import { AuthGuard } from "./auth.guard"

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    AppComponent,
    LoginComponent,
    FarmFormComponent,
    CropSuggestionsComponent,
    NavbarComponent,
    DashboardComponent,
  ],
  providers: [AuthService, GeminiService, AuthGuard],
  
})
export class AppModule {}
