import { FormControl } from '@angular/forms';

// Definición estricta del formulario
export interface ContribuyenteFormInterface {
  tipoPersona: FormControl<'FISICA' | 'MORAL'>;
  rfc: FormControl<string>;

  // Datos Física
  nombre: FormControl<string>;
  apellidoPaterno: FormControl<string>;
  apellidoMaterno: FormControl<string>;
  curp: FormControl<string>;

  // Datos Moral
  razonSocial: FormControl<string>;
  fechaConstitucion: FormControl<string>;

  // Datos Comunes
  codigoPostal: FormControl<string>;
  calle: FormControl<string>;
  email: FormControl<string>;
  telefonoMovil: FormControl<string>;

  createdBy?: string;
  createdAt?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface CreateContribuyentePayload {
  tipoPersona: 'FISICA' | 'MORAL';
  rfc: string;
  email: string;

  // Datos Física
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  curp?: string;

  // Datos Moral
  razonSocial?: string;
  fechaConstitucion?: string;

  // Dirección
  calle: string;
  codigoPostal: string;
  telefonoMovil: string;
}
