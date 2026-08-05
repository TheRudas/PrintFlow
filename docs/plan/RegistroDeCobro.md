# Implementation Plan: Registro de Cobro

**Date**: 05/08/2026
**Specs**:

- [002-RegistroCobro.md](/docs/spec/002-RegistroCobro.md)
- [003-EscaneoNFC.md](/docs/spec/003-EscaneoNFC.md) (ruta `/nfc/{slug}`)

## Summary

El **Operador** debe poder registrar una venta (impresión o fotocopia) en menos de 10 segundos. El flujo arranca con un
sticker NFC que abre la ruta `/nfc/{slug}` y preselecciona el servicio, o con la selección manual. La pantalla de cobro
permite elegir el precio de tres formas (presets, precio por defecto, monto libre), ajustar la cantidad de hojas con un
contador, ver el total en vivo y guardar el registro en `registros`.

La implementación separa las capas: tipos de dominio (`src/lib/types.ts`), acceso a datos (repositorios en
`src/lib/repos/`), componentes de UI (pantalla de cobro) y la ruta `/nfc/{slug}`. Se sigue el enfoque de clean code
del proyecto: nombres en español, funciones pequeñas de una sola responsabilidad, DRY y TypeScript estricto.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router, Turbopack)
**Primary Dependencies**: @supabase/supabase-js, React 19, Tailwind CSS 4
**Storage**: Supabase (Postgres) — tablas `servicios` y `registros` ya creadas (migración 001)
**Testing**: lint (`npm run lint`) + build (`npm run build`); verificación manual en `npm run dev`
**Target Platform**: PWA mobile (Android), responsive
**Project Type**: Web (App Router)
**Performance Goals**: Registro de venta en <10s (SC-001); total en vivo sin latencia perceptible (cálculo local)
**Constraints**: La ruta `/nfc/{slug}` es estática por defecto — debe marcarse como dinámica para leer el slug por
request. El precio debe validarse > 0 antes de guardar (FR-006). Sin soporte NFC, la selección manual debe funcionar
(FR-008).
**Scale/Scope**: Núcleo de la operación diaria. Bloquea el panel admin (spec 004) que consume estos registros.

## Project Structure

### Documentation (this feature)

```text
docs/
├── stakeholders.md
├── spec/
│   ├── 001-GestionServicios.md
│   ├── 002-RegistroCobro.md      ← Este spec
│   ├── 003-EscaneoNFC.md
│   ├── 004-PanelAdministracion.md
│   └── 005-ExportacionDatos.md
└── plan/
    └── RegistroDeCobro.md         # Este archivo
```

### Archivos que agrega este feature

```text
src/
├── app/
│   ├── page.tsx                         # Pantalla de cobro (selección de servicio + formulario)
│   └── nfc/
│       └── [slug]/
│           └── page.tsx                 # Ruta abierta por sticker NFC → redirige/oculta el formulario
├── lib/
│   ├── types.ts                         # Tipos Servicio, Registro, DatosNuevoRegistro (ya existen)
│   ├── formatear.ts                     # formatearMoneda (ya existe)
│   ├── supabase/
│   │   ├── client.ts                    # crearClienteSupabase (ya existe)
│   │   └── database.types.ts            # Tipos generados del esquema (ya existen)
│   └── repos/
│       ├── servicios.ts                 # obtenerServiciosActivos(), obtenerServicioPorSlug()
│       └── registros.ts                 # crearRegistro(datos)
└── components/
    └── cobro/
        ├── PantallaCobro.tsx            # Composición: selector + formulario + resumen
        ├── SelectorServicio.tsx         # Tarjetas de servicios activos
        ├── SelectorPrecio.tsx           # Presets / default / monto libre
        ├── ContadorCantidad.tsx         # +/- cantidad de hojas
        └── ResumenTotal.tsx             # Total en vivo + botón guardar
```

**Structure Decision**: Separación clara de responsabilidades. `lib/repos/` encapsula todo acceso a Supabase (sin SQL
ni clientes esparcidos en componentes). `components/cobro/` son componentes puros de presentación, sin lógica de datos.
`app/nfc/[slug]/page.tsx` es la entrada del sticker. Los componentes marcados `'use client'` porque manejan estado
interactivo (precio, cantidad, guardado).

---

## Phase 1: Setup y Fundamentos de Datos

**Purpose**: Preparar el acceso a datos y la ruta NFC antes de la UI interactiva

- [ ] T001 Crear `src/lib/repos/servicios.ts`:
  - `obtenerServiciosActivos()` → `Servicio[]` ordenado por nombre, filtrando `activo = true`
  - `obtenerServicioPorSlug(slug)` → `Servicio | null`, case-insensitive, solo activos
- [ ] T002 Crear `src/lib/repos/registros.ts`:
  - `crearRegistro(datos: DatosNuevoRegistro)` → inserta en `registros` (servicio_id, cantidad, precio_unitario,
    total, nota) y devuelve el registro creado
- [ ] T003 Crear la ruta dinámica `src/app/nfc/[slug]/page.tsx`:
  - Leer `params.slug` (async en Next 16) y resolver con `obtenerServicioPorSlug`
  - Si existe → redirigir a `/` con el servicio preseleccionado (query param `?servicio={id}`)
  - Si no existe → mostrar "Este servicio ya no está disponible" con botón para ir a la selección manual

**Checkpoint**: `obtenerServiciosActivos` y `crearRegistro` funcionan contra Supabase (verificable con un script
ad-hoc en `npm run dev`), y `/nfc/{slug}` resuelve el servicio o muestra el error.

---

## Phase 2: Pantalla de Cobro (UI)

**Purpose**: Construir la UI mobile-first que permite registrar la venta

- [ ] T004 Crear `src/components/cobro/SelectorServicio.tsx` (client):
  - Lista de tarjetas grandes con `nombre` y `unidad` de cada servicio activo
  - Al tocar una tarjeta → selecciona el servicio (estado en el padre)
  - Sirve como fallback manual cuando no hay NFC (FR-008)
- [ ] T005 Crear `src/components/cobro/SelectorPrecio.tsx` (client):
  - Muestra botones de presets (array `presets`) formateados con `formatearMoneda`
  - Botón "Precio del servicio" para usar `precio_por_defecto`
  - Campo de monto libre (input numérico) con validación > 0
  - Estado de precio unitario controlado por el padre
- [ ] T006 Crear `src/components/cobro/ContadorCantidad.tsx` (client):
  - Botones `+` y `-` con cantidad mínima `1` (FR-004)
  - Muestra cantidad actual en grande
- [ ] T007 Crear `src/components/cobro/ResumenTotal.tsx` (client):
  - Muestra `total = precio_unitario × cantidad` en vivo (FR-003), formateado con `formatearMoneda`
  - Botón "Guardar" (deshabilitado si no hay precio válido)
  - Estados de carga ("Guardando...") y éxito ("Venta registrada")
- [ ] T008 Crear `src/components/cobro/PantallaCobro.tsx` (client):
  - Compone SelectorServicio + SelectorPrecio + ContadorCantidad + ResumenTotal
  - Estado central: `servicio`, `precioUnitario`, `cantidad`, `nota`
  - Lee el query param `?servicio={id}` al montar para preselección por NFC
  - Maneja el guardado llamando `crearRegistro` y resetea el formulario al éxito
- [ ] T009 Actualizar `src/app/page.tsx`:
  - Pasar la lista de servicios activos a `PantallaCobro` (los obtiene del repositorio en el server component)
  - Header simple con nombre de la app y un enlace a "Ayuda" (placeholder para el easter egg del spec 004)

**Checkpoint**: Con `npm run dev`, un operador puede seleccionar un servicio (o llegar por `/nfc/{slug}`), elegir
precio, ajustar cantidad, ver el total en vivo y guardar. El registro aparece en Supabase.

---

## Phase 3: Validaciones y Estados de Error

**Purpose**: Cumplir las reglas de negocio y que la UI nunca deje al operador sin respuesta

- [ ] T010 Validación de precio: impedir guardar si `precioUnitario <= 0` o no definido (FR-006); validar monto libre
  con hasta 2 decimales
- [ ] T011 Validación de cantidad: mínimo `1`, entero (FR-004)
- [ ] T012 Manejo de error de guardado: si `crearRegistro` falla (sin conexión), mostrar mensaje claro y **no** perder
  los datos en pantalla (SC-004)
- [ ] T013 Agregar nota opcional (input pequeño) persistida en `registros.nota` (FR-007)

**Checkpoint**: Todos los casos de error del spec 002 se cubren con mensajes legibles para el operador.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Calidad general del feature

- [ ] T014 Verificar responsive: botones grandes y táctiles en mobile (≥44px), usables en desktop
- [ ] T015 Verificar que `/nfc/{slug}` funciona desplegado (producción) con un slug real
- [ ] T016 Lint (`npm run lint`) y build (`npm run build`) sin errores
- [ ] T017 Revisar nombres de variables y funciones en español, funciones pequeñas, sin lógica duplicada (DRY)
- [ ] T018 Commit por fase con mensajes `feature: cobro - ...`

**Checkpoint**: Feature 3 completa, desplegada y verificable en producción.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup y Fundamentos (Phase 1)**: Depende de la migración 001 (tablas ya creadas) — puede comenzar de inmediato
- **Pantalla de Cobro (Phase 2)**: Depende de Phase 1 (repositorios listos)
- **Validaciones (Phase 3)**: Depende de Phase 2 (UI montada)
- **Polish (Phase 4)**: Depende de Phase 3

### Dentro de cada fase

- Repositorio antes que componente (la UI consume el repositorio)
- Componente de presentación puro antes de componer `PantallaCobro`
- Verificar checkpoint antes de pasar a la siguiente fase
- Lint + build corriendo al final de cada fase

---

## Notes

- **El tag `[P]` no aplica en este plan** (no hay framework de tests configurado aún): la verificación es manual con
  `npm run dev` + lint + build. Si más adelante se agrega Vitest/Playwright, se escriben los tests de los specs
- **Next 16**: `params` es async; leer `await props.params`. La ruta `[slug]` debe usar `dynamic = 'force-dynamic'`
  (o leer el slug en un client component) para que no se cachee en build
- **Preselección por NFC**: se usa un query param `?servicio={id}` para que la misma pantalla `/` sirva para ambos
  flujos (sticker y manual). Alternativa: un estado de router; se decide en implementación
- **La nota (FR-007) es opcional**: no debe agregar fricción al flujo principal (US5 es P3)
- **Los presets se formatean** con `formatearMoneda` (es-AR, ARS) para consistencia visual
- **DRY**: el cálculo de total (`precio × cantidad`) se centraliza en una función del repositorio/componente padre,
  no se repite en cada hijo
- **Este feature es prerequisito del panel admin (spec 004)**: los registros guardados aquí alimentan los totales del
  dashboard
