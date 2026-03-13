# 🚀 SETUP — Panel Admin Metamas con Supabase

## ¿Por qué Supabase?

- ✅ **Contraseña imposible de robar**: vive en servidores Supabase con bcrypt. Nadie puede verla desde el navegador, ni en DevTools, ni en el código fuente.
- ✅ **Cambios en tiempo real**: un cambio desde el admin se ve en todos los navegadores del mundo al instante.
- ✅ **100% gratuito** para este uso.

---

## Paso 1 — Crear cuenta en Supabase

1. Entrá a [https://supabase.com](https://supabase.com) y creá una cuenta gratuita.
2. Creá un nuevo proyecto (elegí la región más cercana: `South America (São Paulo)`).
3. Esperá 1-2 minutos a que el proyecto se inicialice.

---

## Paso 2 — Crear la base de datos

1. En tu proyecto Supabase, andá a **SQL Editor** (ícono de base de datos).
2. Pegá y ejecutá el siguiente SQL:

```sql
-- Tabla principal para guardar productos y catálogo
CREATE TABLE site_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permisos: cualquier visitante puede LEER
-- Solo el admin autenticado puede ESCRIBIR
ALTER TABLE site_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica"
  ON site_data FOR SELECT
  USING (true);

CREATE POLICY "Escritura solo admin"
  ON site_data FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Actualizacion solo admin"
  ON site_data FOR UPDATE
  USING (auth.role() = 'authenticated');
```

3. Hacé clic en **Run** (o Ctrl+Enter).

---

## Paso 3 — Crear el usuario administrador

1. En Supabase, andá a **Authentication** → **Users**.
2. Hacé clic en **Add user** → **Create new user**.
3. Ingresá el email y la contraseña que van a usar para entrar al admin (ej: `admin@metamas.com.ar`).
4. ✅ Esa contraseña **nunca va a estar en ningún archivo del sitio**. Solo existe en servidores de Supabase.

> Para cambiarla en el futuro: Authentication → Users → clic en el usuario → Update password.

---

## Paso 4 — Copiar las credenciales del proyecto

1. En Supabase, andá a **Settings** → **API**.
2. Copiá:
   - **Project URL** (algo como `https://xyzabc.supabase.co`)
   - **anon public key** (una clave larga que empieza con `eyJ...`)

3. Abrí el archivo `js/supabase-config.js` y reemplazá:

```javascript
const SUPABASE_URL  = 'PEGA_TU_SUPABASE_URL_AQUÍ';
const SUPABASE_ANON = 'PEGA_TU_SUPABASE_ANON_KEY_AQUÍ';
```

Por tus datos reales:

```javascript
const SUPABASE_URL  = 'https://tuproyecto.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

> ⚠️ La `anon key` es pública (está diseñada para estar en el código del cliente). Las políticas RLS del paso 2 se encargan de la seguridad.

---

## Paso 5 — Subir los archivos y probar

1. Subí todos los archivos al hosting (Netlify, Vercel, cPanel, etc.).
2. Abrí `admin.html` en el navegador.
3. Ingresá con el email y contraseña del Paso 3.
4. ¡Listo! Cualquier cambio que hagas en el admin aparecerá en el sitio para todos los visitantes.

---

## ¿Cómo funciona el tiempo real?

Supabase usa **WebSockets** (Postgres Realtime). Cuando guardás un producto:
1. El admin escribe en la base de datos de Supabase.
2. Supabase notifica a todos los navegadores suscritos.
3. El sitio actualiza el contenido sin que el visitante tenga que recargar.

---

## Preguntas frecuentes

**¿Puede alguien ver mi contraseña mirando el código fuente?**
No. El código solo tiene la `anon key` de Supabase (que es pública por diseño). La contraseña solo existe como hash en los servidores de Supabase.

**¿Qué pasa si no configuro Supabase?**
El sitio funciona igual con los datos por defecto (los productos originales). El admin muestra un error de conexión al intentar guardar.

**¿Hay límite de uso gratuito?**
El plan gratuito de Supabase incluye 500MB de base de datos y 5GB de transferencia mensual. Para el uso de Metamas, es más que suficiente.

**¿Dónde se guardan las imágenes?**
Las imágenes se guardan como base64 en la base de datos. Para imágenes muy grandes, se puede configurar Supabase Storage (gratuito hasta 1GB) — consultalo si es necesario.





const SUPABASE_URL  = 'https://whoacawjbzbyhaqopyfd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indob2FjYXdqYnpieWhhcW9weWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODY1NzksImV4cCI6MjA4ODc2MjU3OX0.OE9oKeCOsSyjW1_-1bm4SYbkZio35KrIwL2v-LtmImk';
