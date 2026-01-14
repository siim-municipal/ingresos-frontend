import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Button } from '@gob-ui/components';

@Component({
  imports: [RouterModule, Button],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  isLoading = signal(false);

  guardar() {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 2000); // Simular API
  }
}
