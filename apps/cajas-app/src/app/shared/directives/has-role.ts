import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';

@Directive({
  selector: '[gobHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  @Input('gobHasRole') requiredRoles: string[] = [];

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      if (!user?.realm_access?.roles) {
        this.viewContainer.clear();
        return;
      }

      // Lógica de validación
      const hasPermission = this.requiredRoles.some(
        (reqRole) =>
          user.realm_access!.roles.includes(reqRole) ||
          user.realm_access!.roles.includes(`ROLE_${reqRole}`),
      );

      if (hasPermission) {
        if (this.viewContainer.length === 0) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
