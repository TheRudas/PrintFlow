# PrintFlow

App web para registrar impresiones y fotocopias de un negocio en casa, con acceso rápido mediante stickers NFC.

## Stack

- **Next.js 16 + TypeScript + Tailwind** (App Router)
- **Supabase** (Postgres + Auth) — cuentas por correo y contraseña
- **PWA** instalable en el celular
- Deploy en **Vercel**

## Acceso con stickers NFC

Los stickers se graban con la app **NFC Tools** (Play Store) usando un enlace del tipo
`https://{dominio}/nfc/{slug}` (ej: `/nfc/impresion-bn`). Al acercar el celular, el sticker abre la app en la
pantalla de cobro del servicio correspondiente.

## Desarrollo

```bash
npm install
npm run dev
```

## Configuración

Copiá `.env.example` a `.env.local` y completá las credenciales de tu proyecto de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Estructura

```
docs/           # especificación y planes de implementación (spec → plan → código)
  stakeholders.md
  spec/         # spec de cada feature
  plan/         # plan de implementación de cada feature
src/
  app/          # rutas y páginas
  lib/          # tipos, cliente de Supabase y helpers
```

## Proceso de desarrollo

Cada feature sigue el flujo `spec → plan → código`:

1. Se documenta el spec en `docs/spec/` (user stories, acceptance scenarios, requisitos funcionales).
2. Se escribe el plan de implementación en `docs/plan/`.
3. Se implementa el código siguiendo el plan y los principios de clean code del proyecto.
