export const environment = {
  production: true,
  // URL de tu API Gateway (Punto único de entrada al backend)
  apiUrl: 'http://localhost:9090/api',

  auth: {
    // Variable: ISSUER_URI_KEYCLOAK (La pública)
    issuer: 'http://localhost:8180/realms/tuxtepec-gob',

    // Variable: KEYCLOAK_CLIENT_ID
    clientId: 'siim-frontend',

    // El redirect debe ser dinámico, pero en prod suele ser fijo
    redirectUri: window.location.origin,

    // Configuración de seguridad
    requireHttps: true,
    showDebugInformation: false,
  },
};
