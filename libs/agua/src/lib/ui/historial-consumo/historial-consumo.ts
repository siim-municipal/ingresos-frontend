import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ConsumoService } from '../../services/consumo.service';
import { HistorialLecturaDTO, ChartState } from '../../models/consumo.model';

@Component({
  selector: 'lib-historial-consumo',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './historial-consumo.html',
  styleUrl: './historial-consumo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialConsumo {
  private consumoService = inject(ConsumoService);

  // Input: ID del contrato para buscar datos
  contratoId = input.required<string>();

  // Estado interno manejado con Signals
  state = signal<ChartState>({ status: 'loading' });
  rawHistory = signal<HistorialLecturaDTO[]>([]);

  // Configuración de Chart.js
  public chartType: ChartType = 'bar';

  // Computed: Transforma datos crudos a estructura de Chart.js automáticamente
  public chartData = computed<ChartData<'bar' | 'line'>>(() => {
    const data = this.rawHistory();
    if (!data.length) return { datasets: [], labels: [] };

    const consumos = data.map((d) => d.consumoM3);
    const promedio = consumos.reduce((a, b) => a + b, 0) / consumos.length;

    return {
      labels: data.map((d) => this.formatMes(d.periodo)),
      datasets: [
        {
          data: consumos,
          label: 'Consumo (m³)',
          backgroundColor: 'rgba(59, 130, 246, 0.7)', // Tailwind Blue-500
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          order: 2,
        },
        {
          data: Array(data.length).fill(promedio),
          label: 'Promedio Anual',
          type: 'line', // Gráfica mixta
          borderColor: 'rgba(248, 113, 113, 1)', // Tailwind Red-400
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          order: 1,
        },
      ],
    };
  });

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Metros Cúbicos (m³)' },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          // Requerimiento: Mostrar Importe en el Tooltip
          // Accedemos al array original usando el dataIndex
          afterBody: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const item = this.rawHistory()[index];
            return `Importe: $${item.importePagado.toFixed(2)}`;
          },
        },
      },
    },
  };

  constructor() {
    // Efecto que reacciona al cambio de ID del contrato
    effect(() => {
      const id = this.contratoId();
      if (id) {
        this.loadData(id);
      }
    });
  }

  private loadData(id: string) {
    this.state.set({ status: 'loading' });

    this.consumoService.getHistorialUltimos12Meses(id).subscribe({
      next: (data) => {
        this.rawHistory.set(data);
        this.state.set({ status: 'success' });
      },
      error: (err) => {
        console.error(err);
        this.state.set({
          status: 'error',
          error: 'No se pudo cargar el historial.',
        });
      },
    });
  }

  private formatMes(periodoISO: string): string {
    // Convierte "2024-01" a "Ene"
    const [year, month] = periodoISO.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(date);
  }
}
