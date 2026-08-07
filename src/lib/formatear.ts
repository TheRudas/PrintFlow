export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(monto);
}

const APODOS: Record<string, string> = {
  "impresionesrudas@admin.com": 'Rudas "El Admin"',
  "impresionesdirle@usuario.com": 'Dirle "La Patrona"',
  "impresionesamin@usuario.com": 'Amin "El Mandamás"',
};

export function nombreUsuario(
  correo: string | null,
  nombre: string | undefined,
): string {
  if (correo && APODOS[correo]) {
    return APODOS[correo];
  }
  return nombre || correo?.split("@")[0] || "";
}
