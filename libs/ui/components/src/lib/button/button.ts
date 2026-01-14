import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

@Component({
  selector: 'gob-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  label = input<string>(''); // Opcional
  variant = input<ButtonVariant>('primary');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);

  // Output moderno
  action = output<void>();

  get baseClasses(): string {
    return 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200';
  }

  get variantClasses(): string {
    const variants: Record<ButtonVariant, string> = {
      primary:
        'border-transparent text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-500',
      secondary:
        'border-transparent text-white bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      outline:
        'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
      ghost:
        'border-transparent text-blue-700 bg-transparent hover:bg-blue-50 shadow-none',
    };
    return variants[this.variant()];
  }
}
