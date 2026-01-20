export interface PropiedadPredio {
  id: string;
  razonSocial?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  rfc?: string;
  esResponsablePago: boolean;
  tipoRelacion?: 'PROPIETARIO' | 'POSEEDOR';
  porcentajePropiedad?: number;
}
