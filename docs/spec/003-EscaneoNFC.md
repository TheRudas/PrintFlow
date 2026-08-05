# Feature Specification: Escaneo NFC

**Created**: 05/08/2026

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Abrir la App desde el Sticker (Priority: P1)

Como **Operador**, quiero que al apoyar el celular en el sticker NFC se abra automáticamente la pantalla de cobro del
servicio correcto, sin tener que buscar nada en la app.

**Why this priority**: Es la promesa central del proyecto: cero fricción. El sticker debe "llevar" al operador al lugar
exacto.

**How it works**: Cada sticker contiene un *URI record* con un enlace del tipo
`https://{dominio}.vercel.app/nfc/{slug}`. El sistema operativo Android reconoce el enlace y lo abre en el navegador,
que es nuestra PWA. La ruta `/nfc/{slug}` resuelve el servicio y muestra la pantalla de cobro con él preseleccionado.

**Independent Test**: Se escribe el enlace `https://printflow-murex.vercel.app/nfc/impresion-bn` en un sticker NFC. Al
apoyar un celular Android, la app abre la pantalla de cobro de "Impresión B/N". El test es exitoso si el servicio
preseleccionado es el correcto.

**Acceptance Scenarios**:

1. **Scenario: Escaneo del sticker**
    - **Given** un sticker NFC con un enlace válido a `/nfc/{slug}`.
    - **When** el operador acerca el celular Android.
    - **Then** el navegador abre la app en la pantalla de cobro de ese servicio.

2. **Scenario: Ruta sin servicio**
    - **Given** un enlace a `/nfc/{slug}` con un slug inexistente o inactivo.
    - **When** se abre la ruta.
    - **Then** la app muestra "Este servicio ya no está disponible" y permite seleccionar otro.

---

### User Story 2 - Escaneo en App Abierta (Web NFC) (Priority: P2)

Como **Operador**, quiero que si ya tengo la app abierta, un botón de "Escanear" active el lector NFC y registre el
servicio del sticker sin recargar la página.

**Why this priority**: Cubre el flujo de quien ya tiene la app abierta y la usa como lector principal (Web NFC API).

**Independent Test**: Con la app abierta, el operador toca "Escanear", acerca el sticker y el lector captura el enlace.
El test es exitoso si el servicio se preselecciona sin recargar la página.

**Acceptance Scenarios**:

1. **Scenario: Escaneo exitoso en app abierta**
    - **Given** la app abierta y el permiso de NFC otorgado.
    - **When** el operador toca "Escanear" y acerca el sticker.
    - **Then** el lector lee el enlace, extrae el slug y preselecciona el servicio.

2. **Scenario: Permiso denegado o sin soporte**
    - **Given** un dispositivo sin Web NFC o sin permiso.
    - **When** el operador toca "Escanear".
    - **Then** la app oculta el botón y ofrece la selección manual.

---

### User Story 3 - Grabar un Sticker desde el Panel (Priority: P2)

Como **Administrador**, quiero grabar (escribir) el enlace de un servicio en un sticker NFC nuevo desde el panel, para
poder programar mis propios stickers sin otra aplicación.

**Why this priority**: Evita depender de apps de terceros para la parte operativa de preparar stickers.

**Independent Test**: En el panel, el administrador elige el servicio "Impresión Color", toca "Grabar sticker" y acerca
el sticker al celular. El test es exitoso si el celular confirma la escritura del enlace.

**Acceptance Scenarios**:

1. **Scenario: Escritura exitosa**
    - **Given** un sticker NFC virgen y el permiso de NFC.
    - **When** el administrador elige el servicio y acerca el sticker.
    - **Then** el sistema escribe el enlace `/nfc/{slug}` y muestra "Sticker grabado".

2. **Scenario: Sticker no compatible**
    - **Given** un sticker que no admite escritura o es de otro formato.
    - **When** el administrador intenta grabarlo.
    - **Then** la app muestra un error claro indicando que el sticker no se pudo grabar.

---

### User Story 4 - Grabado con App de Terceros (Priority: P3)

Como **Administrador**, quiero un instructivo paso a paso para grabar los stickers con la app **NFC Tools** (Play
Store), como alternativa más robusta y masiva.

**Why this priority**: El grabado desde la app (US3) puede ser menos confiable en algunos celulares; NFC Tools es una
vía a prueba de balas para programar todos los stickers de una vez.

**Independent Test**: Siguiendo el instructivo, un administrador graba 10 stickers con NFC Tools usando el enlace de
cada servicio. El test es exitoso si los 10 stickers abren el servicio correcto al escanearse.

**Acceptance Scenarios**:

1. **Scenario: Grabar un enlace con NFC Tools**
    - **Given** la app NFC Tools instalada y un sticker.
    - **When** el administrador escribe un *URI record* con el enlace del servicio y lo guarda en el sticker.
    - **Then** el sticker queda programado y abre la app al escanearse.

---

## Edge Cases

- **¿Qué pasa si el sticker tiene texto en vez de enlace?**  
  Se interpreta: si es un texto tipo `nfc/{slug}`, la app lo traduce; si es un enlace, lo usa directo.
- **¿Qué pasa si el operador escanea mientras la app está cerrada?**  
  El sistema operativo abre el enlace en el navegador (PWA), funciona igual.
- **¿Qué pasa con un sticker que apunta a un dominio viejo?**  
  El enlace debe apuntar al dominio actual de producción; los stickers viejos se re-graban con el nuevo dominio.
- **¿Qué pasa si el celular no tiene NFC?**  
  La app siempre ofrece selección manual; el NFC es una aceleración, no un requisito.
- **¿Qué pasa si se escribe un enlace con caracteres especiales en el slug?**  
  Los slugs se generan en minúsculas y con guiones; el sistema normaliza y busca de forma tolerante.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema **DEBE** exponer la ruta `/nfc/[slug]` que preselecciona el servicio correspondiente en la
  pantalla de cobro.
- **FR-002**: Si el slug no existe o el servicio está inactivo, la app **DEBE** mostrar un mensaje claro y permitir
  selección manual.
- **FR-003**: La app **DEBE** ofrecer un botón "Escanear" que use la Web NFC API cuando el dispositivo lo soporte.
- **FR-004**: El panel del administrador **DEBE** poder escribir un enlace `/nfc/{slug}` en un sticker usando la Web NFC
  API.
- **FR-005**: La app **DEBE** incluir un instructivo para grabar stickers con la app NFC Tools.
- **FR-006**: La selección manual **DEBE** funcionar siempre, con o sin NFC.

### Key Entities

1. **Sticker NFC**:
    - Soporte físico con un *URI record* que contiene el enlace de un servicio.
    - No es una entidad de base de datos; es el canal de entrada hacia la ruta `/nfc/{slug}`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un sticker grabado abre la pantalla de cobro del servicio correcto en el primer escaneo (Android).
- **SC-002**: Un operador puede grabar un sticker desde el panel o con NFC Tools en menos de 1 minuto.
- **SC-003**: El 100% de las ventas puede registrarse por selección manual aunque falle el NFC.
- **SC-004**: No hay stickers que apunten a slugs inexistentes sin un mensaje claro al usuario.
