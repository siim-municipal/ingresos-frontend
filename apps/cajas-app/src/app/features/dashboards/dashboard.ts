import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface KpiStat {
  label: string;
  value: string;
  icon: string;
  colorClass: string; // Tailwind clases para el fondo del icono
  trend?: string; // Ej: "+5% vs mes pasado"
  trendPositive?: boolean;
}

interface ActivityItem {
  id: number;
  title: string;
  time: string;
  type: 'PAYMENT' | 'REGISTRY' | 'ALERT';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styles: [
    `
      :host {
        display: block;
      }
      .kpi-card {
        @apply bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow;
      }
      .icon-wrapper {
        @apply p-3 rounded-lg flex items-center justify-center text-white shadow-sm;
      }
      .action-btn {
        @apply flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 transition-all gap-3 text-slate-600 hover:text-blue-600 cursor-pointer shadow-sm;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  // --- SIGNALS (Simulando datos del backend) ---

  userName = signal('Coordinador');
  currentDate = signal(new Date());

  stats = signal<KpiStat[]>([
    {
      label: 'Recaudación del Día',
      value: '$145,200.00',
      icon: 'payments',
      colorClass: 'bg-emerald-500',
      trend: '+12% vs ayer',
      trendPositive: true,
    },
    {
      label: 'Predios Registrados',
      value: '12,450',
      icon: 'location_city',
      colorClass: 'bg-blue-500',
      trend: '+5 nuevos hoy',
      trendPositive: true,
    },
    {
      label: 'Contribuyentes',
      value: '8,320',
      icon: 'people',
      colorClass: 'bg-indigo-500',
    },
    {
      label: 'Trámites Pendientes',
      value: '18',
      icon: 'pending_actions',
      colorClass: 'bg-amber-500',
      trend: '-2 urgentes',
      trendPositive: false,
    },
  ]);

  recentActivity = signal<ActivityItem[]>([
    {
      id: 1,
      title: 'Pago de Predial - Cuenta 12345',
      time: 'Hace 5 min',
      type: 'PAYMENT',
    },
    {
      id: 2,
      title: 'Alta de Predio Urbano - Col. Centro',
      time: 'Hace 25 min',
      type: 'REGISTRY',
    },
    {
      id: 3,
      title: 'Actualización Valor Catastral - Lote 4',
      time: 'Hace 1 hora',
      type: 'REGISTRY',
    },
    {
      id: 4,
      title: 'Error de Sincronización SAT',
      time: 'Hace 2 horas',
      type: 'ALERT',
    },
  ]);

  // Helper para obtener iconos de actividad
  getActivityIcon(type: string): string {
    switch (type) {
      case 'PAYMENT':
        return 'attach_money';
      case 'REGISTRY':
        return 'edit_document';
      case 'ALERT':
        return 'warning';
      default:
        return 'info';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'PAYMENT':
        return 'text-emerald-600 bg-emerald-50';
      case 'REGISTRY':
        return 'text-blue-600 bg-blue-50';
      case 'ALERT':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  }
}
