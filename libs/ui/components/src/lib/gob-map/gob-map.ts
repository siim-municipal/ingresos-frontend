import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  viewChild,
  effect,
  input,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';

// Fix para los iconos por defecto de Leaflet en builds de producción (Webpack/Esbuild issue)
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'lib-map',
  standalone: true,
  template: `
    <div
      #mapContainer
      class="h-full w-full min-h-[400px] z-0 rounded-lg shadow-inner"
    ></div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GobMap implements OnInit, OnDestroy, AfterViewInit {
  // --- INJECTIONS ---
  private platformId = inject(PLATFORM_ID);

  // --- SIGNALS (INPUTS) ---
  // Coordenadas centrales: [lat, lon]
  center = input.required<[number, number] | null>();
  // Nivel de zoom inicial
  zoom = input<number>(16);
  // Texto del popup (opcional)
  label = input<string>('');

  // --- VIEW CHILD ---
  // Usamos la nueva API de viewChild (Angular 17+)
  mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  // --- INTERNAL STATE ---
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private isBrowser = false;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // EFFECT: Reacciona a cambios en las coordenadas dinámicamente
    effect(() => {
      const coords = this.center();
      const zoom = this.zoom();
      const label = this.label();

      if (this.map && coords) {
        this.updateMapState(coords, zoom, label);
      }
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Inicialización diferida para asegurar que el DOM existe
      // En Angular 21, afterNextRender es una opción, pero ngOnInit + requestAnimationFrame
      // suele ser suficiente y seguro para libs de terceros.
    }
  }

  // Se ejecuta cuando la vista ya renderizó el DIV
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initMap();
      this.setupResizeObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove(); // Limpia eventos y DOM
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initMap(): void {
    const coords = this.center() || [18.0833, -96.1167]; // Fallback a coordenadas default (Tuxtepec)

    this.map = L.map(this.mapContainer().nativeElement, {
      center: coords,
      zoom: this.zoom(),
      scrollWheelZoom: false, // Requisito: No interferir con scroll de página
      zoomControl: true,
      attributionControl: false, // Limpiamos UI para estilo "Institucional"
    });

    // Capa base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    // Pintar marcador inicial
    if (this.center()) {
      this.updateMapState(coords, this.zoom(), this.label());
    }
  }

  private updateMapState(
    coords: [number, number],
    zoom: number,
    label: string,
  ): void {
    if (!this.map) return;

    // Movimiento suave
    this.map.flyTo(coords, zoom, { duration: 1.5 });

    // Actualizar Marcador
    if (this.marker) {
      this.marker.setLatLng(coords);
    } else {
      this.marker = L.marker(coords).addTo(this.map);
    }

    // Actualizar Popup
    if (label) {
      this.marker.bindPopup(label).openPopup();
    }
  }

  // Solución al problema de Tabs/Carga diferida
  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
    this.resizeObserver.observe(this.mapContainer().nativeElement);
  }
}
