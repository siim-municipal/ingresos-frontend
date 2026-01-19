import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  success(title: string, description?: string): void {
    toast.success(title, {
      description: description,
      duration: 3000, // Duración estándar para éxitos
    });
  }

  error(title: string, description?: string): void {
    toast.error(title, {
      description: description,
      duration: 5000, // Los errores duran más para que dé tiempo de leerlos
    });
  }

  warning(title: string, description?: string): void {
    toast.warning(title, {
      description: description,
      duration: 4000,
    });
  }

  info(title: string, description?: string): void {
    toast.info(title, {
      description: description,
    });
  }

  loading(title: string, options?: { duration?: number }): string | number {
    return toast.loading(title, {
      duration: options?.duration,
    });
  }

  dismiss(id: string | number): void {
    toast.dismiss(id);
  }
}
