import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { GobIconRegistryService } from '@gob-ui/components';
import { OAuthStorage, provideOAuthClient } from 'angular-oauth2-oidc';
import { AuthService } from './core/services/auth/auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { PrefixOAuthStorage } from './core/utils/auth-storage';
import { errorInterceptor } from './core/interceptors/error.interceptor';

function initializeAppFactory(authService: AuthService): () => Promise<void> {
  return () => authService.initializeLogin();
}

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
    {
      provide: APP_INITIALIZER,
      useFactory: (iconRegistry: GobIconRegistryService) => () =>
        iconRegistry.registerIcons(),
      deps: [GobIconRegistryService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AuthService],
      multi: true,
    },
    { provide: OAuthStorage, useClass: PrefixOAuthStorage },
  ],
};
