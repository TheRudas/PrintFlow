# PrintFlow

App web para registrar impresiones y fotocopias de un negocio en casa, usando stickers NFC.

## Stack

- **Next.js 16 + TypeScript + Tailwind** (App Router)
- **Supabase (Postgres)** como base de datos
- **PWA** instalable en el celular (Android con Web NFC)
- Deploy en **Vercel**

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
```

## Estructura

```
src/
  app/          # rutas y páginas
  lib/          # tipos, cliente de Supabase y helpers
```
