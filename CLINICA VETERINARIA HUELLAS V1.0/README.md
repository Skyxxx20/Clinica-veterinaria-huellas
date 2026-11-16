# Huella - Clínica veterinaria

## Puesta en marcha

1. Ejecuta [bd.sql](./bd.sql) en MySQL/XAMPP. El script crea `huella_db` y las cuentas internas.
2. En una terminal:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. En otra terminal:

   ```bash
   cd fontend
   npm install
   npm run dev
   ```

La API usa MySQL en `127.0.0.1:3306`, base `huella_db`, usuario `root` y contraseña vacía mediante [backend/.env](./backend/.env). La interfaz usa `http://localhost:3001/api` mediante [fontend/.env](./fontend/.env).

Las cuentas incluidas en `bd.sql` son:

- `admin@x.com` / `123`
- `veterinario@x.com` / `123`
- `recepcionista@x.com` / `123`

Los propietarios pueden crear su cuenta desde la pantalla de acceso. Todas las altas y cambios se guardan en MySQL; las citas rechazan horarios ocupados y las solicitudes de propietarios quedan registradas en las columnas de solicitud del esquema.
