import {
  provideAppInitializer,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { GobIconRegistryService } from '@gob-ui/components';
import { OAuthStorage, provideOAuthClient } from 'angular-oauth2-oidc';
import { AuthService } from './core/services/auth/auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { PrefixOAuthStorage } from './core/utils/auth-storage';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { environment } from '../enviroments/enviroment.development';
import { API_BASE_URL } from '@gob-ui/shared/services';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withViewTransitions(),
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideOAuthClient(),
    provideAppInitializer(() => {
      const registry = inject(GobIconRegistryService);
      return registry.registerIcons();
    }),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return auth.initializeLogin();
    }),
    { provide: OAuthStorage, useClass: PrefixOAuthStorage },
    { provide: API_BASE_URL, useValue: environment.apiUrl },
  ],
};
