// Contratos estrictos con el Backend (ms-padron-unico)

export type TipoPersona = 'FISICA' | 'MORAL';

export interface DomicilioDTO {
  calle: string;
  numeroExterior: string;
  codigoPostal: string;
  colonia: string;
}

export interface ContribuyenteBaseDTO {
  id: string; // UUID
  rfc: string;
  tipoPersona: TipoPersona;
  fechaRegistro: string; // ISO 8601 String
  domicilio: DomicilioDTO;
}

export interface PersonaFisicaDTO extends ContribuyenteBaseDTO {
  tipoPersona: 'FISICA';
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
  email: string;
  telefono: string;
}

export interface PersonaMoralDTO extends ContribuyenteBaseDTO {
  tipoPersona: 'MORAL';
  razonSocial: string;
  fechaConstitucion: string;
  email: string;
  telefono: string;
}

export type ContribuyenteDTO = PersonaFisicaDTO | PersonaMoralDTO;
