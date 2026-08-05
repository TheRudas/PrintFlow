# Implementation Plan: Escaneo NFC

**Date**: 05/08/2026
**Specs**:

- [003-EscaneoNFC.md](/docs/spec/003-EscaneoNFC.md)

## Summary

Completar la feature de NFC. La parte de apertura por sticker (US1: ruta `/nfc/{slug}`) ya está implementada en la
Feature 3. Este plan cubre:

- **US2**: botón "Escanear" en la pantalla de cobro (Web NFC API) que preselecciona el servicio sin recargar.
- **US3**: grabar (escribir) el enlace de un servicio en un sticker desde el panel de administración.
- **US4**: instructivo paso a paso para grabar stickers con la app NFC Tools.

La implementación usa la **Web NFC API** (`NDEFReader`), disponible solo en Chrome para Android sobre HTTPS.
En dispositivos sin soporte, el botón no se muestra y la selección manual sigue funcionando (FR-006).

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router), React 19
**Primary Dependencies**: Web NFC API (`NDEFReader`) — sin librerías externas
**Storage**: no requiere cambios de base de datos
**Testing**: lint + build + verificación manual en Android real con Chrome
**Target Platform**: PWA mobile (Android/Chrome)
**Project Type**: Web (App Router)
**Performance Goals**: escaneo y grabado en <1s tras acercar el sticker (SC-002)
**Constraints**: Web NFC solo funciona en contextos seguros (HTTPS) y requiere gesto del usuario (tocar el botón).
El botón debe ocultarse cuando no hay soporte. El slug se extrae de registros de tipo URL o texto (edge case).
**Scale/Scope**: Operativo de la tienda. US1 ya implementado; este plan completa US2, US3 y US4.

## Project Structure

### Documentation (this feature)

```text
docs/
├── spec/
│   └── 003-EscaneoNFC.md        ← Este spec
└── plan/
    └── EscaneoNFC.md            # Este archivo
```

### Archivos que agrega o modifica este feature

```text
src/
├── app/
│   └── admin/
│       └── page.tsx                     # MOD: sección "Stickers NFC" con instructivo y URLs
├── lib/
│   └── nfc/
│       ├── tipos.ts                     # NUEVA: tipos de la Web NFC API (NDEFReader, eventos)
│       └── utilidades.ts                # NUEVA: nfcSoportado(), extraerSlugDeRecord(), urlDeSticker()
└── components/
    ├── cobro/
    │   ├── PantallaCobro.tsx            # MOD: integra BotonEscanear
    │   └── BotonEscanear.tsx            # NUEVA: botón + lógica de lectura NFC
    └── admin/
        ├── ListaServicios.tsx           # MOD: botón "Grabar sticker" por servicio
        ├── BotonGrabarSticker.tsx       # NUEVA: escribe el enlace en el sticker (US3)
        └── InstructivoStickers.tsx      # NUEVA: instructivo NFC Tools + URLs copiables (US4)
```

**Structure Decision**: la lógica NFC se aísla en `lib/nfc/` (tipos + utilidades puras) para no repetirla entre el
botón de escanear y el de grabar (DRY). Los componentes son de presentación; `BotonEscanear` y `BotonGrabarSticker`
son `'use client'` porque interactúan con la Web NFC API. La preselección al escanear reutiliza
`seleccionarServicio` de `PantallaCobro`.

---

## Phase 1: Tipos y Utilidades NFC

**Purpose**: Base compartida para lectura y escritura.

- [ ] T001 Crear `src/lib/nfc/tipos.ts` con las declaraciones de la Web NFC API:
  - `NDEFReader` (métodos `scan()`, `write()`, propiedad `onreading`)
  - `NDEFReadingEvent` (propiedad `message.records`)
  - `NDEFRecord` (propiedades `type`, `data`)
  - `NDEFMessageInit` (para escritura)
- [ ] T002 Crear `src/lib/nfc/utilidades.ts`:
  - `nfcSoportado()` → `typeof window !== "undefined" && "NDEFReader" in window`
  - `extraerSlugDeRecords(records)` → recorre los records, acepta URL (`https://.../nfc/{slug}`) o texto
    (`nfc/{slug}` o el slug directo), normaliza y devuelve `string | null`
  - `urlDeSticker(slug)` → `` `${window.location.origin}/nfc/${slug}` ``

**Checkpoint**: utilidades puras sin errores de tipos; `nfcSoportado` correcto en dev (PC → false).

---

## Phase 2: Botón "Escanear" en la Pantalla de Cobro (US2)

**Purpose**: Leer un sticker con la app abierta y preseleccionar el servicio.

- [ ] T003 Crear `src/components/cobro/BotonEscanear.tsx` (client):
  - Si `!nfcSoportado()` → renderiza `null` (FR-006, scenario "sin soporte")
  - Estado inicial: botón "Escanear sticker"
  - Al tocar: `new NDEFReader().scan()`; si da permiso → estado "Acercá el sticker..."
  - En `onreading`: `extraerSlugDeRecords(message.records)` → llama `onSlugLeido(slug)` → se detiene
    (`reader.stop()` o flag) para evitar lecturas repetidas
  - En error de permiso → mensaje claro y vuelve a estado inicial
- [ ] T004 Integrar en `src/components/cobro/PantallaCobro.tsx`:
  - Renderizar `BotonEscanear` sobre el selector de servicios
  - `onSlugLeido`: buscar servicio por slug en `servicios`; si existe → `seleccionarServicio(servicio)`; si no →
    mensaje "Este servicio ya no está disponible" (edge case del spec)

**Checkpoint**: con la app abierta en Android, tocar el botón y acercar el sticker preselecciona el servicio correcto
sin recargar.

---

## Phase 3: Grabar Sticker desde el Panel (US3)

**Purpose**: Escribir el enlace de un servicio en un sticker NFC virgen.

- [ ] T005 Crear `src/components/admin/BotonGrabarSticker.tsx` (client):
  - Si `!nfcSoportado()` → renderiza `null`
  - Al tocar: `new NDEFReader().write({ records: [{ type: "url", data: urlDeSticker(slug) }] })`
  - Estados: "Grabar sticker" → "Acercá el sticker..." → "Sticker grabado" / error "No se pudo grabar el sticker"
- [ ] T006 Integrar en `src/components/admin/ListaServicios.tsx`: botón por servicio (junto a Editar/Desactivar)

**Checkpoint**: con el panel abierto en Android, elegir un servicio, tocar "Grabar sticker" y acercar un sticker
virgen lo graba con el enlace correcto (SC-002).

---

## Phase 4: Instructivo NFC Tools (US4)

**Purpose**: Alternativa robusta y masiva para grabar muchos stickers.

- [ ] T007 Crear `src/components/admin/InstructivoStickers.tsx` (server-safe):
  - Pasos: 1) instalar NFC Tools, 2) abrir app, 3) tocar "Write", 4) "Add a record" → "URI", 5) pegar el enlace,
    6) "Write" y apoyar el sticker
  - Lista de servicios con su URL de sticker y botón "Copiar" (navigator.clipboard)
  - Nota: el enlace debe apuntar al dominio actual de producción (edge case "dominio viejo")
- [ ] T008 Agregar la sección "Stickers NFC" en `src/app/admin/page.tsx` (recibe los servicios ya cargados)

**Checkpoint**: un administrador puede seguir el instructivo y grabar stickers con NFC Tools usando las URLs
copiables (SC-002).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Calidad general y cierre.

- [ ] T009 Lint (`npm run lint`) y build (`npm run build`) sin errores
- [ ] T010 Verificar que el botón de escaneo NO aparece en desktop/dev (PC sin NFC)
- [ ] T011 Revisar clean code: funciones pequeñas, nombres en español, DRY (reuso de utilidades NFC)
- [ ] T012 Commit por fase con mensajes `feature: nfc - ...`
- [ ] T013 **Checklist de prueba manual en Android** (la hace el usuario con su celular):
  - [ ] Grabar un sticker desde el panel y escanearlo (abre la app en el servicio correcto)
  - [ ] Con la app abierta, usar "Escanear" y acercar el sticker (preselecciona sin recargar)
  - [ ] Intentar grabar sobre un sticker no compatible (muestra error claro)
  - [ ] Verificar que la selección manual sigue funcionando (FR-006)

**Checkpoint**: Feature 003 completa, desplegada y verificada en un Android real.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Tipos y Utilidades (Phase 1)**: sin dependencias — puede comenzar de inmediato
- **Botón Escanear (Phase 2)**: depende de Phase 1
- **Grabar Sticker (Phase 3)**: depende de Phase 1 (usa `urlDeSticker`)
- **Instructivo NFC Tools (Phase 4)**: sin dependencias de las otras fases (solo necesita la lista de servicios ya
  existente)
- **Polish (Phase 5)**: depende de Phases 2-4

### Dentro de cada fase

- Utilidades antes que componentes
- Verificar checkpoint antes de pasar a la siguiente fase
- Lint + build corriendo al final de cada fase

---

## Notes

- **El tag `[P]` no aplica**: la verificación es manual con `npm run dev` + lint + build
- **Web NFC requiere gesto de usuario**: `scan()` y `write()` deben llamarse desde un clic (no en `useEffect`)
- **El `reader` debe detenerse tras el primer `onreading`** para no capturar stickers repetidos en la misma sesión
- **`urlDeSticker` usa `window.location.origin`** para que el enlace apunte siempre al dominio en uso (edge case
  "dominio viejo": si se cambia el dominio, se re-graban los stickers)
- **El botón se oculta si no hay soporte** (`nfcSoportado() === false`) — nunca rompe la app en otros dispositivos
- **El tipo de record correcto para escritura es `"url"`**; la lectura acepta tanto `"url"` como `"text"` (edge case
  del spec)
