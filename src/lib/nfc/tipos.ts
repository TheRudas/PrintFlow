export type TipoRecordNfc =
  | "empty"
  | "text"
  | "url"
  | "mime"
  | "unknown"
  | string;

export interface RecordNfc {
  type: TipoRecordNfc;
  data?: DataView | string;
}

export interface MensajeNfc {
  records: RecordNfc[];
}

export interface EventoLecturaNfc {
  message: MensajeNfc;
}

export interface LecturaNfc {
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  stop(): Promise<void>;
  onreading: ((evento: EventoLecturaNfc) => void) | null;
  onreadingerror: (() => void) | null;
}

export interface RegistroNfc {
  type: string;
  data: string | ArrayBuffer;
}

export interface MensajeEscrituraNfc {
  records: RegistroNfc[];
}

export interface EscrituraNfc {
  write(mensaje: MensajeEscrituraNfc): Promise<void>;
}

declare global {
  interface Window {
    NDEFReader: new () => LecturaNfc & EscrituraNfc;
  }
}
