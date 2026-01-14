import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'gob-card',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card
      class="h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <mat-card-header>
        <ng-content select="[gob-header]"></ng-content>
      </mat-card-header>

      <mat-card-content class="pt-4">
        <ng-content></ng-content>
      </mat-card-content>

      <mat-card-actions align="end" class="border-t border-gray-100 mt-4">
        <ng-content select="[gob-footer]"></ng-content>
      </mat-card-actions>
    </mat-card>
  `,
})
export class GobCardComponent {}
