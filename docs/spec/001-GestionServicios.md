# Feature Specification: Gestión de Servicios

**Created**: 05/08/2026

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Listar Servicios Activos (Priority: P1)

Como **Operador**, quiero ver la lista de servicios disponibles para registrar una venta rápidamente, sin tener que
recordar nombres ni códigos.

**Why this priority**: Es la base de toda la operación diaria: si el operador no ve los servicios, no puede cobrar.

**Independent Test**: Un operador abre la app en su celular y ve los servicios activos (Impresión B/N, Impresión Color,
Fotocopia B/N, Fotocopia Color) como tarjetas grandes y tocables. El test es exitoso si todos los servicios activos
aparecen y los inactivos no.

**Acceptance Scenarios**:

1. **Scenario: Listado de servicios activos**
    - **Given** que existen servicios activos e inactivos en el sistema.
    - **When** el operador abre la pantalla principal.
    - **Then** el sistema muestra solo los servicios con `activo = true`, ordenados y legibles.

2. **Scenario: Sin servicios activos**
    - **Given** que no hay ningún servicio activo.
    - **When** el operador abre la pantalla principal.
    - **Then** el sistema muestra un mensaje claro de que no hay servicios configurados y contactar al administrador.

---

### User Story 2 - Crear un Servicio (Priority: P1)

Como **Administrador**, quiero crear un tipo de servicio (por ejemplo "Impresión Color A3") con su nombre, slug único,
precio por defecto y presets de precio, para poder ofrecerlo a la venta.

**Why this priority**: El negocio define sus servicios y precios; sin esto no hay nada que cobrar.

**Independent Test**: Un administrador crea un servicio "Impresión A3 Color" con slug `impresion-a3-color`, presets
`[1500, 2000, 2500]` y lo guarda. El test es exitoso si aparece en la lista de servicios activos de la pantalla de
cobro.

**Acceptance Scenarios**:

1. **Scenario: Creación exitosa**
    - **Given** que el administrador está en el panel de administración.
    - **When** completa los datos obligatorios (nombre, slug) y guarda.
    - **Then** el sistema persiste el servicio y este aparece inmediatamente en la pantalla de cobro de los operadores.

2. **Scenario: Slug duplicado**
    - **Given** que ya existe un servicio con el slug `impresion-a3-color`.
    - **When** el administrador intenta crear otro con el mismo slug.
    - **Then** el sistema rechaza la operación con un mensaje de que el slug ya existe.

---

### User Story 3 - Editar Precios y Presets (Priority: P1)

Como **Administrador**, quiero ajustar el precio por defecto y los presets de un servicio cuando cambian los costos del
negocio, para que la pantalla de cobro siempre muestre precios actualizados.

**Why this priority**: Los precios de impresión varían por tamaño y costo de insumos; el negocio los ajusta seguido.

**Independent Test**: Un administrador cambia el preset de "Impresión Color" de `[700, 1000, 1200]` a
`[800, 1100, 1300]` y guarda. El test es exitoso si al volver a la pantalla de cobro, los nuevos presets aparecen como
botones.

**Acceptance Scenarios**:

1. **Scenario: Edición exitosa**
    - **Given** un servicio existente.
    - **When** el administrador modifica sus presets y guarda.
    - **Then** la pantalla de cobro muestra inmediatamente los nuevos presets.

2. **Scenario: Desactivar un servicio**
    - **Given** un servicio que ya no se ofrece.
    - **When** el administrador lo desactiva.
    - **Then** el servicio desaparece de la pantalla de cobro pero sus registros históricos se conservan intactos.

---

## Edge Cases

- **¿Qué pasa si un preset es menor o igual a 0?**  
  El sistema debe rechazarlo: el precio unitario siempre es mayor a 0.
- **¿Qué pasa si dos servicios tienen el mismo slug?**  
  La base de datos lo impide con una restricción única (`slug unique`).
- **¿Qué pasa si un servicio con registros históricos se desactiva?**  
  Solo se oculta de la venta; la columna `activo` cambia a `false` y los registros apuntan al mismo servicio sin romperse.
- **¿Qué pasa si el operador escanea un sticker cuyo slug ya no existe?**  
  La app debe mostrar un mensaje amigable indicando que el servicio ya no está disponible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema **DEBE** listar únicamente los servicios con `activo = true` en la pantalla de cobro.
- **FR-002**: El administrador **DEBE** poder crear servicios con, al menos: `nombre`, `slug` único, `precio_por_defecto`
  (opcional) y `presets` (lista de precios).
- **FR-003**: El administrador **DEBE** poder editar `precio_por_defecto`, `presets`, `unidad` y `activo` de un
  servicio existente.
- **FR-004**: El sistema **NO DEBE** permitir dos servicios con el mismo `slug`.
- **FR-005**: El sistema **NO DEBE** eliminar físicamente un servicio con registros asociados; solo desactivarlo.

### Key Entities

1. **Servicio**:
    - Representa un tipo de venta (impresión, fotocopia, etc.).
    - **Atributos**: `id` (UUID), `slug` (único, usado en stickers NFC), `nombre`, `precio_por_defecto` (nullable),
      `presets` (array numérico), `unidad` (default "hoja"), `activo` (boolean), `creado_en` (timestamp).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede crear un servicio nuevo en menos de 1 minuto desde el panel.
- **SC-002**: Un cambio de precios se refleja en la pantalla de cobro de los operadores de forma inmediata (sin
  re-instalar nada).
- **SC-003**: No existen servicios duplicados por slug; la base de datos lo garantiza.
- **SC-004**: Desactivar un servicio nunca elimina ni daña el historial de registros.
