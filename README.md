# Registro de instrumentos

Aplicación Next.js pública para registrar el nombre de una persona, instrumento, número de
parte, número de serie y una foto, sin inicio de sesión. Cualquier visitante puede enviar
registros. Los campos se guardan en Neon PostgreSQL y el archivo de imagen se guarda en
una tienda Vercel Blob con acceso privado. En la base de datos solo se almacena la URL de la
foto, no su contenido; las fotos requieren autenticación para acceder.

## Configuración

1. Crea una base Neon y una tienda Vercel Blob configurada con acceso privado, vinculadas al
   proyecto de Vercel.
2. Ejecuta [`db/schema.sql`](./db/schema.sql) en el SQL Editor de Neon para crear la tabla.
3. Configura estas variables de entorno en Vercel y en el archivo local `.env.local`:

   | Variable | Uso |
   | --- | --- |
   | `DATABASE_URL` | Cadena de conexión de Neon |
   | `BLOB_READ_WRITE_TOKEN` | Token de lectura/escritura de Vercel Blob |

   Consulta [`.env.example`](./.env.example) para ver los nombres de las variables. No
   compartas ni subas los valores secretos al repositorio.
   En Vercel, agrega `BLOB_READ_WRITE_TOKEN` en los ajustes del proyecto usando un token de
   lectura/escritura de esa tienda privada y vuelve a desplegar para que la función reciba la
   variable.
4. Instala dependencias y ejecuta la aplicación:

   ```bash
   npm install
   npm run dev
   ```

La API permite envíos públicos, pero valida los campos y acepta únicamente fotos JPG, PNG o
WebP de hasta 4 MB. Evita guardar información sensible: cualquier persona puede enviar
registros, aunque las fotos almacenadas en Blob requieren autenticación.
