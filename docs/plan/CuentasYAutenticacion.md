# Implementation Plan: Cuentas y Autenticación

**Date**: 05/08/2026
**Specs**:

- [006-CuentasYAutenticacion.md](/docs/spec/006-CuentasYAutenticacion.md)
- [000-Roles.md](/docs/spec/000-Roles.md) (roles por cuenta)

## Summary

Reemplazar el modelo de "easter egg por dispositivo" por **cuentas con correo y contraseña** usando Supabase Auth.
Cada persona (dueño, madre, padre) tiene su propia cuenta. El rol (`admin` o `empleado`) se guarda en la tabla
`perfiles`. El dueño (rol `admin`) crea las cuentas de los empleados desde el panel y puede cambiar sus contraseñas.

Se elimina el easter egg (código secreto + cookie firmada). El acceso a acciones protegidas se valida en el servidor
contra la sesión autenticada y el rol de `perfiles`.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router), React 19
**Primary Dependencies**: @supabase/supabase-js, **@supabase/ssr** (nuevo), @supabase/auth-js (transitivo)
**Storage**: Supabase — Auth (email/password) + tabla nueva `perfiles`
**Testing**: lint + build + verificación manual de login en `npm run dev`
**Target Platform**: PWA mobile y desktop
**Project Type**: Web (App Router)
**Performance Goals**: login en <3s (SC-001); sesión persistente sin re-loguear (SC-002)
**Constraints**: Las acciones protegidas se validan en el servidor con la sesión (FR-007/FR-008 del spec 000). La
pantalla de cobro exige sesión activa. El NFC abre `/nfc/{slug}` → si no hay sesión, redirige al login.
**Scale/Scope**: Refactor de autenticación y roles. Reemplaza por completo el código del easter egg.

## Project Structure

### Documentation (this feature)

```text
docs/
├── spec/
│   ├── 000-Roles.md                   ← actualizado a cuentas
│   └── 006-CuentasYAutenticacion.md   ← Este spec
└── plan/
    └── CuentasYAutenticacion.md       # Este archivo
```

### Archivos que agrega o modifica este feature

```text
supabase/
└── migrations/
    └── {timestamp}_perfiles.sql                 # NUEVA: tabla perfiles + RLS

src/
├── middleware.ts o proxy.ts                     # NUEVA: refresco de sesión (según convención Next 16)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                            # MOD: createBrowserClient (SSR)
│   │   ├── server.ts                            # NUEVA: createServerClient (SSR, lee cookies)
│   │   └── database.types.ts                    # MOD: tipo perfiles
│   ├── auth/
│   │   ├── acciones.ts                          # NUEVA: 'use server' — iniciarSesion, cerrarSesion,
│   │   │                                        #        obtenerUsuarioActual, esAdmin,
│   │   │                                        #        crearCuentaEmpleado, cambiarContrasena
│   │   └── perfiles.ts                          # NUEVA: obtenerPerfilPorUsuarioId, asignarRol
│   └── admin/
│       ├── cookie.ts                            # ELIMINAR (ya no aplica)
│       └── acciones.ts                          # ELIMINAR (reemplazado por lib/auth/acciones.ts)
├── app/
│   ├── page.tsx                                 # MOD: exige sesión (redirige a /ingresar si no hay)
│   ├── nfc/[slug]/page.tsx                      # MOD: exige sesión (redirige a /ingresar si no hay)
│   ├── admin/page.tsx                           # MOD: usa esAdmin() desde auth (rol perfiles)
│   ├── ingresar/page.tsx                        # NUEVA: pantalla de login
│   └── ayuda/page.tsx                           # MOD: quitar EasterEggAyuda (contenido normal)
└── components/
    ├── auth/
    │   └── FormularioIngreso.tsx                # NUEVA: formulario correo+contraseña (client)
    ├── admin/
    │   ├── EasterEggAyuda.tsx                   # ELIMINAR
    │   ├── CerrarSesionAdmin.tsx                # MOD: pasa a "Cerrar sesión" genérico (auth)
    │   └── FormularioCuenta.tsx                 # NUEVA: crear cuenta de empleado (client)
    └── cobro/
        └── PantallaCobro.tsx                    # sin cambios funcionales
```

**Structure Decision**: la autenticación se aísla en `lib/auth/` (acciones server + perfiles). El acceso a Supabase
desde el server usa `createServerClient` (lee cookies de sesión); el browser usa `createBrowserClient`. Los roles se
centralizan en `obtenerUsuarioActual()` y `esAdmin()`. Se elimina todo el código del easter egg (DRY y limpieza).

---

## Phase 1: Infraestructura de Auth (SSR)

**Purpose**: Clientes de Supabase con soporte de sesión (cookies) en server y browser.

- [ ] T001 Instalar `@supabase/ssr`
- [ ] T002 Crear `src/lib/supabase/server.ts`:
  - `crearClienteServidor()` → `createServerClient(url, anonKey, { cookies: { getAll/setAll } })`
  - Lee y escribe la cookie de sesión de Supabase (`sb-{ref}-auth-token`)
- [ ] T003 Modificar `src/lib/supabase/client.ts` → `createBrowserClient(url, anonKey)` (SSR)
- [ ] T004 Crear proxy de refresco de sesión (convención Next 16: `src/proxy.ts` o `middleware.ts`):
  - En cada request, crea el server client, refresca la sesión y actualiza cookies
- [ ] T005 Agregar `ADMIN_EMAIL` a `.env.example` (correo del dueño para el setup) y documentar

**Checkpoint**: los clientes compilan; la cookie de sesión se refresca en cada request.

---

## Phase 2: Base de Datos — tabla `perfiles` + RLS

**Purpose**: Guardar el rol de cada cuenta.

- [ ] T006 Migración `perfiles`:
  - `id` (uuid, PK, FK → auth.users on delete cascade)
  - `nombre` (text), `rol` (text: `admin` | `empleado`), `creado_en` (timestamptz default now())
  - RLS: habilitar; políticas para usuarios autenticados (leer su propio perfil; el admin lee todos)
- [ ] T007 Regenerar `database.types.ts` con la tabla nueva
- [ ] T008 Migrar RLS de `servicios` y `registros`: de `anon` a **usuarios autenticados** (`to authenticated`)
  - `servicios`: SELECT authenticated; INSERT/UPDATE solo admin (vía rol) — en la práctica el server valida con
    `esAdmin()`; RLS autenticado para SELECT y write restringido
  - `registros`: SELECT/INSERT authenticated
- [ ] T009 Definir el tipo `Perfil` en `src/lib/types.ts`

**Checkpoint**: `perfiles` creada y RLS aplicado; `database.types.ts` actualizado.

---

## Phase 3: Acciones de Autenticación (Server)

**Purpose**: login, logout, sesión actual, roles y gestión de cuentas.

- [ ] T010 Crear `src/lib/auth/acciones.ts` (`'use server'`):
  - `iniciarSesion(correo, contrasena)` → `supabase.auth.signInWithPassword`; devuelve `{ exito, error? }`
  - `cerrarSesion()` → `signOut()`
  - `obtenerUsuarioActual()` → devuelve `{ usuario, perfil } | null` (session + perfil)
  - `esAdmin()` → boolean (sesión activa y perfil.rol === 'admin')
  - `crearCuentaEmpleado(correo, contrasena, nombre)` → solo si esAdmin; crea user en Supabase y perfil `empleado`
  - `cambiarContrasena(usuarioId, nuevaContrasena)` → solo si esAdmin (FR-005 spec 006)
- [ ] T011 Crear `src/lib/auth/perfiles.ts`:
  - `obtenerPerfilPorUsuarioId(id)` → Perfil | null
  - `asignarRol(usuarioId, rol)` → upsert en perfiles

**Checkpoint**: login/logout funcionan; `esAdmin()` refleja el rol de perfiles; crear cuenta de empleado funciona.

---

## Phase 4: Protección de Rutas y Login

**Purpose**: pantalla de login y rutas que exigen sesión.

- [ ] T012 Crear `src/app/ingresar/page.tsx` + `src/components/auth/FormularioIngreso.tsx` (client):
  - Correo + contraseña; botón "Ingresar"; error "Correo o contraseña incorrectos"
  - Redirige a `/` al éxito
- [ ] T013 Modificar `src/app/page.tsx` (cobro): si no hay sesión → `redirect("/ingresar")`
- [ ] T014 Modificar `src/app/nfc/[slug]/page.tsx`: si no hay sesión → `redirect("/ingresar")` (preservando el slug
  para preseleccionar tras el login cuando sea posible)
- [ ] T015 Modificar `src/app/admin/page.tsx`: usar `esAdmin()` (nuevo, basado en perfiles); si no → redirect `/`
- [ ] T016 Agregar link "Cerrar sesión" en el header de `/` (client component de auth) y quitar dependencias del
  easter egg

**Checkpoint**: sin sesión todo redirige a `/ingresar`; con sesión de empleado solo se ve cobro; con admin se ve panel.

---

## Phase 5: Gestión de Cuentas en el Panel + Limpieza

**Purpose**: el Admin crea cuentas de empleados desde el panel; se elimina el easter egg.

- [ ] T017 Crear `src/components/admin/FormularioCuenta.tsx` (client): crear empleado (correo, contraseña, nombre)
- [ ] T018 Agregar sección "Cuentas" en `src/app/admin/page.tsx` (listar perfiles + crear empleado + cambiar
  contraseña)
- [ ] T019 Eliminar `EasterEggAyuda.tsx` y su uso en `ayuda/page.tsx`
- [ ] T020 Eliminar `src/lib/admin/cookie.ts` y `src/lib/admin/acciones.ts`; mover lo que siga vigente a `lib/auth/`
- [ ] T021 Eliminar variable `ADMIN_CODE`/`ADMIN_COOKIE_SECRET` de `.env.example` y de Vercel (limpieza)

**Checkpoint**: el Admin crea cuentas desde el panel; los empleados entran con ellas; no queda rastro del easter egg.

---

## Phase 6: Setup de la Cuenta del Dueño + Polish

**Purpose**: asegurar que la cuenta del dueño sea `admin` y cierre del feature.

- [ ] T022 Setup: crear la cuenta del dueño (correo + contraseña) via Supabase Auth (admin API) y asignarle rol
  `admin` en `perfiles`
- [ ] T023 Lint (`npm run lint`) y build (`npm run build`) sin errores
- [ ] T024 Revisar clean code: nombres en español, funciones pequeñas, DRY (roles centralizados)
- [ ] T025 Commit por fase con mensajes `feature: auth - ...`
- [ ] T026 **Checklist de prueba manual**:
  - [ ] Sin sesión, `/` redirige a `/ingresar`
  - [ ] Login del dueño → ve el panel
  - [ ] Login de un empleado → ve solo el cobro, `/admin` lo redirige
  - [ ] El Admin crea una cuenta de empleado y esa persona entra
  - [ ] Cerrar sesión → vuelve al login
  - [ ] El sticker NFC sigue abriendo la app (redirige a login si no hay sesión)

**Checkpoint**: Feature 006 completa, desplegada y verificada.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Infraestructura Auth (Phase 1)**: sin dependencias — puede comenzar de inmediato
- **Base de Datos (Phase 2)**: depende de Phase 1 (tipos) — puede correr en paralelo
- **Acciones Auth (Phase 3)**: depende de Phases 1 y 2
- **Protección de Rutas (Phase 4)**: depende de Phase 3
- **Gestión de Cuentas + Limpieza (Phase 5)**: depende de Phases 3 y 4
- **Setup Dueño + Polish (Phase 6)**: depende de Phases 4 y 5

### Dentro de cada fase

- Clientes/acciones antes que componentes
- RLS antes que las acciones que las usan
- Verificar checkpoint antes de pasar a la siguiente fase
- Lint + build corriendo al final de cada fase

---

## Notes

- **@supabase/ssr**: el cliente server (`createServerClient`) lee/escribe cookies; el proxy refresca la sesión en cada
  request (convención `src/proxy.ts` o `middleware.ts` según Next 16)
- **RLS**: pasar de `anon` a `authenticated` en `servicios` y `registros`. Las políticas de escritura pueden
  restringirse al admin vía rol en la DB, pero la validación principal queda en el server (`esAdmin()`)
- **El NFC no cambia**: el sticker sigue abriendo `/nfc/{slug}`; si no hay sesión, redirige al login. La preselección
  del servicio tras login se intenta preservar vía query param
- **Setup del dueño**: se crea la cuenta del dueño con el correo en `ADMIN_EMAIL` y se le asigna rol `admin`. No se
  debe exponer su contraseña en el repo; se define en el momento del setup
- **Se elimina por completo el easter egg**: `EasterEggAyuda.tsx`, `lib/admin/cookie.ts`, `lib/admin/acciones.ts` y las
  variables `ADMIN_CODE`/`ADMIN_COOKIE_SECRET`
