import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const root = new URL('../', import.meta.url);
const frontendSource = await fs.readFile(new URL('fontend/src/main.jsx', root), 'utf8');
const backendSource = await fs.readFile(new URL('backend/src/server.js', root), 'utf8');
const apiBase = process.env.API_URL || 'http://127.0.0.1:3001/api';
const frontendBase = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
const loadConcurrency = Number(process.env.LOAD_CONCURRENCY || 10);
const loadRounds = Number(process.env.LOAD_ROUNDS || 2);
const loadLimitMs = 2000;
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

function percentile(samples, value) {
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1)];
}

async function loginForLoad() {
  const email = process.env.LOAD_EMAIL || 'admin@x.com';
  const password = process.env.LOAD_PASSWORD || '123';
  const { response, body } = await get(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  assert.equal(response.status, 200, `el usuario de carga no pudo iniciar sesión (${response.status})`);
  assert.ok(body.token, 'la respuesta de login no contiene token');
  return body.token;
}

async function measureLoad(path, token) {
  const samples = [];
  for (let round = 0; round < loadRounds; round += 1) {
    await Promise.all(Array.from({ length: loadConcurrency }, async () => {
      const started = performance.now();
      const { response } = await get(`${apiBase}${path}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const elapsed = performance.now() - started;
      assert.equal(response.status, 200, `${path} respondió ${response.status}`);
      samples.push(elapsed);
    }));
  }
  return {
    requests: samples.length,
    average: samples.reduce((sum, value) => sum + value, 0) / samples.length,
    p95: percentile(samples, 0.95),
    maximum: Math.max(...samples)
  };
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

await check('regresion', 'Se conservan los roles y sus superficies de búsqueda', () => {
  assert.match(frontendSource, /admin:\s*'Administrador'/);
  assert.match(frontendSource, /vet:\s*'Veterinario'/);
  assert.match(frontendSource, /reception:\s*'Recepcionista'/);
  assert.match(frontendSource, /owner:\s*'Propietario'/);
  assert.match(frontendSource, /function SearchFilter/);
  assert.match(frontendSource, /function OwnerRecords/);
  assert.match(frontendSource, /function OwnerPrescriptions/);
  assert.match(frontendSource, /function OwnerNotifications/);
  assert.match(frontendSource, /function VetRecords/);
  assert.match(frontendSource, /function VetPrescriptions/);
  assert.match(frontendSource, /function VetVaccinations/);
  assert.match(frontendSource, /function ReceptionUsers/);
  assert.match(frontendSource, /function ReceptionPets/);
});

await check('regresion', 'Se conservan las rutas principales de la API', () => {
  for (const route of ['/api/health', '/api/auth/login', '/api/pets', '/api/appointments', '/api/medical-records', '/api/prescriptions', '/api/vaccinations', '/api/notifications']) {
    assert.match(backendSource, new RegExp(`['"]${route.replace('/api', '')}`));
  }
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

await check('regresion', 'Las rutas protegidas siguen exigiendo autenticación', async () => {
  for (const path of ['/pets', '/appointments', '/medical-records', '/prescriptions', '/vaccinations', '/notifications']) {
    const { response } = await get(`${apiBase}${path}`);
    assert.equal(response.status, 401, `${path} debería responder 401 sin token`);
  }
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

await check('carga', `Los flujos principales responden en menos de ${loadLimitMs} ms`, async () => {
  assert.ok(Number.isInteger(loadConcurrency) && loadConcurrency > 0, 'LOAD_CONCURRENCY debe ser un entero positivo');
  assert.ok(Number.isInteger(loadRounds) && loadRounds > 0, 'LOAD_ROUNDS debe ser un entero positivo');
  const token = await loginForLoad();
  const flows = [
    ['/auth/me', 'sesión actual'],
    ['/pets', 'mascotas'],
    ['/appointments', 'citas'],
    ['/medical-records', 'historias clínicas'],
    ['/prescriptions', 'recetas'],
    ['/vaccinations', 'vacunas'],
    ['/notifications', 'notificaciones'],
    ['/users', 'usuarios']
  ];
  const reports = [];
  for (const [path, name] of flows) {
    const report = await measureLoad(path, token);
    reports.push(`${name}: promedio ${report.average.toFixed(2)} ms, p95 ${report.p95.toFixed(2)} ms, máximo ${report.maximum.toFixed(2)} ms`);
    assert.ok(report.p95 < loadLimitMs, `${name}: p95 ${report.p95.toFixed(2)} ms supera ${loadLimitMs} ms`);
  }
  record('carga', `${flows.length} flujos con ${loadConcurrency} usuarios concurrentes`, true, `${loadRounds} rondas; ${reports.join(' | ')}`);
});

const failed = results.filter(result => !result.passed);
console.log(`\nResultado: ${results.length - failed.length}/${results.length} pruebas aprobadas`);
if (failed.length) {
  console.error(`Fallidas: ${failed.length}`);
  process.exitCode = 1;
}