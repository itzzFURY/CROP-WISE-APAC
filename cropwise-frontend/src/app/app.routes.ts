import type { Routes } from "@angular/router"
import { LoginComponent } from "./login/login.component"
import { FarmFormComponent } from "./farm-form/farm-form.component"
import { CropSuggestionsComponent } from "./crop-suggestions/crop-suggestions.component"
import { DashboardComponent } from "./dashboard/dashboard.component"
import { AccountComponent } from "./account/account.component"
import { SupportComponent } from "./support/support.component"
import { AuthGuard } from "./auth.guard"

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "farm-form",
    component: FarmFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "crop-suggestions",
    component: CropSuggestionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "account",
    component: AccountComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "support",
    component: SupportComponent,
    canActivate: [AuthGuard],
  },
  { path: "", redirectTo: "/login", pathMatch: "full" },
]
