import type { RecordNfc } from "./tipos";

export function nfcSoportado(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

function decodificarDato(dato: DataView | string): string {
  if (typeof dato === "string") {
    return dato;
  }

  const bytes = new Uint8Array(dato.buffer, dato.byteOffset, dato.byteLength);
  return new TextDecoder("utf-8").decode(bytes);
}

function extraerSlugDeTexto(texto: string): string | null {
  const normalizado = texto.trim();

  const conPrefijo = normalizado.match(/(?:\/nfc\/|^nfc\/)([a-z0-9-]+)/i);
  if (conPrefijo) {
    return conPrefijo[1].toLowerCase();
  }

  const comoSlug = normalizado.match(/^[a-z0-9-]+$/i);
  if (comoSlug) {
    return normalizado.toLowerCase();
  }

  return null;
}

export function extraerSlugDeRecords(
  records: RecordNfc[] | undefined
): string | null {
  if (!records) {
    return null;
  }

  for (const record of records) {
    const tipo = String(record.type);
    const esUrl = tipo === "url";
    const esTexto = tipo === "text";

    if (!esUrl && !esTexto) {
      continue;
    }

    if (!record.data) {
      continue;
    }

    const contenido = decodificarDato(record.data);
    if (esUrl && contenido) {
      const coincide = contenido.match(/\/nfc\/([a-z0-9-]+)/i);
      if (coincide) {
        return coincide[1].toLowerCase();
      }
      continue;
    }

    const slug = extraerSlugDeTexto(contenido);
    if (slug) {
      return slug;
    }
  }

  return null;
}

export function urlDeSticker(slug: string): string {
  return `${window.location.origin}/nfc/${slug}`;
}
