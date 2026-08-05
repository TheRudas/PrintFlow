# Feature Specification: Panel de Administración

**Created**: 05/08/2026

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Desbloquear Admin por Código Secreto (Priority: P1)

Como **Administrador**, quiero activar el modo admin ingresando un código secreto en la pantalla de Ayuda, sin que los
operadores se den cuenta de que existe, para que el flujo de ellos siga siendo simple.

**Why this priority**: Es la puerta de entrada a toda la administración; el resto del panel depende de esto. El diseño
es un *easter egg*: todos son Empleado por defecto.

**Independent Test**: Un operador abre "Ayuda" y escribe el código correcto. El test es exitoso si la app cambia a modo
admin (aparecen opciones de administración) y esa condición queda recordada en el dispositivo.

**Acceptance Scenarios**:

1. **Scenario: Código correcto**
    - **Given** la pantalla de Ayuda abierta.
    - **When** el operador escribe el código correcto y confirma.
    - **Then** la app activa el modo admin en ese dispositivo y muestra acceso al panel.

2. **Scenario: Código incorrecto**
    - **Given** la pantalla de Ayuda abierta.
    - **When** el operador escribe un código incorrecto.
    - **Then** la app no muestra ningún error revelador: solo se ve "Ayuda" normal, sin pistas de que existe un modo
      oculto.

3. **Scenario: La app recuerda el rol**
    - **Given** que el dispositivo ya está en modo admin.
    - **When** el usuario cierra y vuelve a abrir la app.
    - **Then** el modo admin se mantiene activo sin volver a pedir el código.

---

### User Story 2 - Consultar Totales (Priority: P1)

Como **Administrador**, quiero ver los totales de ventas por día, semana y mes, para saber cuánto vendió el negocio sin
hacer cuentas a mano.

**Why this priority**: Es el motivo principal de la app administrativa: saber cuánto y qué se vendió.

**Independent Test**: Con registros de prueba, el administrador abre el panel y ve: total del día, de la semana y del
mes, además del conteo de registros. El test es exitoso si los montos coinciden con la suma de los registros reales.

**Acceptance Scenarios**:

1. **Scenario: Totales correctos**
    - **Given** registros existentes en la base.
    - **When** el administrador abre el panel.
    - **Then** se muestran totales por día, semana y mes calculados desde `registros.total`.

2. **Scenario: Sin registros**
    - **Given** que aún no hay ventas.
    - **When** el administrador abre el panel.
    - **Then** los totales muestran `0` y un mensaje indicando que aún no hay ventas.

---

### User Story 3 - Desglose por Servicio (Priority: P1)

Como **Administrador**, quiero ver cuánto se vendió por cada servicio (impresiones vs fotocopias, B/N vs Color), para
saber qué productos rinden más.

**Why this priority**: Permite decidir precios y promociones según lo que más se vende.

**Independent Test**: Con registros de varios servicios, el administrador ve un desglose con total por servicio. El
test es exitoso si cada fila suma correctamente los registros de ese servicio.

**Acceptance Scenarios**:

1. **Scenario: Desglose por servicio**
    - **Given** registros de al menos dos servicios.
    - **When** el administrador consulta el panel.
    - **Then** se muestra un total y un conteo por cada servicio.

---

### User Story 4 - Historial de Registros (Priority: P2)

Como **Administrador**, quiero ver el historial de ventas con fecha, servicio, cantidad, precio y total, para auditar
y responder dudas.

**Why this priority**: Útil para control y soporte, aunque no crítico para el día a día.

**Independent Test**: El administrador abre la lista de registros ordenados por fecha descendente. El test es exitoso
si cada registro muestra servicio, cantidad, precio unitario, total y fecha correctos.

**Acceptance Scenarios**:

1. **Scenario: Historial ordenado**
    - **Given** registros existentes.
    - **When** el administrador abre el historial.
    - **Then** los registros aparecen ordenados de más reciente a más antiguo con sus datos completos.

---

### User Story 5 - Gestión de Servicios desde el Panel (Priority: P1)

Como **Administrador**, quiero crear, editar y desactivar servicios (y sus presets de precio) desde el panel, para
mantener la oferta actualizada sin tocar la base de datos.

**Why this priority**: Es el complemento del spec 001: sin esta UI, los precios quedarían fijos.

**Independent Test**: El administrador crea un servicio nuevo, le cambia los presets y lo desactiva. El test es exitoso
si cada cambio se refleja en la pantalla de cobro de los operadores.

**Acceptance Scenarios**:

1. **Scenario: Alta/edición/baja de servicio**
    - **Given** el modo admin activo.
    - **When** el administrador crea, edita o desactiva un servicio.
    - **Then** los cambios persisten y se reflejan de inmediato en la pantalla de cobro.

---

### User Story 6 - Cambiar el Código Secreto (Priority: P3)

Como **Administrador**, quiero poder cambiar el código secreto de admin, para mantenerlo privado si se filtra.

**Why this priority**: Medida de seguridad opcional, no bloqueante.

**Independent Test**: El administrador cambia el código y, al desloguearse, ingresa con el nuevo. El test es exitoso si
el código viejo deja de funcionar.

**Acceptance Scenarios**:

1. **Scenario: Cambio de código**
    - **Given** el modo admin activo.
    - **When** el administrador define un nuevo código.
    - **Then** el código nuevo queda vigente y el anterior deja de funcionar.

---

## Edge Cases

- **¿Qué pasa si el código se filtra?**  
  El administrador puede cambiarlo (US6). El código se valida en el servidor contra una variable de entorno, no en el
  navegador.
- **¿Qué pasa si el operador escribe el código sin querer?**  
  Si el código es correcto, se activa admin; como solo el dueño lo conoce, el riesgo es aceptable y el rol queda en el
  dispositivo.
- **¿Qué pasa si hay cientos de registros en el historial?**  
  El historial se pagina (por ejemplo 50 por página) para no cargar todo de golpe.
- **¿Qué pasa si el admin borra todos los presets de un servicio?**  
  El servicio queda cobrable solo por monto libre o precio por defecto; la validación del cobro sigue garantizando
  precio > 0.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La app **DEBE** tener un modo admin desbloqueable con un código secreto ingresado en la pantalla de
  Ayuda.
- **FR-002**: El código **DEBE** validarse en el servidor contra una variable de entorno; **NO** debe estar visible en
  el código del navegador.
- **FR-003**: El rol admin **DEBE** persistir en el dispositivo (localStorage/session) entre sesiones.
- **FR-004**: El panel **DEBE** mostrar totales por día, semana y mes calculados desde los registros.
- **FR-005**: El panel **DEBE** mostrar desglose por servicio (total y conteo).
- **FR-006**: El panel **DEBE** listar el historial de registros ordenado por fecha descendente y paginado.
- **FR-007**: El admin **DEBE** poder crear, editar y desactivar servicios desde el panel.
- **FR-008**: El admin **DEBE** poder cambiar el código secreto.

### Key Entities

1. **Rol (Empleado / Admin)**:
    - Estado local del dispositivo, no una entidad de base de datos.
    - Default: **Empleado**. Se eleva a **Admin** con el código secreto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un operador no ve ninguna pista de que existe un modo admin.
- **SC-002**: El admin consulta totales del día en menos de 5 segundos desde que abre el panel.
- **SC-003**: El código secreto nunca aparece en el bundle del navegador (se verifica con una búsqueda en el código
  compilado).
- **SC-004**: Cualquier cambio de servicios se refleja en la pantalla de cobro sin re-instalar la app.
