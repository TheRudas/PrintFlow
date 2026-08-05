# Feature Specification: Cuentas y Autenticación

**Created**: 05/08/2026

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Iniciar Sesión con Correo y Contraseña (Priority: P1)

Como **Empleado o Administrador**, quiero entrar a la app con mi correo y contraseña, para usar la app con mi propia
cuenta y rol.

**Why this priority**: Sin login no hay roles. Es la base de todo el modelo de cuentas.

**Independent Test**: Una persona abre la app, completa correo y contraseña y entra. El test es exitoso si ve la
pantalla de cobro (o el panel si es admin) y su sesión queda guardada.

**Acceptance Scenarios**:

1. **Scenario: Login exitoso**
    - **Given** una cuenta existente.
    - **When** la persona ingresa sus credenciales correctas.
    - **Then** entra a la app y ve la pantalla correspondiente a su rol.

2. **Scenario: Login fallido**
    - **Given** una cuenta existente.
    - **When** la persona ingresa una contraseña incorrecta.
    - **Then** la app muestra "Correo o contraseña incorrectos".

3. **Scenario: Sesión persistente**
    - **Given** una persona logueada.
    - **When** cierra y reabre la app.
    - **Then** sigue logueada sin volver a pedir credenciales (SC-004).

---

### User Story 2 - Cerrar Sesión (Priority: P2)

Como **cualquier usuario**, quiero poder cerrar sesión, para que otra persona pueda usar la app con su cuenta en el
mismo dispositivo.

**Why this priority**: Permite compartir un celular entre el dueño y los empleados.

**Independent Test**: Un usuario logueado toca "Cerrar sesión". El test es exitoso si vuelve a la pantalla de login y
sus datos protegidos ya no son visibles.

**Acceptance Scenarios**:

1. **Scenario: Cerrar sesión**
    - **Given** un usuario logueado.
    - **When** toca "Cerrar sesión".
    - **Then** vuelve al login y el dispositivo queda sin sesión activa.

---

### User Story 3 - Crear Cuenta de Empleado (solo Admin) (Priority: P1)

Como **Administrador**, quiero crear la cuenta de un empleado (correo + contraseña) desde el panel, para que mis
padres puedan entrar con su propia cuenta.

**Why this priority**: Es cómo se crean las cuentas de los operadores.

**Independent Test**: El Admin crea una cuenta con correo y contraseña desde el panel. El test es exitoso si esa
persona puede iniciar sesión con esas credenciales y ve la pantalla de cobro.

**Acceptance Scenarios**:

1. **Scenario: Crear cuenta de empleado**
    - **Given** el rol Admin.
    - **When** el Admin crea una cuenta (correo + contraseña).
    - **Then** la persona puede iniciar sesión y su rol es `empleado`.

2. **Scenario: Correo duplicado**
    - **Given** que ya existe una cuenta con ese correo.
    - **When** el Admin intenta crearla de nuevo.
    - **Then** la app muestra "Ya existe una cuenta con ese correo".

3. **Scenario: Empleado intenta crear cuentas**
    - **Given** una cuenta de Empleado.
    - **When** intenta crear otra cuenta.
    - **Then** la acción se bloquea en el servidor.

---

### User Story 4 - Cuenta del Dueño (Administrador) (Priority: P1)

Como **Administrador**, quiero tener mi cuenta marcada como `admin` para que al iniciar sesión tenga acceso total.

**Why this priority**: Es la cuenta que gestiona todo el negocio.

**Independent Test**: La cuenta del dueño existe con rol `admin` en `perfiles`. Al iniciar sesión, ve el panel. El test
es exitoso si solo esa cuenta tiene rol `admin`.

**Acceptance Scenarios**:

1. **Scenario: Cuenta admin funcional**
    - **Given** la cuenta del dueño con rol `admin`.
    - **When** inicia sesión.
    - **Then** ve el link "Panel" y las acciones de administración.

---

### User Story 5 - Restablecer Contraseña (Priority: P3)

Como **Administrador**, quiero poder cambiar la contraseña de una cuenta de empleado desde el panel, para ayudar a
mis padres si la olvidan.

**Why this priority**: Soporte operativo; no bloquea el lanzamiento.

**Independent Test**: El Admin cambia la contraseña de una cuenta. El test es exitoso si esa persona entra con la
nueva contraseña y la vieja deja de funcionar.

**Acceptance Scenarios**:

1. **Scenario: Cambiar contraseña**
    - **Given** el rol Admin.
    - **When** el Admin define una nueva contraseña para un empleado.
    - **Then** el empleado entra con la nueva contraseña.

---

## Edge Cases

- **¿Qué pasa si el correo ya existe?**  
  La creación de cuenta se rechaza con "Ya existe una cuenta con ese correo".
- **¿Qué pasa si el dispositivo queda sin sesión y alguien escanea un NFC?**  
  Se redirige al login; tras iniciar sesión, se intenta preservar el servicio preseleccionado.
- **¿Qué pasa si dos personas comparten un celular?**  
  Cada una cierra sesión e inicia la suya; el rol de cada cuenta es independiente.
- **¿Qué pasa si la contraseña es muy corta?**  
  Supabase exige un mínimo (6 caracteres por defecto) y el formulario lo valida.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema **DEBE** autenticar con correo y contraseña mediante Supabase Auth.
- **FR-002**: El sistema **DEBE** redirigir al login a cualquier usuario sin sesión activa.
- **FR-003**: El sistema **DEBE** guardar la sesión entre recargas (Supabase mantiene la sesión).
- **FR-004**: Solo el rol **Administrador** **DEBE** poder crear cuentas de empleados y cambiar contraseñas.
- **FR-005**: El sistema **DEBE** asignar rol `empleado` a las cuentas creadas por el Admin.
- **FR-006**: El sistema **DEBE** tener una cuenta `admin` (la del dueño) creada en el setup.
- **FR-007**: El sistema **NO DEBE** permitir dos cuentas con el mismo correo.
- **FR-008**: El rol **DEBE** leerse de `perfiles` en el servidor, nunca del navegador.

### Key Entities

1. **Cuenta (Supabase Auth)**:
    - Correo + contraseña gestionados por Supabase.
    - Identificada por `id` (UUID de auth.users).

2. **Perfil (tabla `perfiles`)**:
    - `id` (FK → auth.users), `nombre`, `rol` (`admin` | `empleado`), `creado_en`.
    - RLS: lectura/escritura solo para usuarios autenticados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El login funciona con correo + contraseña en menos de 3 segundos.
- **SC-002**: La sesión persiste entre recargas hasta cerrar sesión manualmente.
- **SC-003**: Solo el dueño (rol `admin`) puede crear cuentas; ningún empleado puede, ni por UI ni por request directo.
- **SC-004**: Un usuario sin sesión no ve ninguna pantalla protegida.
