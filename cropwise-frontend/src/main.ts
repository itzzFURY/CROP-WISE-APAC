import { bootstrapApplication } from "@angular/platform-browser"
import { appConfig } from "./app/app.config"
import { AppComponent } from "./app/app.component"
import { importProvidersFrom } from "@angular/core"
import { HttpClientModule } from "@angular/common/http"
import { provideRouter } from "@angular/router"
import { routes } from "./app/app.routes"
import { enableProdMode } from "@angular/core"

// Enable production mode
enableProdMode()

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(HttpClientModule), provideRouter(routes), ...appConfig.providers],
}).catch((err) => console.error(err))
