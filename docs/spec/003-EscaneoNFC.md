# Feature Specification: Acceso por Sticker NFC

**Created**: 05/08/2026
**Updated**: 05/08/2026

**Alcance**: El sticker NFC **solo** se usa como canal para abrir la app en la pantalla de cobro del servicio
correcto. Los stickers se graban con la app **NFC Tools** (externo); la app **no** lee ni escribe NFC por sí misma
(se eliminó la Web NFC API: botón "Escanear", botón "Grabar sticker" e instructivo dentro de la app).

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 - Abrir la App desde el Sticker (Priority: P1)

Como **Operador**, quiero que al apoyar el celular en el sticker NFC pegado en la pared se abra la pantalla de cobro
del servicio correcto, sin tocar nada.

**Why this priority**: Es el flujo físico del negocio: cero fricción.

**How it works**: El sticker contiene un *URI record* con el enlace `https://{dominio}/nfc/{slug}`, grabado con la
app NFC Tools. El sistema operativo Android reconoce el enlace y lo abre en el navegador (nuestra PWA). La ruta
`/nfc/{slug}` resuelve el servicio y muestra la pantalla de cobro con él preseleccionado.

**Independent Test**: Se escribe el enlace `https://printflow-murex.vercel.app/nfc/impresion-bn` en un sticker con NFC
Tools. Al apoyar un celular Android, la app abre la pantalla de cobro de "Impresión B/N". El test es exitoso si el
servicio preseleccionado es el correcto.

**Acceptance Scenarios**:

1. **Scenario: Escaneo del sticker**
    - **Given** un sticker NFC con un enlace válido a `/nfc/{slug}`.
    - **When** el operador acerca el celular Android.
    - **Then** el navegador abre la app en la pantalla de cobro de ese servicio.

2. **Scenario: Ruta sin servicio**
    - **Given** un enlace a `/nfc/{slug}` con un slug inexistente o inactivo.
    - **When** se abre la ruta.
    - **Then** la app muestra "Este servicio ya no está disponible" y permite seleccionar otro.

3. **Scenario: Sin sesión iniciada**
    - **Given** un dispositivo sin sesión iniciada.
    - **When** el operador escanea el sticker.
    - **Then** la app redirige al login; tras iniciar sesión, se preserva el servicio preseleccionado.

---

## Edge Cases

- **¿Qué pasa si el sticker tiene texto en vez de enlace?**  
  El enlace debe ser un *URI record*. Si un sticker tiene texto, la app no lo interpreta; se re-graba con NFC Tools
  usando un enlace.
- **¿Qué pasa si el operador escanea mientras la app está cerrada?**  
  El sistema operativo abre el enlace en el navegador (PWA), funciona igual.
- **¿Qué pasa con un sticker que apunta a un dominio viejo?**  
  El enlace debe apuntar al dominio actual de producción; los stickers viejos se re-graban con el nuevo dominio.
- **¿Qué pasa si el celular no tiene NFC?**  
  La app siempre ofrece selección manual; el NFC es una aceleración, no un requisito.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema **DEBE** exponer la ruta `/nfc/[slug]` que preselecciona el servicio correspondiente en la
  pantalla de cobro.
- **FR-002**: Si el slug no existe o el servicio está inactivo, la app **DEBE** mostrar un mensaje claro y permitir
  selección manual.
- **FR-003**: Si no hay sesión activa, la ruta **DEBE** redirigir al login preservando el slug.
- **FR-004**: La selección manual **DEBE** funcionar siempre, con o sin NFC.
- **FR-005**: La app **NO DEBE** incluir funcionalidad de lectura/escritura Web NFC (se gestiona con NFC Tools).

### Key Entities

1. **Sticker NFC**:
    - Soporte físico con un *URI record* que contiene el enlace de un servicio, grabado con NFC Tools.
    - No es una entidad de base de datos; es el canal de entrada hacia la ruta `/nfc/{slug}`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un sticker grabado abre la pantalla de cobro del servicio correcto en el primer escaneo (Android).
- **SC-002**: El 100% de las ventas puede registrarse por selección manual aunque falle el NFC.
- **SC-003**: No hay stickers que apunten a slugs inexistentes sin un mensaje claro al usuario.
