"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cerrarSesion } from "@/lib/auth/acciones";

type Tema = "oscuro" | "claro";
const CLAVE_TEMA = "printflow-tema";

function obtenerTemaInicial(): Tema {
  if (typeof window === "undefined") {
    return "oscuro";
  }
  const guardado = localStorage.getItem(CLAVE_TEMA);
  return guardado === "claro" ? "claro" : "oscuro";
}

export default function MenuUsuario() {
  const [abierto, setAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [tema, setTema] = useState<Tema>(obtenerTemaInicial);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "oscuro");
    localStorage.setItem(CLAVE_TEMA, tema);
  }, [tema]);

  useEffect(() => {
    function manejarClick(evento: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    if (abierto) {
      document.addEventListener("mousedown", manejarClick);
      return () => document.removeEventListener("mousedown", manejarClick);
    }
  }, [abierto]);

  useEffect(() => {
    function manejarTecla(evento: KeyboardEvent): void {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    }
    if (abierto) {
      window.addEventListener("keydown", manejarTecla);
      return () => window.removeEventListener("keydown", manejarTecla);
    }
  }, [abierto]);

  async function cerrar(): Promise<void> {
    setCerrando(true);
    await cerrarSesion();
    router.push("/ingresar");
    router.refresh();
  }

  const esOscuro = tema === "oscuro";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-label="Menú de usuario"
        className="btn-feedback sombra-suave flex h-9 w-9 items-center justify-center rounded-full border border-borde bg-superficie text-texto-suave hover:bg-superficie-alta hover:text-texto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {abierto && (
        <div className="animar-entrar absolute right-0 top-full z-40 mt-2 w-48 rounded-2xl border border-borde bg-superficie p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setTema(esOscuro ? "claro" : "oscuro");
              setAbierto(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-texto hover:bg-superficie-alta"
          >
            {esOscuro ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-marca-500"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-marca-500"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
            {esOscuro ? "Modo claro" : "Modo oscuro"}
          </button>

          <div className="mx-2 my-1 border-t border-borde" />

          <button
            type="button"
            onClick={cerrar}
            disabled={cerrando}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {cerrando ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      )}
    </div>
  );
}
