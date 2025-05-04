import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { HttpClientModule } from "@angular/common/http"

import { AppComponent } from "./app.component"
import { LoginComponent } from "./login/login.component"
import { FarmFormComponent } from "./farm-form/farm-form.component"
import { RouterModule, type Routes } from "@angular/router"

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "", redirectTo: "/login", pathMatch: "full" },
]

@NgModule({
  declarations: [
    // If you're using standalone components, don't declare them here
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppComponent,
    LoginComponent,
    FarmFormComponent,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [],
})
export class AppModule {}
