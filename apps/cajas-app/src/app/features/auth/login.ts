import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { GobButtonComponent } from '@gob-ui/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, GobButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  // Mantenemos isLoading para evitar dobles clics mientras redirige
  isLoading = signal(false);

  // Mensaje de estado opcional
  statusMessage = signal('');

  ngOnInit(): void {
    // Si el usuario ya está logueado, lo mandamos directo al dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    if (!this.authService.isAuthServiceAvailable()) {
      return;
    }
    this.isLoading.set(true);
    this.statusMessage.set('Redirigiendo al Portal de Identidad...');

    // Delegamos el proceso al servicio.
    // Esto redirigirá el navegador fuera de tu app hacia Keycloak (localhost:8180)
    this.authService.login();
  }
}
