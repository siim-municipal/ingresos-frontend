// apps/cajas-app/src/app/core/utils/auth-storage.ts
import { Injectable } from '@angular/core';
import { OAuthStorage } from 'angular-oauth2-oidc';

@Injectable()
export class PrefixOAuthStorage implements OAuthStorage {
  // Prefijo para que no choque con otras apps en el mismo dominio
  private prefix = 'siim_cajas_';

  getItem(key: string): string | null {
    return localStorage.getItem(this.prefix + key);
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  setItem(key: string, data: string): void {
    localStorage.setItem(this.prefix + key, data);
  }
}
