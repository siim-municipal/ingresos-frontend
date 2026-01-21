export interface LecturaDTO {
  id: number;
  predioDireccion: string;
  medidorSerie: string;
  lecturaAnterior: number;
  promedioHistorico: number;
  lecturaActual: number | null;
  sinMedidor: boolean;
}

export interface LecturaBatchPayload {
  lecturas: { id: number; lecturaActual: number }[];
}
