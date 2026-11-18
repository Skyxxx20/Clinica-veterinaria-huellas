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
- **Regresión:** confirma que los roles, las pantallas de búsqueda y las rutas principales continúan disponibles, y que las rutas protegidas siguen rechazando solicitudes sin sesión.
- **Integración:** API, base de datos y protección de rutas.
- **Funcionales:** carga de la aplicación y validación del login.
- **No funcionales:** disponibilidad y promedio de respuesta de la API.

La evidencia se obtiene copiando la salida completa de la terminal, incluyendo la línea `Resultado`.

## Prueba de regresión

La regresión se ejecuta junto con el comando general:

```bash
node pruebas/run-tests.mjs
```

No crea ni modifica datos. Comprueba que:

1. Los cuatro roles sigan definidos.
2. Las pantallas principales de propietario, veterinario y recepción sigan presentes.
3. Las rutas principales de la API sigan declaradas.
4. Las rutas que requieren sesión sigan devolviendo `401` cuando se consultan sin token.

Su objetivo es detectar que un cambio nuevo, como la búsqueda filtrada o la prueba de carga, no haya dañado funciones que ya funcionaban. Un resultado `PASS [regresion]` indica que esa comprobación se conservó; un `FAIL [regresion]` muestra qué comportamiento dejó de cumplirse.

## Prueba de carga

La suite incluye una prueba de carga de los flujos principales autenticados:

- Sesión actual.
- Mascotas.
- Citas.
- Historias clínicas.
- Recetas.
- Vacunas.
- Notificaciones.
- Usuarios.

Por defecto ejecuta **2 rondas de 10 solicitudes concurrentes por flujo**. Mide el promedio, el máximo y el percentil 95 (p95). La prueba se aprueba si el p95 de cada flujo es menor a **2.000 ms** y todas las solicitudes responden con HTTP 200.

Ejecuta la suite con el backend y frontend encendidos:

```bash
node pruebas/run-tests.mjs
```

La prueba usa por defecto `admin@x.com` / `123`, las cuentas incluidas en `bd.sql`. Se pueden proporcionar otras credenciales sin modificar el código:

```bash
LOAD_EMAIL=admin@x.com LOAD_PASSWORD=123 node pruebas/run-tests.mjs
```

Para cambiar la carga:

```bash
LOAD_CONCURRENCY=20 LOAD_ROUNDS=3 node pruebas/run-tests.mjs
```

El resultado esperado incluye líneas como:

```text
PASS [carga] 8 flujos con 10 usuarios concurrentes - 2 rondas; mascotas: promedio 35.20 ms, p95 61.40 ms...
Resultado: 9/9 pruebas aprobadas
```

El p95 significa que el 95 % de las solicitudes tardó como máximo ese tiempo. El 5 % restante puede tardar más, pero ningún flujo pasa si su p95 alcanza o supera los 2 segundos.
