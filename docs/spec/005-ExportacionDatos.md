# Feature Specification: Exportación de Datos

**Created**: 05/08/2026

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Exportar Ventas a CSV (Priority: P2)

Como **Administrador**, quiero descargar los registros de ventas en un archivo CSV para poder abrirlos en Excel o
Google Sheets y hacer mis propias cuentas o informes.

**Why this priority**: Es la salida de datos hacia el mundo externo; no bloquea el día a día pero agrega valor real.

**Independent Test**: El administrador toca "Exportar CSV" en el panel. El test es exitoso si descarga un archivo `.csv`
con una fila por registro: fecha, servicio, cantidad, precio unitario, total y nota.

**Acceptance Scenarios**:

1. **Scenario: Exportación completa**
    - **Given** registros existentes.
    - **When** el administrador toca "Exportar CSV".
    - **Then** descarga un archivo CSV con todas las columnas y una fila por registro, en orden descendente de fecha.

2. **Scenario: Sin registros**
    - **Given** que no hay ventas.
    - **When** el administrador toca "Exportar CSV".
    - **Then** descarga un CSV solo con la cabecera (y, opcionalmente, un aviso de que no hay registros).

3. **Scenario: Filtrar por rango de fechas**
    - **Given** ventas de varios días.
    - **When** el administrador elige un rango de fechas y exporta.
    - **Then** el CSV contiene solo los registros dentro de ese rango.

---

### User Story 2 - Formato de Valores (Priority: P2)

Como **Administrador**, quiero que los montos y fechas salgan en un formato que Excel entienda bien (números puros,
fechas ISO o legibles), para no tener que corregir nada al abrir el archivo.

**Why this priority**: Un CSV con formato confuso obliga a limpiar datos a mano, perdiendo el beneficio de exportar.

**Independent Test**: El administrador abre el CSV exportado en Excel y verifica que los montos se interpretan como
números y las fechas como fechas. El test es exitoso si no requiere ajustes manuales de formato.

**Acceptance Scenarios**:

1. **Scenario: CSV legible por Excel**
    - **Given** un archivo exportado.
    - **When** se abre en Excel/Sheets.
    - **Then** los montos son numéricos (sin símbolo de moneda) y las fechas se interpretan correctamente.

---

## Edge Cases

- **¿Qué pasa si un valor contiene comas o comillas?**  
  El generador de CSV escapa los campos correctamente (regla RFC 4180) para no romper columnas.
- **¿Qué pasa con la codificación de caracteres (ñ, acentos)?**  
  El CSV se genera con separador `;` (para Excel en español) y UTF-8 con BOM para que los acentos se vean bien.
- **¿Qué pasa si hay miles de registros?**  
  El rango de fechas acota el volumen; para casos extremos se puede paginar o filtrar por servicio.
- **¿Qué pasa si el admin exporta sin fecha?**  
  Se exporta todo el historial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El panel **DEBE** ofrecer un botón "Exportar CSV".
- **FR-002**: El CSV **DEBE** incluir las columnas: fecha, servicio, cantidad, precio unitario, total, nota.
- **FR-003**: El CSV **DEBE** poder filtrarse por rango de fechas (opcional) y por servicio (opcional).
- **FR-004**: El CSV **DEBE** usar separador `;` y UTF-8 con BOM para compatibilidad con Excel en español.
- **FR-005**: Los campos con comas o comillas **DEBEN** escaparse correctamente (RFC 4180).

### Key Entities

1. **Archivo CSV**:
    - Artefacto de salida generado a partir de `registros`. No se persiste; se genera bajo demanda.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un administrador descarga el CSV del mes en menos de 5 segundos.
- **SC-002**: El archivo abre en Excel sin errores de codificación ni columnas desalineadas.
- **SC-003**: El CSV refleja exactamente los registros de la base (misma cantidad y totales).
