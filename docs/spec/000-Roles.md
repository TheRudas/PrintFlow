# Feature Specification: Roles del Sistema

**Created**: 05/08/2026

**Alcance**: Este spec define los roles de la aplicación, qué puede hacer cada uno y qué le está **prohibido**.
Es un spec transversal: aplica a todos los demás (001 a 005) y es prerequisito conceptual de cualquier feature
futura. No introduce nuevas pantallas por sí solo; define el *quién puede hacer qué* en las existentes.

**Modelo de roles**: la app tiene **dos roles** — **Empleado** (default, rol por defecto de cualquier dispositivo)
y **Administrador** (rol elevado, desbloqueado con un código secreto en la pantalla de Ayuda). El rol se detecta por
dispositivo (cookie firmada), no por usuario ni login tradicional.

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Rol por Defecto: Empleado (Priority: P1)

Como **Empleado** (cualquier persona que opera la caja), quiero poder registrar ventas de forma simple y sin
distracciones, sin acceso a configuración ni estadísticas, para que el flujo diario sea rápido y a prueba de errores.

**Why this priority**: Es el rol de los padres y del personal del negocio. La simplicidad de este rol define la
experiencia principal de la app.

**Independent Test**: Un operador abre la app en su celular por primera vez y ve únicamente la pantalla de cobro:
selector de servicios, precios, contador y botón guardar. El test es exitoso si **no** ve ningún enlace al panel,
ninguna estadística y ninguna opción de configuración.

**Acceptance Scenarios**:

1. **Scenario: Primer uso sin rol elevado**
    - **Given** un dispositivo que nunca ingresó el código de admin.
    - **When** el operador abre la app.
    - **Then** la app lo trata como **Empleado**: ve solo la pantalla de cobro y la pantalla de Ayuda con su contenido
      normal.

2. **Scenario: Operador intenta acceder al panel directamente**
    - **Given** un dispositivo sin sesión admin.
    - **When** el operador escribe `/admin` en el navegador.
    - **Then** el sistema lo redirige a la pantalla de cobro sin mostrar nada del panel ni mensaje alguno.

---

### User Story 2 - Qué PUEDE hacer el Empleado (Priority: P1)

Como **Empleado**, quiero tener exactamente las herramientas que necesito para cobrar y nada más, para no equivocarme
ni tocar lo que no corresponde.

**Why this priority**: El exceso de opciones confunde al operador y arriesga la integridad de los datos del negocio.

**Independent Test**: Se revisa la lista de capacidades del rol Empleado contra lo que la app realmente muestra en
modo default. El test es exitoso si el Empleado puede registrar ventas completas y consultar Ayuda, y nada más.

**Acceptance Scenarios**:

1. **Scenario: Registrar una venta**
    - **Given** la app en modo Empleado.
    - **When** el operador selecciona un servicio, elige precio, cantidad y guarda.
    - **Then** el registro se persiste correctamente y aparece en el historial (que solo el Admin puede ver).

2. **Scenario: Escanear un sticker NFC**
    - **Given** la app en modo Empleado y un sticker válido.
    - **When** el operador acerca el celular al sticker.
    - **Then** la app abre la pantalla de cobro con ese servicio preseleccionado.

3. **Scenario: Consultar Ayuda**
    - **Given** la app en modo Empleado.
    - **When** el operador toca "Ayuda".
    - **Then** ve el contenido de ayuda normal (cómo registrar ventas) **sin** ninguna pista del modo admin.

---

### User Story 3 - Qué NO PUEDE hacer el Empleado (Priority: P1)

Como **Empleado**, quiero que el sistema me impida acceder a configuración, estadísticas y datos sensibles, para que
no pueda romper nada ni ver información que no me corresponde.

**Why this priority**: La protección del negocio: precios, historial y configuración quedan en manos del dueño.

**Independent Test**: Se intenta acceder a cada acción protegida con un dispositivo en modo Empleado. El test es
exitoso si **todas** fallan o se ocultan sin exponer información.

**Acceptance Scenarios**:

1. **Scenario: Ver totales o estadísticas**
    - **Given** la app en modo Empleado.
    - **When** el operador intenta ver el panel o los totales.
    - **Then** no se muestra ningún dato; se redirige a la pantalla de cobro.

2. **Scenario: Crear, editar o desactivar servicios**
    - **Given** la app en modo Empleado.
    - **When** el operador intenta modificar un servicio o sus precios.
    - **Then** la operación no está disponible en la UI y, de intentarse por URL o request directo, el servidor la
      rechaza.

3. **Scenario: Ver el historial de ventas**
    - **Given** la app en modo Empleado.
    - **When** el operador intenta consultar registros pasados.
    - **Then** no ve el historial ni ningún detalle de ventas.

4. **Scenario: Exportar datos o cambiar el código**
    - **Given** la app en modo Empleado.
    - **When** el operador intenta exportar CSV o cambiar el código secreto.
    - **Then** ambas acciones están bloqueadas y ocultas.

---

### User Story 4 - Rol Elevado: Administrador (Priority: P1)

Como **Administrador** (dueño del negocio), quiero desbloquear el modo admin con un código secreto para acceder a
todo lo del negocio: estadísticas, historial, configuración de servicios y exportación.

**Why this priority**: Es el único rol con poder total; su activación debe ser discreta pero el acceso completo.

**Independent Test**: En un dispositivo, se ingresa el código correcto en Ayuda. El test es exitoso si el dispositivo
pasa a modo Admin: aparece el enlace "Panel", y las acciones protegidas quedan disponibles.

**Acceptance Scenarios**:

1. **Scenario: Desbloqueo con código correcto**
    - **Given** la pantalla de Ayuda abierta.
    - **When** el operador escribe el código correcto.
    - **Then** el dispositivo pasa a modo Admin, se recuerda el rol de forma permanente y aparece el acceso al panel.

2. **Scenario: Código incorrecto**
    - **Given** la pantalla de Ayuda abierta.
    - **When** el operador escribe un código incorrecto.
    - **Then** la app no muestra ningún error revelador; el rol sigue siendo Empleado y nada sugiere que existe un modo
      oculto.

---

### User Story 5 - Qué PUEDE hacer el Administrador (Priority: P1)

Como **Administrador**, quiero tener acceso completo a la administración del negocio, para gestionar precios,
consultar ventas y exportar datos.

**Why this priority**: Es el rol de control total; sin estas capacidades la app no cumple su propósito de gestión.

**Independent Test**: Con el rol Admin activo, se verifica que todas las acciones de administración funcionan. El test
es exitoso si el Admin puede: ver totales, ver desglose, ver historial, gestionar servicios, exportar y cambiar el
código.

**Acceptance Scenarios**:

1. **Scenario: Consulta completa**
    - **Given** el rol Admin activo.
    - **When** el administrador abre el panel.
    - **Then** ve totales (hoy/semana/mes), desglose por servicio, historial paginado y gestión de servicios.

2. **Scenario: Gestión de servicios**
    - **Given** el rol Admin activo.
    - **When** el administrador crea, edita o desactiva un servicio.
    - **Then** los cambios persisten y se reflejan al instante en la pantalla de cobro de los Empleados.

3. **Scenario: Exportación de datos**
    - **Given** el rol Admin activo.
    - **When** el administrador exporta CSV.
    - **Then** descarga el archivo con los registros (una vez implementado el spec 005).

4. **Scenario: Cambiar el código secreto**
    - **Given** el rol Admin activo.
    - **When** el administrador define un código nuevo.
    - **Then** el código nuevo queda vigente y el anterior deja de funcionar.

---

### User Story 6 - Qué NO PUEDE hacer el Administrador (Priority: P2)

Como **Administrador**, quiero que el sistema limite mi poder en ciertos puntos, para proteger la integridad
histórica de los datos aunque yo mismo pueda equivocarme.

**Why this priority**: Proteger el historial: los datos de ventas deben ser inmutables para poder auditar.

**Independent Test**: Se intenta borrar un registro de venta o un servicio con historia como Admin. El test es exitoso
si el sistema lo impide o lo hace con advertencia clara.

**Acceptance Scenarios**:

1. **Scenario: No borrar registros de venta**
    - **Given** registros existentes.
    - **When** el administrador intenta eliminar un registro de venta.
    - **Then** el sistema no permite el borrado físico; el historial es inmutable (a definir si se habilita un borrado
      con advertencia en el futuro).

2. **Scenario: No borrar servicios con historia**
    - **Given** un servicio con registros asociados.
    - **When** el administrador intenta eliminar el servicio.
    - **Then** el sistema solo permite desactivarlo (`activo = false`), conservando el historial intacto.

---

## Edge Cases

- **¿Qué pasa si el operador escribe el código de admin sin querer?**  
  Solo ocurre con el código exacto; como es secreto y no hay pistas, el riesgo es mínimo. Si se activa por error, el
  dueño puede cerrar la sesión admin desde el panel o cambiar el código.
- **¿Qué pasa si se comparte el celular entre Empleado y dueño?**  
  El rol se guarda por dispositivo. Si el dueño deja la sesión admin abierta en un celular compartido, debe cerrarla
  ("Cerrar sesión admin") para devolver el dispositivo a modo Empleado.
- **¿Qué pasa si alguien intenta forjar la cookie de admin?**  
  La cookie está firmada con HMAC y un secreto que solo conoce el servidor; una cookie falsificada es rechazada y el
  dispositivo se trata como Empleado.
- **¿Qué pasa si el código se filtra?**  
  El Administrador lo cambia desde el panel (spec 004, FR-008); el código nuevo reemplaza al anterior en la tabla
  `configuracion`.
- **¿Qué pasa si hay varios dispositivos?**  
  Cada dispositivo mantiene su propio rol. El dueño puede elevar a Admin cada dispositivo que necesite (celular,
  PC), uno por uno.
- **¿Qué pasa si un Empleado ve la ruta /admin en el historial del navegador?**  
  Al entrar, es redirigido a la pantalla de cobro sin ver nada; no hay fuga de información.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema **DEBE** tratar a todo dispositivo como **Empleado** por defecto hasta que se ingrese el
  código de admin correcto.
- **FR-002**: El rol **Empleado** **DEBE** poder: registrar ventas (selección de servicio, precio, cantidad, guardado)
  y consultar la pantalla de Ayuda.
- **FR-003**: El rol **Empleado** **NO DEBE** poder: ver totales o estadísticas, ver el historial, gestionar servicios,
  exportar datos, cambiar el código ni ver ninguna pista del modo admin.
- **FR-004**: El rol **Administrador** **DEBE** poder: todas las capacidades del Empleado, más ver totales y desglose,
  ver historial, gestionar servicios, exportar datos (spec 005) y cambiar el código (spec 004).
- **FR-005**: El rol **Administrador** **NO DEBE** poder borrar físicamente registros de venta ni servicios con
  historia; los servicios solo se desactivan.
- **FR-006**: La elevación a Admin **DEBE** persistir por dispositivo (cookie firmada, sin expiración automática) sin
  volver a pedir el código, hasta que se cierre la sesión manualmente.
- **FR-007**: Todo acceso a acciones protegidas **DEBE** validarse en el servidor (`esAdmin()`), no solo ocultarse en
  la UI.
- **FR-008**: El código admin **NUNCA** debe aparecer en el bundle del navegador (validación exclusiva en servidor).

### Key Entities

1. **Rol (Empleado / Administrador)**:
    - Estado de sesión por dispositivo, no una entidad de base de datos.
    - **Default**: **Empleado**. Se eleva a **Administrador** con el código secreto validado en servidor.
    - Se persiste como cookie firmada (`printflow_admin`, sin expiración automática; se cierra manualmente).

2. **Matriz de permisos**:
    - Define qué acciones habilitan o bloquean cada rol. Centralizar en un módulo (`esAdmin()`) para que la UI y el
      servidor apliquen las mismas reglas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un dispositivo nuevo nunca ve opciones de admin hasta ingresar el código correcto.
- **SC-002**: Cero fugas de información: el modo Empleado no muestra totales, historial ni configuración en ninguna
  vista.
- **SC-003**: Toda acción protegida (panel, gestión, exportación, cambio de código) falla en el servidor para un rol
  Empleado, incluso si se intenta por URL o request directo.
- **SC-004**: El rol Admin se mantiene activo en el dispositivo sin límite de tiempo, hasta cerrar la sesión
  manualmente.
- **SC-005**: El historial de ventas es inmutable: no se puede borrar un registro ni un servicio con historia, ni
  siquiera como Administrador.
