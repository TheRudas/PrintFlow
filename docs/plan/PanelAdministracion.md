# Implementation Plan: Panel de Administración

**Date**: 05/08/2026
**Specs**:

- [004-PanelAdministracion.md](/docs/spec/004-PanelAdministracion.md)
- [001-GestionServicios.md](/docs/spec/001-GestionServicios.md) (gestión de servicios del panel)
- [005-ExportacionDatos.md](/docs/spec/005-ExportacionDatos.md) (referencia, se implementa aparte)

## Summary

El **Administrador** debe poder desbloquear el modo admin mediante un código secreto ingresado en la pantalla de Ayuda
(easter egg, FR-001), consultar totales por día/semana/mes (FR-004), desglose por servicio (FR-005), historial paginado
(FR-006), y gestionar servicios (FR-007). El código se valida en el servidor contra una variable de entorno (FR-002) y
el rol persiste en el dispositivo (FR-003).

La implementación separa: validación de sesión admin (server actions con cookie firmada), acceso a datos (repositorios
`estadisticas.ts` y CRUD ampliado de `servicios.ts`), y componentes de UI (dashboard, gestión, historial). Se respeta el
flujo spec → plan → código y el clean code del proyecto.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router, Turbopack)
**Primary Dependencies**: @supabase/supabase-js, React 19, Tailwind CSS 4
**Storage**: Supabase (Postgres) — tablas `servicios`, `registros` (migración 001) + nueva `configuracion`
**Testing**: lint (`npm run lint`) + build (`npm run build`) + verificación manual en `npm run dev`
**Target Platform**: PWA mobile (Android) y desktop
**Project Type**: Web (App Router)
**Performance Goals**: Panel carga totales en <5s (SC-002); historial paginado (50 por página) para volumen alto
**Constraints**: El código admin NUNCA debe aparecer en el bundle del navegador (SC-003). El rol admin debe persistir
entre sesiones sin volver a pedir el código (SC via FR-003). Los cambios de servicio deben reflejarse al instante en la
pantalla de cobro (SC-004).
**Scale/Scope**: Panel completo de consulta y configuración. Depende de los registros de la Feature 3.

## Project Structure

### Documentation (this feature)

```text
docs/
├── spec/
│   ├── 001-GestionServicios.md
│   ├── 002-RegistroCobro.md
│   ├── 003-EscaneoNFC.md
│   ├── 004-PanelAdministracion.md   ← Este spec
│   └── 005-ExportacionDatos.md
└── plan/
    ├── RegistroDeCobro.md
    └── PanelAdministracion.md       # Este archivo
```

### Archivos que agrega o modifica este feature

```text
supabase/
└── migrations/
    └── {timestamp}_tabla_configuracion.sql      # NUEVA: clave-valor para código admin

src/
├── app/
│   ├── page.tsx                                 # MOD: link a /admin cuando hay sesión admin (server)
│   ├── ayuda/
│   │   └── page.tsx                             # MOD: integra el easter egg (client) sin revelarlo
│   └── admin/
│       └── page.tsx                             # NUEVA: dashboard (server, protegido por esAdmin)
├── lib/
│   ├── admin/
│   │   ├── acciones.ts                          # NUEVA: 'use server' — ingresarCodigo, esAdmin, cerrarSesion,
│   │   │                                        #        cambiarCodigo, grabarCodigoDefault
│   │   └── cookie.ts                            # NUEVA: leer/escribir cookie admin firmada (solo server)
│   ├── repos/
│   │   ├── estadisticas.ts                      # NUEVA: totalesPorDia/Semana/Mes, desglosePorServicio,
│   │   │                                        #        historialPaginado
│   │   └── servicios.ts                         # MOD: crearServicio, actualizarServicio, (obtener... ya existen)
│   └── types.ts                                 # MOD: tipos de Totales, Desglose (si aplica)
└── components/
    └── admin/
        ├── EasterEggAyuda.tsx                   # NUEVA: input "Ayuda" que valida el código (client)
        ├── TarjetaTotal.tsx                     # NUEVA: tarjeta de total (monto + etiqueta)
        ├── DesgloseServicios.tsx                # NUEVA: tabla total por servicio
        ├── HistorialRegistros.tsx               # NUEVA: lista paginada de registros
        ├── FormularioServicio.tsx               # NUEVA: alta/edición de servicio (client)
        └── ListaServicios.tsx                   # NUEVA: listado admin con editar/desactivar
```

**Structure Decision**: Separación total de responsabilidades. `lib/admin/` encapsula la lógica de sesión admin
(validación del código en server + cookie firmada) y `lib/repos/` todo el acceso a datos. `components/admin/` son
componentes de presentación; los que tienen estado interactivo son `'use client'`. Las páginas admin son server
components que consultan Supabase directamente (sin exponer la lógica al navegador).

---

## Phase 1: Sesión Admin (Server) — Base del Easter Egg

**Purpose**: Validación del código en el servidor y cookie de sesión firmada. Sin esto no hay panel.

**Diseño de seguridad**:
- El código admin se almacena en la variable de entorno `ADMIN_CODE` y en la tabla `configuracion` (clave `admin_code`).
  El valor efectivo es: el de la tabla si existe, si no el de la env var (FR-002, FR-008).
- La cookie `printflow_admin` guarda `admin:<timestamp>` firmada con HMAC-SHA256 usando un secreto propio
  (`ADMIN_COOKIE_SECRET`), para que no se pueda forjar desde el navegador.
- `esAdmin()` es una función server: lee la cookie, verifica la firma → devuelve boolean. La cookie no expira por
  tiempo; la sesión se cierra manualmente desde el panel.
- El código NUNCA viaja al navegador; solo se envía desde el input y se compara en el server (SC-003).

- [ ] T001 Migración `tabla_configuracion`:
  - Tabla `configuracion` (`clave` text PK, `valor` text)
  - Insert `admin_code` con el valor de la env var si no existe (se hace desde server action, no en la migración,
    para no hardcodear el secreto)
  - RLS anon con las mismas políticas de acceso (solo lectura necesaria; escritura solo por el dueño — usamos RLS
    permisiva como en las otras tablas por simplicidad doméstica)
- [ ] T002 Crear `src/lib/admin/cookie.ts`:
  - `leerSesionAdmin()` → parsea cookie, verifica firma HMAC → `{ esAdmin: boolean }`
  - `crearCookieAdmin()` → genera cookie firmada sin expiración por tiempo (maxAge de 10 años; se cierra manualmente)
  - `borrarCookieAdmin()` → elimina la cookie
- [ ] T003 Crear `src/lib/admin/acciones.ts` (`'use server'`):
  - `ingresarCodigoAdmin(codigo)` → compara contra env/tabla → si coincide, setea cookie; devuelve `{ exito: boolean }`
  - `esAdmin()` → wrapper que usa `leerSesionAdmin()` (para usar desde server components)
  - `cerrarSesionAdmin()` → borra cookie
  - `cambiarCodigoAdmin(codigoNuevo)` → solo si esAdmin → actualiza `configuracion.admin_code` (FR-008)
  - `grabarCodigoDefault()` → al primer arranque, si `configuracion.admin_code` no existe, la inserta desde
    `process.env.ADMIN_CODE` (invocado desde la migración o un script de setup)

**Checkpoint**: `ingresarCodigoAdmin` con el código correcto setea la cookie; `esAdmin()` devuelve true en server;
con código incorrecto devuelve false sin setear nada (FR-001, FR-002, SC-003).

---

## Phase 2: Repositorios de Estadísticas y CRUD de Servicios

**Purpose**: Acceso a datos para el dashboard y la gestión de servicios.

- [ ] T004 Crear `src/lib/repos/estadisticas.ts`:
  - `obtenerTotales(desde: Date)` → `Totales` con `montoTotal`, `cantidadRegistros` (FR-004)
  - `obtenerDesglosePorServicio(desde: Date)` → `Desglose[]` (`servicioId`, `nombre`, `montoTotal`, `cantidad`)
    (FR-005). Usa un `select('servicios(nombre), total, cantidad')` y agrupa en TS, o una consulta agregada si
    Supabase lo permite
  - `obtenerHistorialPaginado(pagina, tamanoPagina)` → `HistorialPaginado` con `registros` + `totalRegistros`,
    ordenado por `creado_en desc` y paginado con `.range()` (FR-006, edge case "cientos de registros")
- [ ] T005 Ampliar `src/lib/repos/servicios.ts`:
  - `crearServicio(datos)` → inserta servicio (FR-007)
  - `actualizarServicio(id, datos)` → actualiza nombre, precio_por_defecto, presets, unidad, activo (FR-007)
  - (no borrado físico: solo `activo = false`, FR-005 del spec 001)
- [ ] T006 Definir en `src/lib/types.ts`:
  - `Totales`, `DesgloseServicio`, `HistorialPaginado`, `DatosServicio` (para alta/edición)

**Checkpoint**: Con registros de prueba, `obtenerTotales` suma correcto, `obtenerDesglosePorServicio` agrupa bien y
`obtenerHistorialPaginado` pagina correctamente (FR-004, FR-005, FR-006).

---

## Phase 3: Easter Egg en Ayuda + Ruta /admin Protegida

**Purpose**: El desbloqueo discreto y la protección del panel.

- [ ] T007 Crear `src/components/admin/EasterEggAyuda.tsx` (client):
  - Input dentro de la pantalla de Ayuda etiquetado de forma neutra (ej: "Escribinos tu consulta") — sin revelar que
    existe un modo admin (SC-001)
  - Al enviar, llama a `ingresarCodigoAdmin`; si es correcto, navega a `/admin`; si no, no muestra ningún error
    revelador (FR-001, scenario "código incorrecto")
- [ ] T008 Integrar `EasterEggAyuda` en `src/app/ayuda/page.tsx` (mantener el resto del texto de ayuda)
- [ ] T009 Crear `src/app/admin/page.tsx` (server):
  - Llama a `esAdmin()`; si no es admin → redirige a `/` (o muestra "No autorizado" sin pistas)
  - Si es admin → renderiza el dashboard con los datos de `obtenerTotales`, `obtenerDesglosePorServicio` e
    `obtenerHistorialPaginado` (FR-004 a FR-006)
- [ ] T010 En `src/app/page.tsx`: si `esAdmin()` es true, mostrar enlace "Panel" en el header (junto a "Ayuda") para
  acceso rápido (FR-003, persistencia del rol)

**Checkpoint**: Con el código correcto en Ayuda se llega a `/admin`; sin él, `/admin` redirige y no hay pistas del
easter egg (SC-001, SC-003).

---

## Phase 4: Componentes del Dashboard

**Purpose**: UI del panel: totales, desglose, historial y gestión de servicios.

- [ ] T011 Crear `src/components/admin/TarjetaTotal.tsx`:
  - Tarjeta con etiqueta ("Hoy", "Semana", "Mes") y monto formateado con `formatearMoneda`
- [ ] T012 Crear `src/components/admin/DesgloseServicios.tsx`:
  - Lista/tabla con nombre del servicio, cantidad de registros y monto total
- [ ] T013 Crear `src/components/admin/HistorialRegistros.tsx` (client):
  - Lista paginada de registros con fecha formateada, nombre del servicio, cantidad, precio unitario, total y nota
  - Botones "Anterior"/"Siguiente" (FR-006, edge case de volumen)
- [ ] T014 Crear `src/components/admin/FormularioServicio.tsx` (client):
  - Alta/edición: nombre, slug (solo alta), precio por defecto, presets (separados por coma), unidad, activo
  - Guarda vía `crearServicio`/`actualizarServicio` y refresca (FR-007)
- [ ] T015 Crear `src/components/admin/ListaServicios.tsx`:
  - Lista todos los servicios (activos e inactivos) con botones Editar y Desactivar/Activar (FR-007)
- [ ] T016 Componer el dashboard en `src/app/admin/page.tsx` con todos los componentes y un botón "Cerrar sesión admin"
  (llama a `cerrarSesionAdmin`)

**Checkpoint**: El panel muestra totales/desglose/historial reales y permite gestionar servicios desde la UI
(FR-004 a FR-007). El rol persiste al recargar (FR-003).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Calidad general y cierre.

- [ ] T017 Verificar SC-003: buscar `ADMIN_CODE` y el código real en el bundle de producción (`next build` + buscar en
  `.next/static`) — no debe aparecer
- [ ] T018 Verificar responsive: dashboard usable en mobile y desktop
- [ ] T019 Lint (`npm run lint`) y build (`npm run build`) sin errores
- [ ] T020 Revisar clean code: funciones pequeñas, nombres en español, DRY, sin lógica duplicada
- [ ] T021 Commit por fase con mensajes `feature: admin - ...`

**Checkpoint**: Feature 4 completa, desplegada y verificada en producción.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Sesión Admin (Phase 1)**: Depende de migración 001 (configuracion nueva) — bloquea todo el panel
- **Repositorios (Phase 2)**: Depende de Phase 1 — independiente de la UI
- **Easter Egg + Ruta /admin (Phase 3)**: Depende de Phases 1 y 2
- **Componentes del Dashboard (Phase 4)**: Depende de Phase 3
- **Polish (Phase 5)**: Depende de Phase 4

### Dentro de cada fase

- Server action y cookie antes que la UI
- Repositorio antes que el componente que lo consume
- Verificar checkpoint antes de pasar a la siguiente fase
- Lint + build corriendo al final de cada fase

---

## Notes

- **El tag `[P]` no aplica**: la verificación es manual con `npm run dev` + lint + build (sin framework de tests aún)
- **Cookie firmada**: usar `node:crypto` (HMAC-SHA256). El secreto `ADMIN_COOKIE_SECRET` es variable de entorno; si no
  existe, se usa un fallback que impide firmar en producción (log de advertencia)
- **Valor efectivo del código**: `configuracion.admin_code` si existe; si no, `process.env.ADMIN_CODE`. Al primer uso,
  `grabarCodigoDefault()` inserta la env var en la tabla para permitir cambiarlo luego (FR-008)
- **RLS**: las tablas siguen el patrón permisivo de anon (uso doméstico, sin multi-tenant); el control real de acceso al
  panel está en `esAdmin()` + cookie firmada
- **No borrado físico**: los servicios solo se desactivan (`activo = false`); los registros históricos se conservan
- **Historial paginado**: `tamanoPagina = 50` por defecto; se pagina con `.range()` de Supabase
- **Los totales** se calculan desde `registros.total` filtrando por `creado_en >= inicioDePeriodo`
- **Este feature es el consumidor final de los registros** de la Feature 3 (pantalla de cobro)
