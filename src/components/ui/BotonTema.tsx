"use client";

import { useEffect, useState } from "react";

type Tema = "oscuro" | "claro";

const CLAVE_TEMA = "printflow-tema";

function obtenerTemaInicial(): Tema {
  if (typeof window === "undefined") {
    return "oscuro";
  }
  const guardado = localStorage.getItem(CLAVE_TEMA);
  return guardado === "claro" ? "claro" : "oscuro";
}

export default function BotonTema() {
  const [tema, setTema] = useState<Tema>(() => obtenerTemaInicial());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "oscuro");
    localStorage.setItem(CLAVE_TEMA, tema);
  }, [tema]);

  const esOscuro = tema === "oscuro";

  return (
    <button
      type="button"
      onClick={() => setTema(esOscuro ? "claro" : "oscuro")}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={esOscuro ? "Modo claro" : "Modo oscuro"}
      className="btn-feedback flex h-9 w-9 items-center justify-center rounded-full border border-marca-200 bg-superficie text-marca-700 hover:bg-marca-50 dark:text-marca-300"
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
          className="h-5 w-5"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
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
          className="h-5 w-5"
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
      )}
    </button>
  );
}
