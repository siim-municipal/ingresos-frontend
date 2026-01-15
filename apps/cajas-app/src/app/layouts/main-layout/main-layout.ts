import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
// Material
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu'; // <--- Nuevo para el menú de usuario
import { MatDividerModule } from '@angular/material/divider';
// Utils
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth/auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role';
// Auth

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    HasRoleDirective,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss', // Si tienes estilos
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Signals
  isMobile = signal<boolean>(false);

  // Exponemos el usuario actual a la vista (Signal de solo lectura)
  user = this.authService.currentUser;

  // Computada: Generar iniciales del usuario (Ej: "Juan Pérez" -> "JP")
  userInitials = computed(() => {
    const u = this.user();
    if (!u) return '';
    const first = u.given_name?.charAt(0) || '';
    const last = u.family_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  });

  userRole = computed(() => {
    const u = this.user();

    // Validación defensiva: Si no hay roles, es Funcionario
    if (!u?.realm_access?.roles) {
      return 'Funcionario';
    }

    // Buscamos roles que empiecen con ROLE_ (ej: ROLE_TESORERO)
    // Excluimos offline_access y uma_authorization que vi en tu JWT
    const businessRole = u.realm_access.roles.find((r) =>
      r.startsWith('ROLE_'),
    );

    if (businessRole) {
      // Transformación: "ROLE_TESORERO" -> "TESORERO" -> "Tesorero" (por CSS capitalize)
      return businessRole.replace('ROLE_', '').replace(/_/g, ' ').toLowerCase();
    }

    return 'Funcionario';
  });

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
