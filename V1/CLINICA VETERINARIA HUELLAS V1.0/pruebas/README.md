# Pruebas del proyecto Huella

La suite no modifica el código de la aplicación. Solo lee los archivos fuente y consulta los servicios que ya están ejecutándose.

## Preparación

En una terminal inicia el backend:

```bash
cd "/Users/cami/Documents/CLINICA VETERINARIA HUELLAS/backend"
npm run dev
```

En otra terminal inicia el frontend:

```bash
cd "/Users/cami/Documents/CLINICA VETERINARIA HUELLAS/fontend"
npm run dev
```

## Ejecución

Desde la raíz del proyecto:

```bash
node pruebas/run-tests.mjs
```

Si los puertos son diferentes:

```bash
API_URL=http://127.0.0.1:3001/api \
FRONTEND_URL=http://127.0.0.1:5173 \
node pruebas/run-tests.mjs
```

La salida muestra cada prueba como `PASS` o `FAIL` y el total aprobado. La suite incluye:

- **Unitarias:** contratos de roles, formularios y autorización declarados en el código.
- **Integración:** API, base de datos y protección de rutas.
- **Funcionales:** carga de la aplicación y validación del login.
- **No funcionales:** disponibilidad y promedio de respuesta de la API.

La evidencia se obtiene copiando la salida completa de la terminal, incluyendo la línea `Resultado`.
