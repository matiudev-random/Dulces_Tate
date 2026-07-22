# Libro de Ventas

PWA de gestión de ventas, productos y pagos. React + Tailwind + Zustand + Supabase.

## Desarrollo local

```bash
npm install
cp .env.example .env   # completar con tus credenciales de Supabase
npm run dev
```

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave publicable/anon del proyecto |

Estas dos son necesarias tanto en local (`.env`) como en cualquier entorno donde se compile la app (por ejemplo, Netlify). No son secretas: quedan igual embebidas en el bundle del cliente, la seguridad real la dan las políticas RLS en Supabase.

## Deploy en Netlify

El repo ya incluye `netlify.toml` con el build configurado (`npm run build`, carpeta `dist`, Node 20).

1. Subí este repo a GitHub/GitLab/Bitbucket (o usá Netlify CLI para un deploy manual, ver abajo).
2. En Netlify: **Add new site → Import an existing project**, elegí el repo. Netlify va a detectar `netlify.toml` automáticamente.
3. Antes del primer deploy, agregá las variables de entorno en **Site configuration → Environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. HTTPS queda activado automáticamente, necesario para que funcione el service worker y el "Agregar a inicio" en iPhone.

### Alternativa sin GitHub: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

La CLI va a preguntar el build command (`npm run build`) y la carpeta a publicar (`dist`) la primera vez, y también hay que cargar las mismas variables de entorno (`netlify env:set VITE_SUPABASE_URL ...`).
