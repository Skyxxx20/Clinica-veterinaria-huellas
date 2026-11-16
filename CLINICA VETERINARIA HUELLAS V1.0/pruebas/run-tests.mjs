import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const root = new URL('../', import.meta.url);
const frontendSource = await fs.readFile(new URL('fontend/src/main.jsx', root), 'utf8');
const backendSource = await fs.readFile(new URL('backend/src/server.js', root), 'utf8');
const apiBase = process.env.API_URL || 'http://127.0.0.1:3001/api';
const frontendBase = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
const results = [];

function record(category, name, passed, detail = '') {
  results.push({ category, name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} [${category}] ${name}${detail ? ` - ${detail}` : ''}`);
}

async function check(category, name, fn) {
  try {
    await fn();
    record(category, name, true);
  } catch (error) {
    record(category, name, false, error.message);
  }
}

async function get(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = text;
  try { body = JSON.parse(text); } catch {}
  return { response, body };
}

await check('unitaria', 'La interfaz define los cuatro roles', () => {
  assert.match(frontendSource, /admin:\s*'Administrador'/);
  assert.match(frontendSource, /vet:\s*'Veterinario'/);
  assert.match(frontendSource, /reception:\s*'Recepcionista'/);
  assert.match(frontendSource, /owner:\s*'Propietario'/);
});

await check('unitaria', 'El propietario puede abrir el formulario de mascotas', () => {
  assert.match(frontendSource, /onOpen\('pet'\)/);
  assert.match(frontendSource, /type === 'pet'/);
  assert.match(frontendSource, /Agregar mascota/);
});

await check('unitaria', 'La API restringe el alta de usuarios a recepción', () => {
  assert.match(backendSource, /app\.post\('\/api\/users', auth, allow\('reception'\)/);
  assert.match(backendSource, /app\.post\('\/api\/pets', auth, allow\('admin', 'reception', 'owner'\)/);
});

await check('integracion', 'La API responde con la base de datos conectada', async () => {
  const { response, body } = await get(`${apiBase}/health`);
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.database, 'connected');
});

await check('integracion', 'Las rutas protegidas rechazan solicitudes sin token', async () => {
  const { response } = await get(`${apiBase}/pets`);
  assert.equal(response.status, 401);
});

await check('funcional', 'El frontend entrega la página principal', async () => {
  const { response, body } = await get(`${frontendBase}/`);
  assert.equal(response.status, 200);
  assert.match(String(body), /<div id="root"><\/div>/);
  assert.match(String(body), /Huella Clínica Veterinaria/);
});

await check('funcional', 'El login rechaza credenciales incompletas', async () => {
  const { response, body } = await get(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(response.status, 400);
  assert.match(body.message, /Faltan/);
});

await check('no funcional', 'La API mantiene disponibilidad en cinco solicitudes', async () => {
  const samples = [];
  for (let index = 0; index < 5; index += 1) {
    const started = performance.now();
    const { response } = await get(`${apiBase}/health`);
    samples.push(performance.now() - started);
    assert.equal(response.status, 200);
  }
  const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  assert.ok(average < 1000, `promedio ${average.toFixed(2)} ms`);
  record('no funcional', 'Tiempo promedio de respuesta de salud', true, `${average.toFixed(2)} ms`);
});

const failed = results.filter(result => !result.passed);
console.log(`\nResultado: ${results.length - failed.length}/${results.length} pruebas aprobadas`);
if (failed.length) {
  console.error(`Fallidas: ${failed.length}`);
  process.exitCode = 1;
}