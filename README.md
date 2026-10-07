# Registro de instrumentos

Aplicación Next.js pública para registrar el nombre de una persona, instrumento, número de
parte, número de serie y una foto, sin inicio de sesión. Cualquier visitante puede enviar
registros. Los campos se guardan en Neon PostgreSQL y el archivo de imagen se guarda en
Vercel Blob. En la base de datos solo se almacena la URL de la foto, no su contenido. Las
fotos son públicas para quien tenga la URL.

## Configuración

1. Crea una base Neon y una tienda Vercel Blob, vinculadas al proyecto de Vercel.
2. Ejecuta [`db/schema.sql`](./db/schema.sql) en el SQL Editor de Neon para crear la tabla.
3. Configura estas variables de entorno en Vercel y en el archivo local `.env.local`:

   | Variable | Uso |
   | --- | --- |
   | `DATABASE_URL` | Cadena de conexión de Neon |
   | `BLOB_READ_WRITE_TOKEN` | Token de lectura/escritura de Vercel Blob |

   Consulta [`.env.example`](./.env.example) para ver los nombres de las variables. No
   compartas ni subas los valores secretos al repositorio.
4. Instala dependencias y ejecuta la aplicación:

   ```bash
   npm install
   npm run dev
   ```

La API permite envíos públicos, pero valida los campos y acepta únicamente fotos JPG, PNG o
WebP de hasta 4 MB. Evita guardar información sensible: cualquier persona puede enviar
registros y las imágenes almacenadas son públicas.
