# Feature Specification: Roles del Sistema

**Created**: 05/08/2026
**Updated**: 05/08/2026

**Alcance**: Este spec define los roles de la aplicación, qué puede hacer cada uno y qué le está **prohibido**.
Es un spec transversal: aplica a todos los demás (001 a 005) y es prerequisito conceptual de cualquier feature
futura. No introduce nuevas pantallas por sí solo; define el *quién puede hacer qué* en las existentes.

**Modelo de roles**: la app tiene **dos roles** — **Empleado** y **Administrador**. Los roles se asignan a **cuentas
con correo y contraseña** (Supabase Auth), no a dispositivos. El rol de cada cuenta queda en la tabla `perfiles`:
- **Administrador**: la cuenta del dueño del negocio. Es la única cuenta con poder total.
- **Empleado**: las cuentas de los operadores (padres), creadas por el Administrador desde el panel.

Toda persona (dueño o empleado) inicia sesión con su correo y contraseña. El rol de su cuenta define qué pantallas y
acciones ve.

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Iniciar Sesión con la Cuenta (Priority: P1)

Como **Empleado** (padre o madre que opera la caja), quiero entrar a la app con mi correo y contraseña, para registrar
ventas con mi propia cuenta.

**Why this priority**: Es la base del nuevo modelo: sin login no hay rol.

**Independent Test**: Un operador abre la app, se le pide correo y contraseña, ingresa los suyos y ve la pantalla de
cobro. El test es exitoso si entra a su cuenta y su sesión queda guardada.

**Acceptance Scenarios**:

1. **Scenario: Login exitoso**
    - **Given** una cuenta de Empleado creada por el Administrador.
    - **When** el operador ingresa su correo y contraseña correctos.
    - **Then** entra a la app y ve la pantalla de cobro.

2. **Scenario: Login fallido**
    - **Given** una cuenta existente.
    - **When** el operador ingresa la contraseña incorrecta.
    - **Then** la app muestra "Correo o contraseña incorrectos" sin revelar cuál falló.

3. **Scenario: Sin sesión activa**
    - **Given** un dispositivo sin sesión iniciada.
    - **When** el operador abre la app.
    - **Then** es redirigido a la pantalla de inicio de sesión.

---

### User Story 2 - Qué PUEDE hacer el Empleado (Priority: P1)

Como **Empleado**, quiero tener exactamente las herramientas que necesito para cobrar y nada más, para no equivocarme
ni tocar lo que no corresponde.

**Why this priority**: El exceso de opciones confunde al operador y arriesga la integridad de los datos del negocio.

**Independent Test**: Se revisa la lista de capacidades del rol Empleado contra lo que la app realmente muestra. El
test es exitoso si el Empleado puede registrar ventas completas y consultar Ayuda, y nada más.

**Acceptance Scenarios**:

1. **Scenario: Registrar una venta**
    - **Given** el Empleado con sesión iniciada.
    - **When** selecciona un servicio, elige precio, cantidad y guarda.
    - **Then** el registro se persiste correctamente y aparece en el historial (que solo el Admin puede ver).

2. **Scenario: Escanear un sticker NFC**
    - **Given** el Empleado con sesión iniciada y un sticker válido.
    - **When** acerca el celular al sticker.
    - **Then** la app abre la pantalla de cobro con ese servicio preseleccionado.

3. **Scenario: Consultar Ayuda**
    - **Given** el Empleado con sesión iniciada.
    - **When** toca "Ayuda".
    - **Then** ve el contenido de ayuda normal (cómo registrar ventas).

---

### User Story 3 - Qué NO PUEDE hacer el Empleado (Priority: P1)

Como **Empleado**, quiero que el sistema me impida acceder a configuración, estadísticas y datos sensibles, para que
no pueda romper nada ni ver información que no me corresponde.

**Why this priority**: La protección del negocio: precios, historial y configuración quedan en manos del dueño.

**Independent Test**: Se intenta acceder a cada acción protegida con una cuenta de Empleado. El test es exitoso si
**todas** fallan o se ocultan sin exponer información.

**Acceptance Scenarios**:

1. **Scenario: Ver totales o estadísticas**
    - **Given** el Empleado con sesión iniciada.
    - **When** intenta ver el panel o los totales.
    - **Then** no se muestra ningún dato; se redirige a la pantalla de cobro.

2. **Scenario: Crear, editar o desactivar servicios**
    - **Given** el Empleado con sesión iniciada.
    - **When** intenta modificar un servicio o sus precios.
    - **Then** la operación no está disponible en la UI y, de intentarse por URL o request directo, el servidor la
      rechaza.

3. **Scenario: Ver el historial de ventas**
    - **Given** el Empleado con sesión iniciada.
    - **When** intenta consultar registros pasados.
    - **Then** no ve el historial ni ningún detalle de ventas.

4. **Scenario: Crear cuentas o exportar datos**
    - **Given** el Empleado con sesión iniciada.
    - **When** intenta crear cuentas o exportar CSV.
    - **Then** ambas acciones están bloqueadas y ocultas.

---

### User Story 4 - Administrador (dueño) (Priority: P1)

Como **Administrador** (dueño del negocio), quiero entrar con mi cuenta y tener acceso total a estadísticas,
historial, configuración de servicios, exportación y creación de cuentas de empleados.

**Why this priority**: Es el único rol con poder total; su rol viene de su cuenta.

**Independent Test**: El dueño inicia sesión con su cuenta. El test es exitoso si ve el link "Panel" y las acciones
protegidas quedan disponibles.

**Acceptance Scenarios**:

1. **Scenario: Acceso por cuenta de admin**
    - **Given** la cuenta del dueño con rol `admin` en `perfiles`.
    - **When** el dueño inicia sesión.
    - **Then** ve el acceso al panel y todas las acciones de administración.

2. **Scenario: Empleado intenta /admin**
    - **Given** una cuenta de Empleado con sesión iniciada.
    - **When** el operador escribe `/admin` en el navegador.
    - **Then** el sistema lo redirige a la pantalla de cobro sin mostrar nada del panel.

---

### User Story 5 - Qué PUEDE hacer el Administrador (Priority: P1)

Como **Administrador**, quiero tener acceso completo a la administración del negocio, para gestionar precios,
consultar ventas, exportar datos y crear las cuentas de los empleados.

**Why this priority**: Es el rol de control total; sin estas capacidades la app no cumple su propósito de gestión.

**Acceptance Scenarios**:

1. **Scenario: Consulta completa**
    - **Given** el rol Admin.
    - **When** el administrador abre el panel.
    - **Then** ve totales (hoy/semana/mes), desglose por servicio, historial paginado y gestión de servicios.

2. **Scenario: Gestión de servicios**
    - **Given** el rol Admin.
    - **When** crea, edita o desactiva un servicio.
    - **Then** los cambios persisten y se reflejan al instante en la pantalla de cobro de los Empleados.

3. **Scenario: Crear cuenta de empleado**
    - **Given** el rol Admin.
    - **When** crea una cuenta de Empleado (correo + contraseña) desde el panel.
    - **Then** el Empleado puede iniciar sesión con esas credenciales y ve la pantalla de cobro.

4. **Scenario: Exportación de datos**
    - **Given** el rol Admin.
    - **When** exporta CSV.
    - **Then** descarga el archivo con los registros (una vez implementado el spec 005).

---

### User Story 6 - Qué NO PUEDE hacer el Administrador (Priority: P2)

Como **Administrador**, quiero que el sistema limite mi poder en ciertos puntos, para proteger la integridad
histórica de los datos aunque yo mismo pueda equivocarme.

**Why this priority**: Proteger el historial: los datos de ventas deben ser inmutables para poder auditar.

**Acceptance Scenarios**:

1. **Scenario: No borrar registros de venta**
    - **Given** registros existentes.
    - **When** el administrador intenta eliminar un registro de venta.
    - **Then** el sistema no permite el borrado físico; el historial es inmutable.

2. **Scenario: No borrar servicios con historia**
    - **Given** un servicio con registros asociados.
    - **When** el administrador intenta eliminar el servicio.
    - **Then** el sistema solo permite desactivarlo (`activo = false`), conservando el historial intacto.

---

## Edge Cases

- **¿Qué pasa si el operador olvida su contraseña?**  
  El Administrador puede restablecerla desde el panel (crea/cambia la contraseña de la cuenta) o el operador usa el
  flujo de recuperación de Supabase (a definir).
- **¿Qué pasa si se comparte el celular entre Empleado y dueño?**  
  El rol depende de la cuenta con sesión iniciada. Al cambiar de persona, se cierra sesión y se inicia con la otra
  cuenta.
- **¿Qué pasa si se intenta forjar una sesión?**  
  Supabase Auth maneja las sesiones con tokens firmados; no se pueden forjar desde el navegador.
- **¿Qué pasa si el dueño quiere agregar un empleado nuevo?**  
  Lo crea desde el panel con un correo y una contraseña; el empleado solo inicia sesión.
- **¿Qué pasa si un Empleado ve la ruta /admin en el historial del navegador?**  
  Al entrar, es redirigido a la pantalla de cobro sin ver nada; no hay fuga de información.
- **¿Qué pasa si nadie está logueado y alguien escanea un sticker?**  
  El sticker abre la app; como no hay sesión, se redirige al login. Tras iniciar sesión, se mantiene el servicio
  preseleccionado si es posible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema **DEBE** autenticar a las personas con correo y contraseña (Supabase Auth).
- **FR-002**: El rol **Empleado** **DEBE** poder: registrar ventas (selección de servicio, precio, cantidad, guardado)
  y consultar la pantalla de Ayuda.
- **FR-003**: El rol **Empleado** **NO DEBE** poder: ver totales o estadísticas, ver el historial, gestionar servicios,
  exportar datos ni crear cuentas.
- **FR-004**: El rol **Administrador** **DEBE** poder: todas las capacidades del Empleado, más ver totales y desglose,
  ver historial, gestionar servicios, exportar datos (spec 005) y crear/gestionar cuentas de Empleados.
- **FR-005**: El rol **Administrador** **NO DEBE** poder borrar físicamente registros de venta ni servicios con
  historia; los servicios solo se desactivan.
- **FR-006**: La sesión **DEBE** persistir en el dispositivo (Supabase mantiene la sesión entre recargas) hasta cerrar
  sesión manualmente.
- **FR-007**: Todo acceso a acciones protegidas **DEBE** validarse en el servidor (rol desde `perfiles`), no solo
  ocultarse en la UI.
- **FR-008**: El rol **NO** debe derivarse del código del navegador; se lee de la sesión autenticada en el servidor.

### Key Entities

1. **Cuenta (Supabase Auth)**:
    - Representa una persona (dueño o empleado) con correo y contraseña.
    - La contraseña se gestiona con Supabase Auth (hash seguro, nunca viaja al cliente de forma expuesta).

2. **Perfil (tabla `perfiles`)**:
    - Vincula cada cuenta (`id` de auth) con su rol y nombre.
    - **Atributos**: `id` (FK a auth.users), `nombre`, `rol` (`admin` | `empleado`), `creado_en`.

3. **Matriz de permisos**:
    - Centralizada en el servidor: `obtenerUsuarioActual()` (sesión) + `esAdmin()` (rol desde `perfiles`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona sin sesión activa solo ve la pantalla de login.
- **SC-002**: Cero fugas de información: el rol Empleado no muestra totales, historial ni configuración en ninguna
  vista.
- **SC-003**: Toda acción protegida (panel, gestión, exportación, creación de cuentas) falla en el servidor para un rol
  Empleado, incluso si se intenta por URL o request directo.
- **SC-004**: La sesión persiste en el dispositivo hasta cerrar sesión manualmente.
- **SC-005**: El historial de ventas es inmutable: no se puede borrar un registro ni un servicio con historia, ni
  siquiera como Administrador.
