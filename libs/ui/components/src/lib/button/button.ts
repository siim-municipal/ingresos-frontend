import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

@Component({
  selector: 'gob-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class GobButtonComponent {
  // Inputs definidos
  variant = input<ButtonVariant>('primary');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  label = input<string>('');
  type = input<'button' | 'submit' | 'reset'>('button');

  // Outputs
  action = output<void>();

  emitAction(event: Event): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.type() === 'submit') {
      return;
    }
    this.action.emit();
  }
}
