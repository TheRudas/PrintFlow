# Feature Specification: Registro de Cobro

**Created**: 05/08/2026

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Cobro Rápido por Sticker NFC (Priority: P1)

Como **Operador**, quiero escanear un sticker NFC pegado a la impresora/fotocopiadora y registrar la venta en pocos
toques, para no perder tiempo entre clientes.

**Why this priority**: Es el corazón del negocio: cada venta debe registrarse en menos de 10 segundos para no hacer
esperar al cliente.

**Independent Test**: El operador apoya el celular sobre el sticker NFC de "Impresión B/N". La app abre la pantalla de
cobro de ese servicio. El test es exitoso si el servicio correcto queda seleccionado automáticamente y el total se
calcula en vivo.

**Acceptance Scenarios**:

1. **Scenario: Escaneo exitoso**
    - **Given** un celular Android con la app instalada y un sticker NFC con el slug de un servicio activo.
    - **When** el operador acerca el celular al sticker.
    - **Then** la app abre la pantalla de cobro con ese servicio preseleccionado.

2. **Scenario: Servicio inexistente o inactivo**
    - **Given** un sticker cuyo slug ya no existe o está desactivado.
    - **When** el operador escanea el sticker.
    - **Then** la app muestra un mensaje amigable: "Este servicio ya no está disponible".

3. **Scenario: Sin soporte NFC en el dispositivo**
    - **Given** un celular sin Web NFC o sin permiso otorgado.
    - **When** el operador intenta escanear.
    - **Then** la app ofrece la selección manual del servicio como alternativa.

---

### User Story 2 - Elegir Precio de Forma Flexible (Priority: P1)

Como **Operador**, quiero elegir el precio de cada venta de varias formas (preset, precio por defecto o monto libre),
porque las impresiones varían según el tamaño y tipo.

**Why this priority**: Una impresión puede costar desde 300 hasta más de 1000 según la imagen; el operador necesita
flexibilidad total al cobrar.

**Independent Test**: Con el servicio "Impresión Color" seleccionado, el operador ve botones de presets
(`700`, `1000`, `1200`), el precio por defecto y un campo de monto libre. El test es exitoso si al tocar un preset, el
precio se refleja al instante y puede alternar entre modos sin fricción.

**Acceptance Scenarios**:

1. **Scenario: Usar un preset**
    - **Given** el servicio tiene presets configurados.
    - **When** el operador toca el botón del preset `1000`.
    - **Then** el precio unitario pasa a `1000` y el total se recalcula al instante.

2. **Scenario: Usar el precio por defecto**
    - **Given** el servicio tiene `precio_por_defecto`.
    - **When** el operador no elige ningún preset.
    - **Then** el sistema usa el precio por defecto para el total.

3. **Scenario: Monto libre**
    - **Given** que el presupuesto del cliente no coincide con ningún preset.
    - **When** el operador escribe el monto en el campo libre.
    - **Then** el precio unitario se actualiza con el valor escrito y el total se recalcula.

---

### User Story 3 - Cantidad de Hojas / Paquete (Priority: P1)

Como **Operador**, quiero indicar cuántas hojas lleva un cliente en un solo cobro (un paquete de varias hojas al mismo
precio), para no escanear el sticker por cada hoja.

**Why this priority**: Un cliente suele pedir varias copias del mismo documento; el contador evita registros duplicados.

**Independent Test**: Con el servicio seleccionado y precio `100`, el operador sube la cantidad a `3`. El test es
exitoso si el total muestra `300` y al guardar se registra un solo registro con `cantidad = 3`.

**Acceptance Scenarios**:

1. **Scenario: Incrementar cantidad**
    - **Given** un servicio con precio unitario definido.
    - **When** el operador incrementa la cantidad a `3`.
    - **Then** el total = `precio_unitario × 3` y se muestra en vivo.

2. **Scenario: Cantidad mínima**
    - **Given** que el operador baja la cantidad.
    - **When** intenta ponerla en `0` o menos.
    - **Then** el sistema no permite valores menores a `1`.

---

### User Story 4 - Guardar el Cobro (Priority: P1)

Como **Operador**, quiero confirmar y guardar el cobro para que quede en el historial del negocio, y volver a un estado
listo para la siguiente venta.

**Why this priority**: Sin guardado no hay datos que consultar; es el cierre de cada venta.

**Independent Test**: El operador confirma un cobro de "Fotocopia B/N" × `2` a `100`. El test es exitoso si aparece un
mensaje de éxito, el formulario se resetea y en el panel del administrador el registro aparece con `cantidad = 2` y
`total = 200`.

**Acceptance Scenarios**:

1. **Scenario: Guardado exitoso**
    - **Given** un cobro completo (servicio, precio, cantidad).
    - **When** el operador toca "Guardar".
    - **Then** el sistema persiste el registro, muestra "Venta registrada" y resetea la pantalla para la siguiente venta.

2. **Scenario: Guardado fallido (sin conexión)**
    - **Given** que no hay conexión a la base de datos.
    - **When** el operador toca "Guardar".
    - **Then** el sistema muestra un mensaje claro de error sin perder los datos ya ingresados en pantalla.

---

### User Story 5 - Venta con Nota Opcional (Priority: P3)

Como **Operador**, quiero agregar una nota corta a una venta (por ejemplo "Anillado" o "Papel especial"), para
contexto posterior en las consultas.

**Why this priority**: Útil pero no bloqueante para el lanzamiento inicial.

**Independent Test**: El operador agrega la nota "Papel especial" a un cobro y guarda. El test es exitoso si en el
panel del administrador la nota aparece asociada al registro.

**Acceptance Scenarios**:

1. **Scenario: Venta con nota**
    - **Given** un cobro en curso.
    - **When** el operador escribe la nota y guarda.
    - **Then** el registro se persiste con la nota.

2. **Scenario: Venta sin nota**
    - **Given** un cobro en curso.
    - **When** el operador guarda sin escribir nota.
    - **Then** el registro se persiste con `nota = null`.

---

## Edge Cases

- **¿Qué pasa si el operador escanea dos stickers seguidos muy rápido?**  
  La pantalla de cobro de la segunda venta reemplaza la anterior; no se acumulan ni se mezclan.
- **¿Qué pasa si el precio libre tiene decimales?**  
  El sistema acepta montos con hasta 2 decimales y valida que sea mayor a 0.
- **¿Qué pasa si el sticker apunta a un servicio inactivo?**  
  Se muestra el mensaje de "ya no disponible" y se ofrece seleccionar otro servicio manualmente.
- **¿Qué pasa con una impresión que vale "más de 1000"?**  
  El monto libre cubre cualquier valor; también el administrador puede agregar presets mayores.
- **¿Qué pasa si no hay presets y no hay precio por defecto?**  
  El operador debe usar el monto libre; el sistema no permite guardar sin precio válido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema **DEBE** poder recibir un servicio desde un sticker NFC mediante la ruta `/nfc/{slug}` y
  preseleccionarlo en la pantalla de cobro.
- **FR-002**: La pantalla de cobro **DEBE** ofrecer al menos tres modos de precio: presets, precio por defecto y monto
  libre.
- **FR-003**: El sistema **DEBE** calcular y mostrar el total en vivo como `precio_unitario × cantidad`.
- **FR-004**: La cantidad **DEBE** ser un entero mayor o igual a 1.
- **FR-005**: El operador **DEBE** poder guardar un registro con: `servicio_id`, `cantidad`, `precio_unitario` y
  `total`.
- **FR-006**: El sistema **NO DEBE** guardar un cobro sin un precio válido mayor a 0.
- **FR-007**: El sistema **DEBE** permitir una nota opcional en cada registro.
- **FR-008**: Si el dispositivo no soporta NFC, la app **DEBE** ofrecer selección manual del servicio.

### Key Entities

1. **Registro**:
    - Representa una venta individual o de paquete.
    - **Atributos**: `id` (UUID), `servicio_id` (FK → Servicio), `cantidad` (entero ≥ 1), `precio_unitario` (numeric > 0),
      `total` (numeric ≥ 0), `nota` (text nullable), `creado_en` (timestamp).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un operador registra una venta en menos de 10 segundos usando el sticker NFC.
- **SC-002**: El 100% de las ventas guardadas tiene `total` correcto (`cantidad × precio_unitario`).
- **SC-003**: Los precios se eligen sin teclear en más del 80% de los casos (presets o precio por defecto).
- **SC-004**: Un corte de conexión no pierde los datos ingresados en pantalla (se pueden reintentar o ver el error
  claramente).
