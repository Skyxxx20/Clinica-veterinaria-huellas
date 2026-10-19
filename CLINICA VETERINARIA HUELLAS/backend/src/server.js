import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const app = express();
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'huella_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});
const roles = { admin: 'Administrador', vet: 'Veterinario', reception: 'Recepcionista', owner: 'Propietario' };
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const tokenFor = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'huella-development-secret', { expiresIn: '8h' });
function auth(req, res, next) {
  const value = req.headers.authorization?.split(' ')[1];
  if (!value) return res.status(401).json({ message: 'Autenticación requerida' });
  try { req.user = jwt.verify(value, process.env.JWT_SECRET || 'huella-development-secret'); next(); }
  catch { return res.status(401).json({ message: 'Sesión inválida o expirada' }); }
}
const allow = (...allowed) => (req, res, next) => allowed.includes(req.user.role) ? next() : res.status(403).json({ message: 'No tienes permisos para esta operación' });
const required = (body, fields) => fields.filter((field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === '');
const query = async (sql, params = []) => { const [rows] = await pool.execute(sql, params); return rows; };
const appointmentStatuses = ['pending', 'confirmed', 'arrived', 'waiting', 'completed', 'cancelled'];
async function ensureAppointmentStatuses() {
  await query("ALTER TABLE appointments MODIFY COLUMN status ENUM('pending','confirmed','arrived','waiting','completed','cancelled') NOT NULL DEFAULT 'pending'");
}
async function ensureUrgenciesTable() {
  await query(`CREATE TABLE IF NOT EXISTS urgencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(160) NOT NULL,
    owner_email VARCHAR(160) NULL,
    owner_id INT NULL,
    pet_id INT NULL,
    symptoms TEXT NOT NULL,
    status ENUM('open','attended','closed') NOT NULL DEFAULT 'open',
    created_by INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);
  const columns = await query("SHOW COLUMNS FROM urgencies LIKE 'patient_name'");
  if (!columns.length) await query("ALTER TABLE urgencies ADD COLUMN patient_name VARCHAR(160) NOT NULL DEFAULT 'Paciente' AFTER id");
  await query("ALTER TABLE urgencies MODIFY COLUMN owner_email VARCHAR(160) NULL");
}
async function notify(userId, type, title, message, refTable, refId, sentBy) {
  await query('INSERT INTO notifications (user_id,type,title,message,ref_table,ref_id,sent_by) VALUES (?,?,?,?,?,?,?)', [userId, type, title, message, refTable || null, refId || null, sentBy || null]);
}

app.get('/api/health', asyncRoute(async (_req, res) => { await query('SELECT 1'); res.json({ ok: true, database: 'connected' }); }));
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const missing = required(req.body, ['email', 'password']); if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  const rows = await query('SELECT id,full_name,email,password_hash,phone,role,is_active FROM users WHERE email=? LIMIT 1', [req.body.email.toLowerCase()]);
  const user = rows[0]; if (!user || !user.is_active || !(await bcrypt.compare(req.body.password, user.password_hash))) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  delete user.password_hash; res.json({ token: tokenFor(user), user: { ...user, role_label: roles[user.role] } });
}));
app.get('/api/auth/me', auth, asyncRoute(async (req, res) => { const rows = await query('SELECT id,full_name,email,phone,role FROM users WHERE id=?', [req.user.id]); res.json(rows[0]); }));

app.get('/api/users', auth, allow('admin', 'reception'), asyncRoute(async (_req, res) => res.json(await query("SELECT u.id,u.full_name,u.email,u.phone,u.role,u.is_active,u.created_at,GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') AS pet_names FROM users u LEFT JOIN pets p ON p.owner_id=u.id WHERE u.role='owner' GROUP BY u.id ORDER BY u.full_name"))));
app.post('/api/users', auth, allow('reception'), asyncRoute(async (req, res) => {
  const missing = required(req.body, ['full_name', 'email', 'phone', 'pet_name', 'species', 'sex']);
  if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const hash = await bcrypt.hash(req.body.password || 'Cambiar123!', 10);
    const [owner] = await connection.execute('INSERT INTO users (full_name,email,password_hash,phone,role) VALUES (?,?,?,?,?)', [req.body.full_name, req.body.email.toLowerCase(), hash, req.body.phone, 'owner']);
    const [pet] = await connection.execute('INSERT INTO pets (owner_id,name,species,breed,sex,age_years,weight_kg,notes) VALUES (?,?,?,?,?,?,?,?)', [owner.insertId, req.body.pet_name, req.body.species, req.body.breed || null, req.body.sex, req.body.age_years || null, req.body.weight_kg || null, req.body.notes || null]);
    await connection.commit();
    res.status(201).json({ owner_id: owner.insertId, pet_id: pet.insertId, message: 'Propietario y mascota registrados correctamente' });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: error.sqlMessage?.includes('email') ? 'El correo ya está registrado' : 'Ya existe una mascota con ese nombre para este propietario' });
    throw error;
  } finally { connection.release(); }
}));
app.patch('/api/users/:id', auth, allow('reception'), asyncRoute(async (req, res) => {
  const missing = required(req.body, ['full_name', 'email', 'phone']);
  if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  try {
    await pool.execute('UPDATE users SET full_name=?,email=?,phone=? WHERE id=? AND role=\'owner\'', [req.body.full_name, req.body.email.toLowerCase(), req.body.phone, req.params.id]);
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'El correo ya está registrado' });
    throw error;
  }
}));
app.get('/api/pets', auth, asyncRoute(async (req, res) => {
  const ownerFilter = req.user.role === 'owner' ? 'WHERE p.owner_id=?' : '';
  res.json(await query(`SELECT p.*,u.full_name owner_name,u.email owner_email,u.phone owner_phone FROM pets p JOIN users u ON u.id=p.owner_id ${ownerFilter} ORDER BY p.name`, req.user.role === 'owner' ? [req.user.id] : []));
}));
app.post('/api/pets', auth, allow('admin', 'reception', 'owner'), asyncRoute(async (req, res) => {
  const missing = required(req.body, ['name', 'species', 'sex']); if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  const ownerId = req.user.role === 'owner' ? req.user.id : req.body.owner_id; if (!ownerId) return res.status(400).json({ message: 'Selecciona el propietario' });
  try { const result = await pool.execute('INSERT INTO pets (owner_id,name,species,breed,sex,age_years,weight_kg,notes) VALUES (?,?,?,?,?,?,?,?)', [ownerId, req.body.name, req.body.species, req.body.breed || null, req.body.sex, req.body.age_years || null, req.body.weight_kg || null, req.body.notes || null]); res.status(201).json({ id: result[0].insertId }); }
  catch (error) { if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya existe una mascota con ese nombre para este propietario' }); throw error; }
}));

const appointmentSelect = `SELECT a.*,p.name pet_name,p.species,p.owner_id,u.full_name owner_name,v.full_name vet_name FROM appointments a JOIN pets p ON p.id=a.pet_id JOIN users u ON u.id=p.owner_id LEFT JOIN users v ON v.id=a.vet_id`;
app.get('/api/appointments', auth, asyncRoute(async (req, res) => {
  const filters = []; const params = [];
  if (req.user.role === 'owner') { filters.push('p.owner_id=?'); params.push(req.user.id); }
  if (req.query.from) { filters.push('a.appt_date>=?'); params.push(req.query.from); } if (req.query.to) { filters.push('a.appt_date<=?'); params.push(req.query.to); }
  res.json(await query(`${appointmentSelect} ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''} ORDER BY a.appt_date,a.appt_time`, params));
}));
app.post('/api/appointments', auth, allow('admin', 'reception', 'owner'), asyncRoute(async (req, res) => {
  const missing = required(req.body, ['pet_id', 'appt_date', 'appt_time']); if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  const pets = await query('SELECT p.id,p.owner_id FROM pets p WHERE p.id=?', [req.body.pet_id]); const pet = pets[0]; if (!pet || (req.user.role === 'owner' && pet.owner_id !== req.user.id)) return res.status(404).json({ message: 'Mascota no encontrada' });
  const conflict = await query("SELECT id FROM appointments WHERE appt_date=? AND appt_time=? AND status <> 'cancelled' LIMIT 1", [req.body.appt_date, req.body.appt_time]); if (conflict.length) return res.status(409).json({ message: 'Ese horario ya está ocupado' });
  const status = req.user.role === 'owner' ? 'pending' : (req.body.status || 'confirmed');
  const result = await pool.execute('INSERT INTO appointments (pet_id,vet_id,appt_date,appt_time,reason,status,created_by) VALUES (?,?,?,?,?,?,?)', [pet.id, req.body.vet_id || null, req.body.appt_date, req.body.appt_time, req.body.reason || 'Consulta general', status, req.user.id]);
  if (req.user.role !== 'owner') await notify(pet.owner_id, 'appointment', 'Nueva cita programada', `Cita de ${req.body.reason || 'consulta general'} para el ${req.body.appt_date} a las ${req.body.appt_time}`, 'appointments', result[0].insertId, req.user.id);
  res.status(201).json({ id: result[0].insertId, status });
}));
app.patch('/api/appointments/:id', auth, allow('admin', 'reception', 'owner'), asyncRoute(async (req, res) => {
  const rows = await query(`${appointmentSelect} WHERE a.id=?`, [req.params.id]); const appt = rows[0]; if (!appt || (req.user.role === 'owner' && appt.owner_id !== req.user.id)) return res.status(404).json({ message: 'Cita no encontrada' });
  if (req.body.status && !appointmentStatuses.includes(req.body.status)) return res.status(400).json({ message: 'Estado de cita no válido' });
  if (req.user.role === 'owner' && req.body.action === 'cancel') { await query("UPDATE appointments SET request_type='cancel',request_note=? WHERE id=?", [req.body.note || 'Solicitud del propietario', appt.id]); return res.json({ message: 'Solicitud de cancelación enviada' }); }
  if (req.user.role === 'owner' && req.body.action === 'reschedule') { await query("UPDATE appointments SET request_type='reschedule',requested_date=?,requested_time=?,request_note=? WHERE id=?", [req.body.requested_date, req.body.requested_time, req.body.note || null, appt.id]); return res.json({ message: 'Solicitud de reprogramación enviada' }); }
  if (req.body.status === 'cancelled') { await query("UPDATE appointments SET status='cancelled',request_type=NULL WHERE id=?", [appt.id]); return res.json({ message: 'Cita cancelada' }); }
  if (req.body.appt_date || req.body.appt_time) { const date = req.body.appt_date || appt.appt_date; const time = req.body.appt_time || appt.appt_time; const conflict = await query("SELECT id FROM appointments WHERE appt_date=? AND appt_time=? AND id<>? AND status <> 'cancelled'", [date, time, appt.id]); if (conflict.length) return res.status(409).json({ message: 'Ese horario ya está ocupado' }); await query("UPDATE appointments SET appt_date=?,appt_time=?,status='confirmed',request_type=NULL WHERE id=?", [date, time, appt.id]); }
  else if (req.body.status) await query('UPDATE appointments SET status=?,request_type=NULL WHERE id=?', [req.body.status, appt.id]);
  res.json({ message: 'Cita actualizada' });
}));

app.post('/api/urgencies', auth, allow('admin', 'reception', 'vet'), asyncRoute(async (req, res) => {
  const missing = required(req.body, ['patient_name', 'symptoms']);
  if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  const result = await pool.execute('INSERT INTO urgencies (patient_name,owner_email,symptoms,created_by) VALUES (?,?,?,?)', [req.body.patient_name, req.body.owner_email || null, req.body.symptoms, req.user.id]);
  const vets = await query("SELECT id FROM users WHERE role='vet' AND is_active=1");
  for (const vet of vets) await notify(vet.id, 'urgency', `Urgencia: ${req.body.patient_name}`, `${req.body.symptoms}${req.body.owner_email ? ` · Propietario: ${req.body.owner_email}` : ''}`, 'urgencies', result[0].insertId, req.user.id);
  res.status(201).json({ id: result[0].insertId, message: 'Urgencia registrada y equipo veterinario alertado' });
}));
app.get('/api/urgencies', auth, allow('admin', 'reception', 'vet'), asyncRoute(async (_req, res) => {
  res.json(await query("SELECT id,patient_name,owner_email,symptoms,status,created_at FROM urgencies WHERE status='open' ORDER BY created_at DESC"));
}));
app.patch('/api/urgencies/:id', auth, allow('admin', 'reception', 'vet'), asyncRoute(async (req, res) => {
  if (!['attended', 'closed', 'open'].includes(req.body.status)) return res.status(400).json({ message: 'Estado de urgencia no válido' });
  const result = await pool.execute('UPDATE urgencies SET status=? WHERE id=?', [req.body.status, req.params.id]);
  if (!result[0].affectedRows) return res.status(404).json({ message: 'Urgencia no encontrada' });
  res.json({ message: 'Urgencia actualizada' });
}));

app.get('/api/medical-records', auth, asyncRoute(async (req, res) => { const extra = req.user.role === 'owner' ? 'AND p.owner_id=?' : ''; res.json(await query(`SELECT m.*,p.name pet_name,u.full_name vet_name FROM medical_records m JOIN pets p ON p.id=m.pet_id JOIN users u ON u.id=m.vet_id WHERE 1=1 ${extra} ORDER BY m.visit_date DESC,m.id DESC`, req.user.role === 'owner' ? [req.user.id] : [])); }));
app.post('/api/medical-records', auth, allow('vet'), asyncRoute(async (req, res) => {
  const missing = required(req.body, ['pet_id', 'visit_date', 'reason', 'diagnosis']); if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  const result = await pool.execute('INSERT INTO medical_records (pet_id,vet_id,appointment_id,visit_date,reason,symptoms,diagnosis,treatment,weight_kg,temperature_c,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [req.body.pet_id, req.user.id, req.body.appointment_id || null, req.body.visit_date, req.body.reason, req.body.symptoms || null, req.body.diagnosis, req.body.treatment || null, req.body.weight_kg || null, req.body.temperature_c || null, req.body.notes || null]);
  const owner = await query('SELECT owner_id FROM pets WHERE id=?', [req.body.pet_id]); if (owner[0]) await notify(owner[0].owner_id, 'medical_record', 'Nueva historia clínica', `Se registró una consulta para tu mascota`, 'medical_records', result[0].insertId, req.user.id);
  if (req.body.appointment_id) await query("UPDATE appointments SET status='completed' WHERE id=?", [req.body.appointment_id]);
  res.status(201).json({ id: result[0].insertId });
}));
app.get('/api/prescriptions', auth, asyncRoute(async (req, res) => { const extra = req.user.role === 'owner' ? 'AND p.owner_id=?' : ''; res.json(await query(`SELECT r.*,p.name pet_name,u.full_name vet_name FROM prescriptions r JOIN pets p ON p.id=r.pet_id JOIN users u ON u.id=r.vet_id WHERE 1=1 ${extra} ORDER BY r.created_at DESC`, req.user.role === 'owner' ? [req.user.id] : [])); }));
app.post('/api/prescriptions', auth, allow('vet'), asyncRoute(async (req, res) => {
  const missing = required(req.body, ['medical_record_id', 'pet_id', 'medication', 'dose', 'frequency', 'duration_days', 'valid_until']); if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  const result = await pool.execute('INSERT INTO prescriptions (medical_record_id,pet_id,vet_id,medication,dose,frequency,duration_days,instructions,valid_until) VALUES (?,?,?,?,?,?,?,?,?)', [req.body.medical_record_id, req.body.pet_id, req.user.id, req.body.medication, req.body.dose, req.body.frequency, req.body.duration_days, req.body.instructions || null, req.body.valid_until]);
  const owner = await query('SELECT owner_id FROM pets WHERE id=?', [req.body.pet_id]); if (owner[0]) await notify(owner[0].owner_id, 'prescription', 'Nueva receta médica', `Se registró la receta ${req.body.medication}`, 'prescriptions', result[0].insertId, req.user.id);
  res.status(201).json({ id: result[0].insertId });
}));
app.get('/api/vaccinations', auth, asyncRoute(async (req, res) => { const extra = req.user.role === 'owner' ? 'AND p.owner_id=?' : ''; res.json(await query(`SELECT v.*,p.name pet_name,u.full_name vet_name FROM vaccinations v JOIN pets p ON p.id=v.pet_id JOIN users u ON u.id=v.vet_id WHERE 1=1 ${extra} ORDER BY v.next_dose_date`, req.user.role === 'owner' ? [req.user.id] : [])); }));
app.post('/api/vaccinations', auth, allow('vet'), asyncRoute(async (req, res) => {
  const missing = required(req.body, ['pet_id', 'vaccine_name', 'applied_date']); if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` });
  const result = await pool.execute('INSERT INTO vaccinations (pet_id,vet_id,vaccine_name,applied_date,next_dose_date,lot_number,notes) VALUES (?,?,?,?,?,?,?)', [req.body.pet_id, req.user.id, req.body.vaccine_name, req.body.applied_date, req.body.next_dose_date || null, req.body.lot_number || null, req.body.notes || null]);
  const owner = await query('SELECT owner_id FROM pets WHERE id=?', [req.body.pet_id]); if (owner[0] && req.body.next_dose_date) await notify(owner[0].owner_id, 'vaccine', 'Próxima vacuna programada', `${req.body.vaccine_name}: próxima dosis el ${req.body.next_dose_date}`, 'vaccinations', result[0].insertId, req.user.id);
  res.status(201).json({ id: result[0].insertId });
}));
app.get('/api/notifications', auth, asyncRoute(async (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(await query('SELECT n.*,u.full_name recipient_name,u.email recipient_email FROM notifications n JOIN users u ON u.id=n.user_id WHERE n.sent_by=? ORDER BY n.created_at DESC', [req.user.id]));
  }
  return res.json(await query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC', [req.user.id]));
}));
app.patch('/api/notifications/:id/read', auth, asyncRoute(async (req, res) => { await query('UPDATE notifications SET read_at=NOW() WHERE id=? AND user_id=?', [req.params.id, req.user.id]); res.json({ message: 'Notificación marcada como leída' }); }));
app.post('/api/notifications', auth, allow('admin'), asyncRoute(async (req, res) => { const missing = required(req.body, ['user_id', 'type', 'title', 'message']); if (missing.length) return res.status(400).json({ message: `Faltan: ${missing.join(', ')}` }); await notify(req.body.user_id, req.body.type, req.body.title, req.body.message, null, null, req.user.id); res.status(201).json({ message: 'Notificación enviada' }); }));

app.use((error, _req, res, _next) => { console.error(error); res.status(error.code === 'ER_NO_SUCH_TABLE' ? 500 : 500).json({ message: 'Error interno del servidor', detail: process.env.NODE_ENV === 'development' ? error.message : undefined }); });
const port = Number(process.env.PORT || 3001);
Promise.all([ensureAppointmentStatuses(), ensureUrgenciesTable()])
  .then(() => app.listen(port, () => console.log(`Huella API escuchando en http://localhost:${port}`)))
  .catch((error) => { console.error('No se pudo preparar la columna de estados de citas:', error); process.exitCode = 1; });
