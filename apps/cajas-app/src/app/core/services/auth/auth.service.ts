import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { jwtDecode } from 'jwt-decode';
import { authConfig } from './auth.config';
import { UserProfile } from '@gob-ui/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private router = inject(Router);

  // --- Estado Reactivo con Signals ---
  // Signal privado mutable
  private _currentUser = signal<UserProfile | null>(null);

  // Signal pública de solo lectura
  public currentUser = this._currentUser.asReadonly();

  // Signal computada: Se actualiza automáticamente si currentUser cambia
  public isLoggedIn = computed(() => !!this._currentUser());

  constructor() {
    this.configureOAuth();
  }

  private configureOAuth() {
    this.oauthService.configure(authConfig);

    // Configurar almacenamiento de tokens (localStorage por defecto, sessionStorage es mas seguro para pestañas)
    // this.oauthService.setStorage(sessionStorage);

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
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();

      // Si tenemos token válido al iniciar, actualizamos el estado
      if (this.oauthService.hasValidAccessToken()) {
        this.updateUserState();
      }
    } catch (error) {
      console.error('Error al inicializar OAuth:', error);
      // Manejar error de conexión con el SSO
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
