import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { jwtDecode } from 'jwt-decode';
import { authConfig } from './auth.config';
import { UserProfile } from '@gob-ui/shared/interfaces';
import { FeedbackService } from '@gob-ui/shared/services';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private oauthService = inject(OAuthService);

  private router = inject(Router);

  public isAuthServiceAvailable = signal<boolean>(false);

  // Signal privado mutable
  private _currentUser = signal<UserProfile | null>(null);

  // Signal pública de solo lectura
  public currentUser = this._currentUser.asReadonly();

  // Signal computada: Se actualiza automáticamente si currentUser cambia
  public isLoggedIn = computed(() => !!this._currentUser());

  private feedback = inject(FeedbackService);

  constructor() {
    this.configureOAuth();
  }

  private configureOAuth(): void {
    this.oauthService.configure(authConfig);

    // Automatizar el Refresh Token
    this.oauthService.setupAutomaticSilentRefresh();

    // Escuchar eventos de la librería para sincronizar Signals
    this.oauthService.events.subscribe((event: OAuthEvent) => {
      if (event.type === 'token_received' || event.type === 'token_refreshed') {
        this.updateUserState();
      }
      if (event.type === 'logout' || event.type === 'session_terminated') {
        this._currentUser.set(null);
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Método de inicialización (llamado en APP_INITIALIZER)
   * Carga el Discovery Document y verifica si hay un login en proceso.
   */
  public async initializeLogin(): Promise<void> {
    try {
      const loadPromise = this.oauthService.loadDiscoveryDocumentAndTryLogin();

      // Agregamos un timeout manual de 3 segundos para no esperar eternamente si la red cuelga
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_KEYCLOAK')), 3000),
      );

      // Carrera: Lo que ocurra primero (Carga o Timeout)
      await Promise.race([loadPromise, timeoutPromise]);

      this.isAuthServiceAvailable.set(true);

      if (this.oauthService.hasValidAccessToken()) {
        this.updateUserState();
      }
    } catch (error) {
      console.error('No se pudo conectar con el Servicio de Identidad:', error);

      this.isAuthServiceAvailable.set(false);

      this.feedback.error(
        'Servicio de Identidad No Disponible',
        'No se pudo verificar su sesión. Es posible que el servidor esté en mantenimiento.',
      );
    }
  }

  public login(): void {
    // Inicia el flujo Authorization Code + PKCE
    this.oauthService.initLoginFlow();
  }

  public logout(): void {
    this.oauthService.logOut();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  public getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  private updateUserState(): void {
    if (this.oauthService.hasValidAccessToken()) {
      // A. Obtenemos claims del ID Token (Nombre, Email, etc.)
      const idClaims = (this.oauthService.getIdentityClaims() as object) || {};

      // B. Obtenemos el Access Token crudo (string)
      const rawAccessToken = this.oauthService.getAccessToken();

      // C. Decodificamos el Access Token usando jwt-decode
      let accessClaims = {};
      try {
        accessClaims = jwtDecode(rawAccessToken);
      } catch (error) {
        console.error('Error al decodificar Access Token', error);
      }

      // D. Fusionamos ambos (Prioridad al Access Token para roles)
      const combinedClaims = {
        ...idClaims,
        ...accessClaims,
      } as UserProfile;

      this._currentUser.set(combinedClaims);
    }
  }
}
