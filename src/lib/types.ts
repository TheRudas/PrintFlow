export interface Servicio {
  id: string;
  nombre: string;
  precioPorDefecto: number | null;
  presets: number[];
  unidad: string;
  activo: boolean;
  creadoEn: string;
}

export interface Registro {
  id: string;
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  nota: string | null;
  creadoEn: string;
}

export interface DatosNuevoRegistro {
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  nota?: string | null;
}
