import {
  ContribuyenteDTO,
  PersonaFisicaDTO,
  PersonaMoralDTO,
} from '../models/contribuyente.dto';
import { Contribuyente } from '../models/contribuyente.model';

export class ContribuyenteMapper {
  static toDomain(dto: ContribuyenteDTO): Contribuyente {
    const isFisica = dto.tipoPersona === 'FISICA';

    // Estandarización de Textos (Mayúsculas)
    const nombreCompleto = isFisica
      ? `${(dto as PersonaFisicaDTO).nombre} ${(dto as PersonaFisicaDTO).apellidoPaterno} ${(dto as PersonaFisicaDTO).apellidoMaterno || ''}`
      : (dto as PersonaMoralDTO).razonSocial;

    return {
      id: dto.id,
      rfc: dto.rfc.toUpperCase(),
      tipoPersona: dto.tipoPersona,
      nombreCompleto: nombreCompleto.toUpperCase().trim(),
      // Transformación de String ISO a Date
      fechaRegistro: new Date(dto.fechaRegistro),
      domicilio: dto.domicilio,
      datosAdicionales: {
        curp: isFisica
          ? (dto as PersonaFisicaDTO).curp?.toUpperCase()
          : undefined,
        fechaConstitucion: !isFisica
          ? new Date((dto as PersonaMoralDTO).fechaConstitucion)
          : undefined,
        email: isFisica
          ? (dto as PersonaFisicaDTO).email?.toLowerCase()
          : ((dto as PersonaMoralDTO).email?.toLowerCase() ?? undefined),
        telefono: isFisica
          ? (dto as PersonaFisicaDTO).telefono?.toLowerCase()
          : ((dto as PersonaMoralDTO).telefono?.toLowerCase() ?? undefined),
      },
    };
  }

  static toDomainList(dtos: ContribuyenteDTO[]): Contribuyente[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
