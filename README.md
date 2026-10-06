# Registro de instrumentos

Aplicación Next.js para registrar el nombre de una persona, instrumento, número de parte,
número de serie y una foto. Los campos se guardan en Neon PostgreSQL y el archivo de imagen
se guarda en Vercel Blob. En la base de datos solo se almacena la URL de la foto, no su
contenido. Las fotos son públicas para quien tenga la URL.

## Configuración

1. Crea una base Neon y una tienda Vercel Blob, vinculadas al proyecto de Vercel.
2. Ejecuta [`db/schema.sql`](./db/schema.sql) en el SQL Editor de Neon para crear la tabla.
3. Configura estas variables de entorno en Vercel y en el archivo local `.env.local`:

   | Variable | Uso |
   | --- | --- |
   | `DATABASE_URL` | Cadena de conexión de Neon |
   | `BLOB_READ_WRITE_TOKEN` | Token de lectura/escritura de Vercel Blob |
   | `AUTH_SECRET` | Secreto de sesión de Auth.js |
   | `AUTH_GOOGLE_ID` | Client ID de OAuth de Google |
   | `AUTH_GOOGLE_SECRET` | Client secret de OAuth de Google |
   | `AUTHORIZED_EMAILS` | Lista de correos permitidos, separados por coma |

   Consulta [`.env.example`](./.env.example) para ver los nombres de las variables. No
   compartas ni subas los valores secretos al repositorio.

4. En Google Cloud Console, crea credenciales OAuth para una aplicación web y añade estos
   URI de redirección autorizados:
   - Desarrollo: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://TU-DOMINIO/api/auth/callback/google`
5. Añade los correos autorizados en `AUTHORIZED_EMAILS`. La autenticación falla cerrada si
   esa lista está vacía; usar `gmail.com` como dominio no restringe el acceso, por eso se
   valida cada dirección individual.
6. Instala dependencias y ejecuta la aplicación:

   ```bash
   npm install
   npm run dev
   ```

La API valida que la foto sea JPG, PNG o WebP de hasta 4 MB y requiere una sesión autorizada.
