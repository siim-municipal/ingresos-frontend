export interface CartItemConcepto {
  descripcion: string;
  monto: number;
  // Opcionales que podrían servir para mostrar detalles en el carrito
  detalles?: string;
}

export interface CartItemInput {
  folio: string;
  granTotal: number;
  subtotal: number;
  totalRecargos: number;
  listaConceptos: CartItemConcepto[];
  fechaLimite?: Date | string;
  metadatos?: Record<string, string | number | object>;
  [key: string]: unknown;
}

export interface CartItem extends CartItemInput {
  addedAt: number;
}

export interface ShoppingBagState {
  items: CartItem[];
  isOpen: boolean;
}
