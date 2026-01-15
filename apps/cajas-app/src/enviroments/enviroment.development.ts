export const environment = {
  production: false,

  apiUrl: 'http://localhost:9090/api',

  auth: {
    // Variable: ISSUER_URI_KEYCLOAK
    issuer: 'http://localhost:8180/realms/tuxtepec-gob',

    // Variable: KEYCLOAK_CLIENT_ID
    clientId: 'siim-frontend',

    redirectUri: window.location.origin,

    // En localhost casi nunca tenemos HTTPS, así que lo desactivamos
    requireHttps: false,
    showDebugInformation: true,
  },
};
