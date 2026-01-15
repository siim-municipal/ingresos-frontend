import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GobButtonComponent, InputComponent } from '@gob-ui/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    GobButtonComponent,
    InputComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Señal para el estado de carga
  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);

      // Simular petición al backend
      setTimeout(() => {
        this.isLoading.set(false);
        // Navegar al Dashboard usando el Router
        this.router.navigate(['/dashboard']);
      }, 1500);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
