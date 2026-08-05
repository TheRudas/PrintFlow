# Actores del Sistema - PrintFlow

## Grupo 1: Operación del Negocio

- **Operador**
  *Interactúa con la aplicación para registrar cada venta (impresiones y fotocopias) mediante el escaneo de stickers NFC o la selección manual del servicio. Es el rol por defecto: ve únicamente la pantalla de cobro, simple y con botones grandes. Sin acceso a consultas ni configuración. Puede ser cualquiera de los padres o empleados del negocio.*

## Grupo 2: Administración

- **Administrador**
  *Persona con el código secreto (easter egg en la pantalla de Ayuda). Desbloquea el panel de administración: consulta totales y estadísticas, gestiona servicios y presets de precio, exporta datos y graba stickers NFC. En la práctica es el dueño del negocio; el rol se detecta sin login tradicional para que el flujo de los operadores no se complique.*

## Grupo 3: Sistema y Automatización

- **Sticker NFC**
  *Actor no-humano. Cada sticker contiene un enlace a un servicio de la app (`/nfc/{slug}`). Al ser escaneado por un celular Android, abre la pantalla de cobro del servicio correspondiente. Sin él, el flujo de cobro cae a la selección manual.*

- **Base de Datos (Supabase)**
  *Actor no-humano que persiste los servicios y cada registro de venta, permitiendo consultas y estadísticas al administrador.*
