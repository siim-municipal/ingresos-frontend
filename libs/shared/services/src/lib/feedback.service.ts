import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  success(message: string): void {
    toast.success(message);
  }

  error(title: string, details?: string): void {
    toast.error(title, {
      description: details,
      duration: 5000, // Los errores duran más
    });
  }

  warning(message: string): void {
    toast.warning(message);
  }

  info(message: string): void {
    toast.info(message);
  }
}
