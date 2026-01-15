import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../../enviroments/enviroment.development';

export const authConfig: AuthConfig = {
  // 1. URL del Identity Provider (Viene del environment)
  issuer: environment.auth.issuer,

  // 2. URL de redirección (A donde vuelve después de loguearse)
  redirectUri: environment.auth.redirectUri,

  // 3. ID del Cliente (siim-frontend)
  clientId: environment.auth.clientId,

  // 4. Scopes (Permisos)
  // 'offline_access' es vital para que Keycloak nos de un Refresh Token
  scope: 'openid profile email offline_access roles',

  // 5. Tipo de respuesta (PKCE)
  responseType: 'code',

  // 6. Seguridad (HTTPS)
  // En dev es false (http://localhost), en prod es true
  requireHttps: environment.auth.requireHttps,

  // 7. Debug
  showDebugInformation: environment.auth.showDebugInformation,

  // Opcional: Limpia la URL después del login para quitar ?code=... y ?state=...
  clearHashAfterLogin: true,
};
