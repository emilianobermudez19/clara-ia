# Base de datos de Chía (Supabase)

Cuentas con correo y contraseña y "Mi espacio" sincronizado entre dispositivos, **cifrado de extremo a extremo**:
el servidor solo guarda datos que no puede leer. Detalle del esquema criptográfico en `src/lib/e2e.ts`.

## Activarlo
1. **Crea el proyecto**: con Lovable Cloud ya existe; si no, en https://supabase.com → New project.
2. **Aplica la migración**: en el panel → SQL Editor, pega y ejecuta
   `supabase/migrations/20261103090000_chia_vaults.sql`. (Con la CLI: `supabase db push`.)
3. **Variables** en el `.env` de la web: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`
   (Project Settings → API). Reinicia `npm run dev`.
4. **Auth → URL Configuration**: agrega tu dominio y `http://localhost:5173` a *Redirect URLs*
   (para los enlaces de confirmación y de recuperación, que llevan a `/cuenta` y `/recuperar`).
5. **Auth → Providers → Email**: para la demo puedes desactivar *Confirm email* y así entrar al instante.
   En producción déjalo activado y configura un proveedor SMTP propio (el de Supabase tiene un límite bajo de envíos).

## Qué guarda el servidor
| Tabla | Contenido | ¿Legible para Chía? |
| --- | --- | --- |
| `auth.users` | correo y un hash de la *clave de acceso* (no la contraseña real) | Solo el correo |
| `public.vaults` | ficha, vacunas, recordatorios y consultas cifrados; clave de datos envuelta dos veces | No |

Seguridad a nivel de fila: cada persona solo puede leer, crear, cambiar o borrar **su propia** bóveda.
`delete_my_account()` borra la cuenta y su bóveda.

## Cómo funciona
- La contraseña nunca sale del dispositivo: de ella se derivan una *clave de acceso* (que se envía a Supabase como
  contraseña) y una *clave de cifrado* distinta.
- Al crear la cuenta se muestra una **clave de recuperación** una sola vez. Con el enlace de "Olvidé mi contraseña"
  y esa clave, la persona fija una contraseña nueva y conserva sus datos. Sin ella, los datos no se pueden recuperar.
- En cada teléfono, un **PIN** de 6 dígitos desbloquea la copia local y reconecta la cuenta sin volver a escribir la contraseña.
- Los cambios se suben cifrados unos segundos después de editar. Si hay cambios desde otro dispositivo, se traen al entrar
  (gana la versión más reciente).

## Pendiente
- App móvil: misma cuenta y sincronización (hoy guarda solo en el teléfono).
- Edición simultánea en dos dispositivos: hoy gana la última escritura; para muchos usuarios conviene fusionar por sección.
- Límites de uso por cuenta en `/api/chat` para controlar el costo de la IA.
