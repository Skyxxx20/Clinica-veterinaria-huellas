import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, Bell, CalendarDays, Check, ChevronRight, Clock3, FileText, HeartPulse, LayoutDashboard, LogOut, PawPrint, Plus, Syringe, Users, X } from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const roleNames = { admin: 'Administrador', vet: 'Veterinario', reception: 'Recepcionista', owner: 'Propietario' };
const initial = {
  login: { email: '', password: '' },
  pet: { name: '', species: 'perro', sex: 'macho', breed: '', age_years: '', weight_kg: '' },
  ownerPet: { full_name: '', phone: '', email: '', password: '', pet_name: '', species: 'perro', sex: 'macho', breed: '', age_years: '', weight_kg: '' },
  appointment: { pet_id: '', appt_date: '', appt_time: '', reason: 'Consulta general' },
  reschedule: { appt_date: '', appt_time: '' },
  record: { pet_id: '', visit_date: '', reason: '', diagnosis: '', symptoms: '', treatment: '' },
  prescription: { medical_record_id: '', pet_id: '', medication: '', dose: '', frequency: '', duration_days: '', valid_until: '' },
  vaccine: { pet_id: '', vaccine_name: '', applied_date: '', next_dose_date: '', lot_number: '' },
  notification: { user_id: '', type: 'appointment', title: '', message: '' },
  urgency: { patient_name: '', symptoms: '', owner_email: '' },
  editUser: { id: '', full_name: '', phone: '', email: '' }
};

async function api(path, options = {}) {
  const token = localStorage.getItem('huella_token');
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la operación');
  return data;
}

function Login({ onLogin }) {
  const [form, setForm] = useState(initial.login);
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); setMessage('');
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('huella_token', data.token); onLogin(data.user);
    } catch (error) { setMessage(error.message); }
  }
  return <main className="login"><section className="login-hero"><div className="brand"><PawPrint /><b>huella</b></div><div><span className="eyebrow">CUIDADO SIEMPRE DISPONIBLE</span><h1>Su bienestar es nuestra prioridad, a cualquier hora.</h1><p>Una plataforma para conectar a todo el equipo de Huella con las familias.</p></div></section><form className="login-form" onSubmit={submit}><PawPrint className="logo-icon" /><h2>Bienvenido a Huella</h2><p>Ingresa tus credenciales para acceder a tu espacio.</p><label>Correo electrónico<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Contraseña<input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>{message && <div className="message">{message}</div>}<button className="primary">Ingresar a mi cuenta <span>→</span></button><small>Personal: admin@x.com, veterinario@x.com, recepcionista@x.com · contraseña 123</small></form></main>;
}

function Modal({ title, children, onClose }) { return <div className="overlay"><div className="modal"><button className="close" onClick={onClose}><X /></button><h2>{title}</h2>{children}</div></div>; }
function Field({ label, children }) { return <label>{label}{children}</label>; }

function App() {
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('inicio');
  const [data, setData] = useState({});
  const [modal, setModal] = useState(null);
  const [adminDetail, setAdminDetail] = useState(null);
  const [clinicalDetail, setClinicalDetail] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { const token = localStorage.getItem('huella_token'); if (token) api('/auth/me').then(setUser).catch(() => localStorage.removeItem('huella_token')); }, []);
  const nav = useMemo(() => user?.role === 'owner'
    ? [['inicio', 'Inicio', LayoutDashboard], ['pets', 'Mis mascotas', PawPrint], ['appointments', 'Mis citas', CalendarDays], ['records', 'Historial médico', HeartPulse], ['prescriptions', 'Recetas médicas', FileText], ['notifications', 'Notificaciones', Bell]]
    : user?.role === 'vet'
      ? [['inicio', 'Mis consultas', LayoutDashboard], ['records', 'Historias clínicas', FileText], ['prescriptions', 'Recetas médicas', HeartPulse], ['vaccinations', 'Vacunas', Syringe], ['pets', 'Directorio de pacientes', Users]]
      : user?.role === 'admin'
        ? [['inicio', 'Centro de alertas', Bell], ['notifications', 'Notificaciones', Bell], ['pets', 'Directorio de pacientes', PawPrint]]
        : [['inicio', 'Mi turno', LayoutDashboard], ['appointments', 'Agenda y calendario', CalendarDays], ['waiting', 'Sala de espera', Clock3], ['pets', 'Mascotas', PawPrint], ['users', 'Usuarios', Users]], [user]);
  useEffect(() => {
    if (!user) return;
    const endpoints = { pets: '/pets', appointments: '/appointments', records: '/medical-records', prescriptions: '/prescriptions', vaccinations: '/vaccinations', notifications: '/notifications', users: '/users' };
    const paths = section === 'inicio' && user.role === 'reception'
      ? ['/appointments', '/pets', '/urgencies']
      : section === 'inicio' && user.role === 'admin'
        ? ['/appointments', '/vaccinations', '/users', '/notifications', '/pets']
        : section === 'inicio' && user.role === 'vet'
          ? ['/appointments', '/vaccinations', '/medical-records']
        : section === 'inicio' && user.role === 'owner'
          ? ['/pets', '/appointments', '/vaccinations', '/medical-records', '/prescriptions', '/notifications']
        : section === 'pets' && user.role === 'owner'
          ? ['/pets', '/appointments', '/vaccinations']
        : endpoints[section] ? [endpoints[section]] : [];
    if (paths.length) Promise.all(paths.map(path => api(path))).then(values => {
      const keyForPath = { '/medical-records': 'records', '/appointments': 'appointments', '/vaccinations': 'vaccinations', '/users': 'users', '/pets': 'pets', '/urgencies': 'urgencies' };
      setData(prev => ({ ...prev, ...Object.fromEntries(paths.map((path, index) => [keyForPath[path] || path.slice(1), values[index]])) }));
    }).catch(e => setError(e.message));
  }, [section, user]);
  if (!user) return <Login onLogin={setUser} />;
  function logout() { localStorage.removeItem('huella_token'); setUser(null); }
  async function openModal(type) {
    setError('');
    const needs = type === 'notification' || type === 'pet' ? ['/users'] : type === 'appointment' || type === 'record' || type === 'vaccine' ? ['/pets'] : type === 'prescription' ? ['/medical-records', '/pets'] : [];
    try {
      const values = await Promise.all(needs.map(path => api(path)));
      const keyForPath = { '/medical-records': 'records', '/users': 'users', '/pets': 'pets' };
      setData(prev => ({ ...prev, ...Object.fromEntries(needs.map((path, index) => [keyForPath[path], values[index]])) }));
      setModal(type);
    } catch (e) { setError(e.message); }
  }
  async function save(type, form) {
    const endpoint = type === 'editUser' ? `/users/${form.id}` : { pet: '/pets', ownerPet: '/users', appointment: '/appointments', record: '/medical-records', prescription: '/prescriptions', vaccine: '/vaccinations', notification: '/notifications', urgency: '/urgencies' }[type];
    try {
      await api(endpoint, { method: type === 'editUser' ? 'PATCH' : 'POST', body: JSON.stringify(form) });
      if (type === 'editUser') {
        const users = await api('/users');
        setData(prev => ({ ...prev, users }));
      }
      if (type === 'prescription') {
        const prescriptions = await api('/prescriptions');
        setData(prev => ({ ...prev, prescriptions }));
      }
      if (type === 'record') {
        const records = await api('/medical-records');
        setData(prev => ({ ...prev, records }));
      }
      if (type === 'vaccine') {
        const vaccinations = await api('/vaccinations');
        setData(prev => ({ ...prev, vaccinations }));
      }
      if (type === 'urgency') {
        const urgencies = await api('/urgencies');
        setData(prev => ({ ...prev, urgencies }));
      }
      setModal(null); setSection(type === 'editUser' ? 'users' : type === 'urgency' ? 'inicio' : type === 'pet' || type === 'ownerPet' ? 'pets' : type === 'appointment' ? 'appointments' : type === 'record' ? 'records' : type === 'prescription' ? 'prescriptions' : type === 'vaccine' ? 'vaccinations' : 'notifications');
    }
    catch (e) { setError(e.message); }
  }
  async function updateAppointment(id, status) {
    try { await api(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setData(prev => ({ ...prev, appointments: prev.appointments.map(item => item.id === id ? { ...item, status } : item) })); }
    catch (e) { setError(e.message); }
  }
  async function updateUrgency(id, status) {
    try {
      await api(`/urgencies/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setData(prev => ({ ...prev, urgencies: status === 'open' ? (prev.urgencies || []).map(item => item.id === id ? { ...item, status } : item) : (prev.urgencies || []).filter(item => item.id !== id) }));
    } catch (e) { setError(e.message); }
  }
  async function markNotificationRead(id) {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      setData(prev => ({ ...prev, notifications: (prev.notifications || []).map(item => item.id === id ? { ...item, read_at: new Date().toISOString() } : item) }));
    } catch (e) { setError(e.message); }
  }
  async function rescheduleAppointment(id, form) {
    try {
      await api(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setModal(null);
      setData(prev => ({ ...prev, appointments: prev.appointments.map(item => item.id === id ? { ...item, ...form, status: 'confirmed' } : item) }));
    } catch (e) { setError(e.message); }
  }
  const title = { inicio: user.role === 'owner' ? `Hola, ${user.full_name.split(' ')[0]}.` : `Buenos días, ${user.full_name.split(' ')[0]}.`, pets: 'Directorio de pacientes', appointments: 'Agenda y calendario', waiting: 'Sala de espera', records: 'Historias clínicas', prescriptions: 'Recetas médicas', vaccinations: 'Control de vacunas', notifications: 'Notificaciones', users: 'Usuarios y propietarios' }[section] || 'Huella';
  const modalTitles = { pet: 'Registrar mascota', ownerPet: 'Registrar usuario', editUser: 'Editar propietario', appointment: 'Programar nueva cita', record: 'Crear historia clínica', prescription: 'Nueva receta médica', vaccine: 'Registrar vacuna', notification: 'Crear notificación', urgency: 'Registrar urgencia', reschedule: 'Reprogramar cita' };
  const modalType = modal && typeof modal === 'object' ? modal.type : modal;
  const modalAppointment = modal && typeof modal === 'object' ? modal.appointment : null;
  const modalUser = modal && typeof modal === 'object' ? modal.user : null;
  const vetView = user.role === 'vet' && { records: <VetRecords data={data} onDetail={item => setClinicalDetail({ section: 'records', item })} onOpen={openModal} />, prescriptions: <VetPrescriptions data={data} onDetail={item => setClinicalDetail({ section: 'prescriptions', item })} onOpen={openModal} />, vaccinations: <VetVaccinations data={data} onOpen={openModal} />, pets: <VetPatients data={data} onDetail={item => setClinicalDetail({ section: 'records', item })} /> }[section];
  return <div className="app"><aside><div className="brand"><PawPrint /><div><b>huella</b><small>Clínica veterinaria</small></div></div><span className="nav-title">{user.role === 'owner' ? 'MI CUENTA' : 'GESTIÓN'}</span>{nav.map(([id, label, Icon]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}><Icon />{label}</button>)}<div className="support"><b>Soporte 24/7</b><p>Estamos aquí cuando nos necesites.</p></div><button className="profile" onClick={logout}><span>{user.full_name.slice(0, 2).toUpperCase()}</span><div><b>{user.full_name}</b><small>{roleNames[user.role]}</small></div><LogOut size={16} /></button></aside><main className="content"><header><div className="header-user"><span className="online">● Abierto 24/7</span>{user.role === 'admin' && <button className="primary small" onClick={() => openModal('notification')}><Plus size={16} /> Nueva alerta</button>}{user.role === 'reception' && <button className="primary small" onClick={() => openModal(section === 'pets' ? 'pet' : 'appointment')}><Plus size={16} /> {section === 'pets' ? 'Registrar mascota' : 'Registrar cita'}</button>}{user.role === 'owner' && <button className="primary small" onClick={() => openModal('appointment')}><Plus size={16} /> Agendar cita</button>}</div></header>{!(user.role === 'owner' && section === 'inicio') && <div className="page-heading"><div><h1>{title}</h1><p>{user.role === 'admin' ? 'Envía avisos de citas y vacunas a las familias de Huella.' : user.role === 'reception' ? 'Gestiona las llegadas, llamadas y citas del turno actual.' : user.role === 'vet' ? 'Consulta pacientes y mantén su información clínica al día.' : 'Gestiona la información de Huella de forma segura y conectada.'}</p></div><span className="date"><CalendarDays size={16} /> {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>}{error && <div className="error">{error}</div>}<section className="dashboard">{section === 'inicio' ? <Home user={user} data={data} onOpen={openModal} onNavigate={setSection} onStatus={updateAppointment} onUrgencyStatus={updateUrgency} onAdminDetail={setAdminDetail} /> : vetView || user.role === 'owner' && section === 'pets' ? (vetView || <OwnerPets data={data} />) : user.role === 'owner' && section === 'records' ? <OwnerRecords data={data} onDetail={item => setClinicalDetail({ section, item })} /> : user.role === 'owner' && section === 'prescriptions' ? <OwnerPrescriptions data={data} onDetail={item => setClinicalDetail({ section, item })} /> : user.role === 'owner' && section === 'notifications' ? <OwnerNotifications data={data} onDetail={item => setClinicalDetail({ section, item })} onRead={markNotificationRead} /> : user.role === 'reception' && section === 'waiting' ? <WaitingRoom appointments={(data.appointments || []).filter(item => item.status === 'waiting')} onStatus={updateAppointment} /> : user.role === 'reception' && section === 'pets' ? <ReceptionPets data={data} onDetail={item => setClinicalDetail({ section: 'pets', item })} />   : user.role === 'admin' && section === 'notifications' ? <AdminNotifications data={data} onDetail={item => setClinicalDetail({ section: 'notifications', item })} onOpen={openModal} />   : user.role === 'admin' && section === 'pets' ? <ReceptionPets data={data} actionLabel="Ver ficha" onDetail={item => setClinicalDetail({ section: 'pets', item })} /> : user.role === 'reception' && section === 'users' ? <ReceptionUsers data={data} onEdit={item => setModal({ type: 'editUser', user: item })} onOpen={openModal} /> : <List section={section} data={data[section] || []} user={user} onOpen={openModal} onStatus={updateAppointment} onReschedule={(item) => setModal({ type: 'reschedule', appointment: item })} onDetail={(item) => setClinicalDetail({ section, item })} />}</section></main>{modal && <Modal title={modalTitles[modalType]} onClose={() => setModal(null)}><Form type={modalType} data={data} user={user} editUser={modalUser} appointment={modalAppointment} onSave={modalType === 'reschedule' ? (type, form) => rescheduleAppointment(modalAppointment.id, form) : save} error={error} /></Modal>}{adminDetail && <Modal title={adminDetail.title} onClose={() => setAdminDetail(null)}>{adminDetail.type === 'notification' ? <NotificationDetail item={adminDetail.item} /> : <AdminDetail type={adminDetail.type} data={data} />}</Modal>}{clinicalDetail && <Modal title={clinicalDetail.section === 'records' ? 'Historia clínica' : clinicalDetail.section === 'prescriptions' ? 'Receta médica' : clinicalDetail.section === 'pets' ? 'Ficha de mascota' : 'Notificación'} onClose={() => setClinicalDetail(null)}>{clinicalDetail.section === 'notifications' ? <NotificationDetail item={clinicalDetail.item} /> : clinicalDetail.section === 'pets' ? <PetDetail item={clinicalDetail.item} /> : <ClinicalDetail section={clinicalDetail.section} item={clinicalDetail.item} />}</Modal>}</div>;
}

const statusLabels = { pending: 'Pendiente', confirmed: 'Confirmada', arrived: 'Paciente llegó', waiting: 'En sala de espera', completed: 'Atendido', cancelled: 'Cancelada' };
function Home({ user, data, onOpen, onNavigate, onStatus, onUrgencyStatus, onAdminDetail }) {
  if (user.role === 'admin') {
    const today = localDateValue();
    const pendingAppointments = (data.appointments || []).filter(item => item.status === 'pending').length;
    const pendingVaccinations = (data.vaccinations || []).filter(item => item.next_dose_date && item.next_dose_date <= today).length;
    const pendingAlerts = pendingAppointments + pendingVaccinations;
    const notifications = data.notifications || [];
    return <><div className="cards admin-metrics"><MetricCard icon={Bell} title="Alertas pendientes" value={pendingAlerts} onClick={() => onAdminDetail({ type: 'alerts', title: 'Alertas pendientes' })} /><MetricCard icon={PawPrint} title="Vacunas próximas" value={pendingVaccinations} onClick={() => onAdminDetail({ type: 'vaccinations', title: 'Vacunas próximas' })} /><MetricCard icon={CalendarDays} title="Citas por confirmar" value={pendingAppointments} onClick={() => onAdminDetail({ type: 'appointments', title: 'Citas por confirmar' })} /><MetricCard icon={Users} title="Familias alcanzadas" value={`${(data.users || []).length}`} onClick={() => onAdminDetail({ type: 'users', title: 'Familias alcanzadas' })} /></div><div className="admin-alert-grid"><div className="panel admin-notifications-panel"><div className="panel-head"><div><h2>Notificaciones enviadas</h2><p>Avisos de citas y vacunas para las familias</p></div><button className="primary small" onClick={() => onOpen('notification')}><Plus size={16} /> Crear alerta</button></div>{notifications.length ? <div className="admin-notification-list">{    notifications.slice(0, 5).map((item, index) => { const Icon = item.type === 'vaccine' ? Syringe : item.type === 'appointment' ? CalendarDays : Bell; return <button className="admin-notification-row" key={item.id} onClick={() => onAdminDetail({ type: 'notification', title: item.title || 'Notificación', item })}><span className={`notification-icon notification-${item.type || 'general'}`}><Icon size={17} /></span><span><b>{item.title || 'Notificación'}</b><small>{item.recipient_name || item.recipient_email || 'Familia Huella'} · {item.message || ''}</small></span>    <em>{item.type === 'vaccine' ? 'Vacuna' : 'Cita'}</em></button>})}</div> : <div className="empty">No hay notificaciones enviadas.</div>}</div></div></>;
  }
  if (user.role === 'vet') {
    const today = localDateValue();
    const appointments = [...(data.appointments || [])]
      .filter(item => item.appt_date === today)
      .sort((a, b) => `${a.appt_date} ${a.appt_time}`.localeCompare(`${b.appt_date} ${b.appt_time}`));
    const pendingAppointments = appointments.filter(item => item.status === 'pending');
    const pendingGeneral = pendingAppointments.filter(item => (item.reason || '').toLowerCase().includes('general'));
    const todayVaccinations = (data.vaccinations || []).filter(item => item.applied_date === today);
    const nextPatient = appointments.find(item => !['completed', 'cancelled'].includes(item.status));
    return <><div className="cards vet-metrics"><MetricCard icon={CalendarDays} title="Consultas de hoy" value={appointments.length} onClick={() => onNavigate('appointments')} /><MetricCard icon={Clock3} title="Próximo paciente" value={nextPatient ? `${nextPatient.pet_name} · ${String(nextPatient.appt_time).slice(0, 5)}` : 'Ninguno'} onClick={() => onNavigate('appointments')} /><MetricCard icon={FileText} title="Historias pendientes" value={pendingGeneral.length} onClick={() => onNavigate('records')} /><MetricCard icon={Syringe} title="Vacunas del día" value={todayVaccinations.length} onClick={() => onNavigate('vaccinations')} /></div><div className="panel agenda-panel"><div className="panel-head"><div><h2>Citas del día</h2><p>{appointments.length} consultas programadas para hoy</p></div><button className="link" onClick={() => onNavigate('appointments')}>Ver agenda <ChevronRight size={15} /></button></div><AppointmentRows appointments={appointments} onStatus={onStatus} /></div></>;
  }
  if (user.role === 'owner') return <OwnerHome user={user} data={data} onOpen={onOpen} onNavigate={onNavigate} />;
  if (user.role !== 'reception') return <><div className="cards"><Card icon={CalendarDays} title="Citas próximas" value="Consulta tu agenda" /><Card icon={PawPrint} title="Mascotas registradas" value="Gestiona sus perfiles" /><Card icon={Bell} title="Notificaciones" value="Revisa los avisos" /><Card icon={HeartPulse} title="Atención Huella" value="Información actualizada" /></div><div className="panel welcome"><h2>{user.role === 'owner' ? 'Todo lo que necesitas para cuidar la salud de tus mascotas.' : 'Panel operativo Huella'}</h2><p>Usa el menú para consultar y registrar información directamente en la base de datos.</p></div></>;
  const appointments = [...(data.appointments || [])].sort((a, b) => `${a.appt_date} ${a.appt_time}`.localeCompare(`${b.appt_date} ${b.appt_time}`));
  const today = localDateValue();
  const todayAppointments = appointments.filter(item => item.appt_date === today);
  const waiting = appointments.filter(item => item.status === 'waiting').length;
  const pendingCalls = appointments.filter(item => item.request_type && item.status !== 'cancelled').length;
  const urgencies = data.urgencies || [];
  return <><div className="cards reception-metrics"><MetricCard icon={CalendarDays} title="Citas del turno" value={todayAppointments.length} onClick={() => onNavigate('appointments')} /><MetricCard icon={Clock3} title="En sala de espera" value={waiting} onClick={() => onNavigate('waiting')} /><MetricCard icon={Bell} title="Llamadas pendientes" value={pendingCalls} onClick={() => onNavigate('appointments')} /><MetricCard icon={Plus} title="Registros nuevos" value={(data.pets || []).length} onClick={() => onNavigate('pets')} /></div><div className="home-grid"><div className="panel agenda-panel"><div className="panel-head"><div><h2>Agenda y llegadas</h2><p>Registra pacientes conforme llegan a la clínica</p></div><button className="link" onClick={() => onNavigate('appointments')}>Agenda completa <ChevronRight size={15} /></button></div><div className="rows">{urgencies.map(item => <UrgencyRow key={`urgency-${item.id}`} urgency={item} onStatus={onUrgencyStatus} />)}<AppointmentRows appointments={todayAppointments.slice(0, 5)} onStatus={onStatus} reception /></div></div><div className="side-stack"><div className="urgency-card"><span><AlertTriangle size={14} /> URGENCIAS 24/7</span><h2>Ingreso prioritario</h2><p>Registra rápidamente una emergencia y alerta al equipo veterinario.</p><button className="light-button" onClick={() => onOpen('urgency')}>Registrar urgencia <ChevronRight size={15} /></button></div><div className="panel waiting-card"><div className="panel-head"><div><h2>Próximo en atención</h2><p>Sala de espera</p></div></div>{appointments.find(item => item.status === 'waiting') ? <AppointmentRow appointment={appointments.find(item => item.status === 'waiting')} onStatus={onStatus} reception /> : <div className="empty compact">No hay pacientes esperando.</div>}</div></div></div></>;
}
function OwnerHome({ user, data, onOpen, onNavigate }) {
  const today = localDateValue();
  const pets = data.pets || [];
  const pet = pets[0];
  const appointments = (data.appointments || []).filter(item => !['completed', 'cancelled'].includes(item.status)).sort((a, b) => `${a.appt_date} ${a.appt_time}`.localeCompare(`${b.appt_date} ${b.appt_time}`));
  const nextAppointment = appointments[0];
  const vaccinations = data.vaccinations || [];
  const dueVaccinations = vaccinations.filter(item => item.next_dose_date && item.next_dose_date >= today).sort((a, b) => a.next_dose_date.localeCompare(b.next_dose_date));
  const completedVaccinations = vaccinations.filter(item => item.applied_date && item.applied_date <= today).length;
  const healthProgress = vaccinations.length ? Math.min(100, Math.round((completedVaccinations / vaccinations.length) * 100)) : 0;
  const petLabel = pets.length > 1 ? `${pets.length} mascotas` : pet ? pet.name : 'tus mascotas';
  return <div className="owner-home"><div className="owner-welcome"><div><h2>Hola, {user.full_name.split(' ')[0]}.</h2><p>Todo lo que necesitas para cuidar la salud de tus mascotas.</p></div><span className="date"><CalendarDays size={16} /> {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div><div className="owner-hero"><div className="owner-hero-copy"><span><HeartPulse size={15} /> TODO AL DÍA</span><h1>La salud de {petLabel}, siempre contigo.</h1><p>Consulta sus vacunas, próximas citas y recomendaciones del equipo veterinario.</p><button className="light-button" onClick={() => onOpen('appointment')}><CalendarDays size={16} /> Agendar una cita</button></div><div className="owner-hero-pet"><b>{pet?.name || 'Tus mascotas'}</b><small>{pet ? `${pet.species || 'Mascota'}${pet.breed ? ` · ${pet.breed}` : ''}` : 'Consulta sus perfiles'}</small></div></div><div className="owner-panels"><div className="panel owner-appointment"><div className="panel-head"><div><h2>Próxima cita</h2><p>{nextAppointment ? (statusLabels[nextAppointment.status] || 'Pendiente') : 'No tienes citas programadas'}</p></div>{nextAppointment && <span className="owner-date-badge">{new Date(`${nextAppointment.appt_date}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>}</div>{nextAppointment ? <div className="owner-appointment-detail"><div className="owner-day">{new Date(`${nextAppointment.appt_date}T12:00:00`).getDate()}</div><div><b>{nextAppointment.reason || 'Consulta general'} de {nextAppointment.pet_name}</b><small>{String(nextAppointment.appt_time).slice(0, 5)} · {nextAppointment.vet_name ? `Dr. ${nextAppointment.vet_name}` : 'Clínica Huella'}</small></div></div> : <div className="empty compact">Agenda una cita para tu mascota.</div>}<div className="owner-panel-actions"><button onClick={() => onNavigate('appointments')}>Ver mis citas</button><button onClick={() => onNavigate('appointments')}>Añadir al calendario</button></div></div><div className="panel health-panel"><div className="panel-head"><div><h2>Plan de salud</h2><p>Progreso de vacunas</p></div><strong>{healthProgress}%</strong></div><div className="progress-track"><span style={{ width: `${healthProgress}%` }} /></div><div className="health-items"><div><span className={completedVaccinations ? 'done' : ''}>●</span><b>Vacunas registradas</b><small>{completedVaccinations ? 'Completadas' : 'Pendientes'}</small></div><div><span className={pets.length ? 'done' : ''}>●</span><b>Mascotas registradas</b><small>{pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'}</small></div><div><span>○</span><b>Próxima vacuna</b><small>{dueVaccinations[0]?.next_dose_date || 'Por programar'}</small></div></div></div><div className="panel reminders-panel"><div className="panel-head"><div><h2>Recordatorios</h2><p>Recomendaciones para tus mascotas</p></div></div><button className="reminder-row" onClick={() => onNavigate('vaccinations')}><span className="reminder-icon vaccine"><Syringe size={19} /></span><span><b>{dueVaccinations[0] ? `Próxima vacuna: ${dueVaccinations[0].vaccine_name}` : 'Revisar vacunas'}</b><small>{dueVaccinations[0] ? `${dueVaccinations[0].pet_name || petLabel} · ${dueVaccinations[0].next_dose_date}` : 'Consulta el estado de vacunación'}</small></span><ChevronRight size={17} /></button><button className="reminder-row" onClick={() => onNavigate('pets')}><span className="reminder-icon pet"><PawPrint size={19} /></span><span><b>Mis mascotas</b><small>{pets.length} perfiles registrados</small></span><ChevronRight size={17} /></button></div></div></div>;
}
function OwnerPets({ data }) {
  const pets = data.pets || [];
  const appointments = data.appointments || [];
  const vaccinations = data.vaccinations || [];
  const nextCare = (pet) => {
    const appointment = appointments.filter(item => item.pet_id === pet.id && !['completed', 'cancelled'].includes(item.status)).sort((a, b) => `${a.appt_date} ${a.appt_time}`.localeCompare(`${b.appt_date} ${b.appt_time}`))[0];
    const vaccine = vaccinations.filter(item => item.pet_id === pet.id && item.next_dose_date).sort((a, b) => a.next_dose_date.localeCompare(b.next_dose_date))[0];
    if (!appointment && !vaccine) return { label: 'Sin cuidados programados', date: '' };
    if (!vaccine || appointment?.appt_date <= vaccine.next_dose_date) return { label: appointment.reason || 'Consulta', date: appointment.appt_date };
    return { label: vaccine.vaccine_name, date: vaccine.next_dose_date };
  };
  return <div className="owner-pets-page"><div className="owner-pets-heading"><div><h1>Mis mascotas</h1><p>Perfiles de salud vinculados a tu cuenta</p></div><span>{pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'}</span></div>{pets.length ? <div className="owner-pet-grid">{pets.map((pet, index) => { const care = nextCare(pet); return <div className="owner-pet-card" key={pet.id}><div className={`owner-pet-avatar pet-color-${index % 3}`}>{pet.name.slice(0, 2).toUpperCase()}</div><div className="owner-pet-info"><b>{pet.name}</b><small>{pet.species || 'Mascota'}{pet.breed ? ` · ${pet.breed}` : ''}{pet.age_years ? ` · ${pet.age_years} años` : ''}</small><button onClick={() => {}}>Ver perfil <ChevronRight size={14} /></button></div><div className="owner-pet-care"><small>PRÓXIMO CUIDADO</small><b>{care.label}</b>{care.date && <span>{dateLabel(care.date)}</span>}</div></div>; })}</div> : <div className="empty">No tienes mascotas registradas.</div>}</div>;
}
function OwnerRecords({ data, onDetail }) {
  const records = data.records || [];
  return <div className="owner-records-page"><div className="owner-records-heading"><div><h1>Historias clínicas</h1><p>Registros compartidos por el equipo veterinario</p></div><span>Al día</span></div>{records.length ? <div className="owner-record-list">{records.map(record => { const date = new Date(`${record.visit_date}T12:00:00`); return <div className="owner-record-row" key={record.id}><div className="owner-record-date"><b>{date.getDate().toString().padStart(2, '0')}</b><small>{date.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '').toUpperCase()}</small><em>{date.getFullYear()}</em></div><div className="owner-record-main"><b>{record.pet_name} · {record.vet_name || 'Equipo veterinario'}</b><strong>{record.reason || 'Consulta veterinaria'}</strong><p>{record.diagnosis || record.treatment || record.symptoms || 'Registro clínico disponible.'}</p></div><button className="outline-action" onClick={() => onDetail(record)}>Ver detalle</button></div>; })}</div> : <div className="empty">No hay historias clínicas registradas.</div>}</div>;
}
function OwnerPrescriptions({ data, onDetail }) {
  const prescriptions = data.prescriptions || [];
  const active = prescriptions.filter(item => !item.valid_until || item.valid_until >= localDateValue()).length;
  return <div className="owner-prescriptions-page"><div className="owner-prescriptions-heading"><div><h1>Recetas de mis mascotas</h1><p>Prescripciones vigentes y anteriores</p></div><span>{active} vigentes</span></div>{prescriptions.length ? <div className="owner-prescription-grid">{prescriptions.map(prescription => <div className="owner-prescription-card" key={prescription.id}><div className="prescription-icon"><FileText size={20} /></div><small>RECETA · {prescription.pet_name || 'Mascota'}</small><h2>{prescription.medication}</h2><p>{prescription.dose} · {prescription.frequency} · {prescription.duration_days} días</p><div className="prescription-footer"><span>{prescription.vet_name ? `Dr. ${prescription.vet_name}` : 'Equipo veterinario'} · Vigente hasta {prescription.valid_until || 'sin fecha'}</span><button onClick={() => onDetail(prescription)}>Ver receta</button></div></div>)}</div> : <div className="empty">No hay recetas médicas registradas.</div>}</div>;
}
function OwnerNotifications({ data, onDetail, onRead }) {
  const notifications = data.notifications || [];
  const unread = notifications.filter(item => !item.read_at).length;
  const iconFor = type => type === 'vaccine' ? Syringe : type === 'appointment' ? CalendarDays : Bell;
  return <div className="owner-notifications-page"><div className="owner-notifications-heading"><div><h1>Notificaciones</h1><p>Avisos enviados por la administración de Huella</p></div><span>{unread} sin leer</span></div>{notifications.length ? <div className="owner-notification-list">{notifications.map(item => { const Icon = iconFor(item.type); return <div className={`owner-notification-row ${item.read_at ? 'read' : 'unread'}`} key={item.id} onClick={() => onDetail(item)} role="button" tabIndex="0" onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onDetail(item); }}><div className={`notification-icon notification-${item.type || 'general'}`}><Icon size={19} /></div><div className="owner-notification-main"><b>{(item.type || 'general').toUpperCase()} · ADMINISTRACIÓN HUELLA</b><strong>{item.title}</strong><small>{item.message}</small></div>{!item.read_at && <i className="notification-unread-dot" />}{!item.read_at && <button onClick={event => { event.stopPropagation(); onRead(item.id); }}>Marcar como leída</button>}</div>; })}</div> : <div className="empty">No tienes notificaciones.</div>}</div>;
}
function Card({ icon: Icon, title, value }) { return <div className="card"><Icon /><span>{title}</span><strong>{value}</strong></div>; }
function MetricCard({ icon: Icon, title, value, onClick }) { return <button className="card metric-card" onClick={onClick}><Icon /><span>{title}</span><strong>{value}</strong><ChevronRight /></button>; }
function AdminDetail({ type, data }) {
  const today = localDateValue();
  const appointments = (data.appointments || []).filter(item => item.status === 'pending');
  const vaccinations = (data.vaccinations || []).filter(item => item.next_dose_date && item.next_dose_date <= today);
  const rows = type === 'users' ? (data.users || []).map(item => ({ title: item.full_name, detail: item.email })) : type === 'vaccinations' ? vaccinations.map(item => ({ title: item.vaccine_name, detail: `${item.pet_name || 'Mascota'} · próxima dosis: ${item.next_dose_date}` })) : appointments.map(item => ({ title: item.pet_name || 'Mascota', detail: `${item.owner_name || 'Propietario'} · ${item.appt_date} ${String(item.appt_time).slice(0, 5)}` }));
  const alertRows = type === 'alerts' ? [...appointments.map(item => ({ title: item.pet_name || 'Cita pendiente', detail: `Cita · ${item.appt_date} ${String(item.appt_time).slice(0, 5)}` })), ...vaccinations.map(item => ({ title: item.vaccine_name, detail: `Vacuna · ${item.pet_name || 'Mascota'} · ${item.next_dose_date}` }))] : rows;
  return alertRows.length ? <div className="detail-list">{alertRows.map((item, index) => <div className="detail-item" key={`${item.title}-${index}`}><div className="avatar">{item.title.slice(0, 2).toUpperCase()}</div><div><b>{item.title}</b><small>{item.detail}</small></div></div>)}</div> : <div className="empty compact">No hay registros pendientes.</div>;
}
function AppointmentRows({ appointments, onStatus, reception = false }) { return appointments.length ? <div className="rows">{appointments.map((item, index) => <AppointmentRow key={item.id} appointment={item} index={index} onStatus={onStatus} reception={reception} />)}</div> : <div className="empty">No hay citas para hoy.</div>; }
function AppointmentRow({ appointment, index = 0, onStatus, reception = false }) {
  const time = String(appointment.appt_time).slice(0, 5);
  const canRegisterArrival = reception && ['pending', 'confirmed'].includes(appointment.status);
  return <div className="row appointment-row"><time><b>{time}</b><small>{Number(time.slice(0, 2)) >= 12 ? 'PM' : 'AM'}</small></time><div className={`avatar patient-color-${index % 4}`}>{(appointment.pet_name || 'P').slice(0, 2).toUpperCase()}</div><div className="row-main"><b>{appointment.pet_name || 'Paciente'}</b><small>{appointment.reason || 'Consulta general'} · {appointment.species || 'Mascota'}</small></div><div className="appointment-owner"><small>PROPIETARIO</small><b>{appointment.owner_name || 'Propietario'}</b></div>{canRegisterArrival ? <button className="arrival-action" onClick={() => onStatus(appointment.id, 'arrived')}>Registrar llegada</button> : <select aria-label={`Estado de la cita de ${appointment.pet_name || 'paciente'}`} className={`status status-${appointment.status}`} value={appointment.status} onChange={e => onStatus(appointment.id, e.target.value)}><option value="pending">Pendiente</option><option value="confirmed">Confirmada</option><option value="arrived">Paciente llegó</option><option value="waiting">Sala de espera</option><option value="completed">Atendido</option><option value="cancelled">Cancelada</option></select>}<span className="appointment-arrow"><ChevronRight size={16} /></span></div>;
}
function WaitingRoom({ appointments, onStatus }) {
  return <div className="panel waiting-room-panel"><div className="panel-head"><div><h2>Sala de espera</h2><p>Pacientes registrados para atención</p></div><span className="count-badge warning">{appointments.length} esperando</span></div>{appointments.length ? <div className="waiting-room-list">{appointments.map((item, index) => <div className="waiting-room-row" key={item.id}><time><b>{String(item.appt_time).slice(0, 5)}</b><small>{Number(String(item.appt_time).slice(0, 2)) >= 12 ? 'PM' : 'AM'}</small></time><div className={`avatar patient-color-${index % 4}`}>{(item.pet_name || 'P').slice(0, 2).toUpperCase()}</div><div className="row-main"><b>{item.pet_name || 'Paciente'}</b><small>{item.reason || 'Consulta general'} · {item.species || 'Mascota'}</small></div><div className="appointment-owner"><small>PROPIETARIO</small><b>{item.owner_name || 'Propietario'}</b></div><button className="waiting-action" onClick={() => onStatus(item.id, 'arrived')}>Registrar llegada</button><span className="appointment-arrow"><ChevronRight size={16} /></span></div>)}</div> : <div className="empty">No hay pacientes en sala de espera.</div>}</div>;
}
function ReceptionPets({ data, onDetail, actionLabel = 'Ver ficha' }) {
  const pets = data.pets || [];
  return <div className="panel reception-pets-panel"><div className="panel-head"><div><h2>Directorio de pacientes</h2><p>{pets.length} mascotas encontradas · Datos actualizados</p></div><span className="count-badge">Datos actualizados</span></div>{pets.length ? <div className="reception-pets-grid">{pets.map((pet, index) => <div className="reception-pet-card" key={pet.id}><span className={`avatar patient-color-${index % 4}`}>{(pet.name || 'P').slice(0, 2).toUpperCase()}</span><span className="reception-pet-info"><b>{pet.name}</b><small>{pet.species || 'Mascota'} · {pet.age_years || 0} años</small></span><span className="reception-pet-owner"><small>PROPIETARIO</small><b>{pet.owner_name || 'Sin propietario'}</b><small>{pet.owner_phone || pet.owner_email || 'Sin contacto'}</small></span><button className="outline-action" onClick={() => onDetail(pet)} aria-label={`${actionLabel} de ${pet.name}`}>{actionLabel} <ChevronRight size={14} /></button></div>)}</div> : <div className="empty">No hay mascotas registradas.</div>}</div>;
}
function UrgencyRow({ urgency, onStatus }) { return <div className="row urgency-row"><div className="urgency-marker"><AlertTriangle size={16} /></div><div className="row-main"><b><span className="priority-label">PRIORIDAD</span> {urgency.patient_name}</b><small>{urgency.symptoms}{urgency.owner_email ? ` · ${urgency.owner_email}` : ''}</small></div><select className="status status-urgency" value={urgency.status || 'open'} onChange={event => onStatus(urgency.id, event.target.value)} aria-label={`Estado de la urgencia de ${urgency.patient_name}`}><option value="open">Urgencia</option><option value="attended">Atendido</option></select></div>; }

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function dateLabel(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
}
function addDays(value, amount) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return localDateValue(date);
}
function CalendarAgenda({ appointments, onStatus, onReschedule, owner = false }) {
  const [selectedDate, setSelectedDate] = useState(localDateValue());
  const days = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() - date.getDay() + index + 1);
    return localDateValue(date);
  });
  const selectedAppointments = appointments.filter(item => item.appt_date === selectedDate);
  return <div className="calendar-agenda"><div className="calendar-top"><div><h2>{owner ? 'Mis citas' : `Agenda · ${dateLabel(selectedDate)}`}</h2><p>{owner ? 'Consulta y gestiona tus próximas visitas' : `Vista diaria · ${selectedAppointments.length} ${selectedAppointments.length === 1 ? 'cita' : 'citas'} programadas`}</p></div><div className="calendar-controls"><button onClick={() => setSelectedDate(localDateValue())}>Hoy</button><button onClick={() => setSelectedDate(addDays(selectedDate, -7))} aria-label="Semana anterior">‹</button><button onClick={() => setSelectedDate(addDays(selectedDate, 7))} aria-label="Semana siguiente">›</button></div></div><div className="calendar-days">{days.map(value => { const date = new Date(`${value}T12:00:00`); const active = value === selectedDate; return <button className={`calendar-day ${active ? 'active' : ''}`} key={value} onClick={() => setSelectedDate(value)}><small>{date.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '').toUpperCase()}</small><b>{date.getDate()}</b></button>; })}</div><div className="calendar-rows">{selectedAppointments.length ? selectedAppointments.map((item, index) => <CalendarAppointment key={item.id} appointment={item} index={index} onStatus={onStatus} onReschedule={onReschedule} owner={owner} />) : <div className="empty">No hay citas para el {dateLabel(selectedDate)}.</div>}</div></div>;
}
function CalendarAppointment({ appointment, index, onStatus, onReschedule, owner = false }) {
  const colors = ['mint', 'blue', 'orange', 'purple'];
  if (owner) {
    const date = new Date(`${appointment.appt_date}T12:00:00`);
    return <div className="owner-calendar-appointment"><div className="owner-appointment-date"><b>{date.getDate()}</b><small>{date.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '').toUpperCase()}</small></div><div className="owner-calendar-main"><b>{appointment.pet_name}</b><strong>{appointment.reason || 'Consulta general'}</strong><small>{String(appointment.appt_time).slice(0, 5)} · {appointment.vet_name ? `Dr. ${appointment.vet_name}` : 'Clínica Huella'}</small></div><span className={`status-badge status-${appointment.status}`}>{statusLabels[appointment.status] || 'Pendiente'}</span><button className="outline-action" onClick={() => onReschedule(appointment)}>Pedir reprogramar</button><button className="cancel-action" onClick={() => onStatus(appointment.id, 'cancelled')}>Pedir cancelar</button></div>;
  }
  return <div className="calendar-appointment"><time>{String(appointment.appt_time).slice(0, 5)}</time><span className={`appointment-line ${colors[index % colors.length]}`} /><div className={`calendar-avatar ${colors[index % colors.length]}`}>{(appointment.pet_name || 'P').slice(0, 2).toUpperCase()}</div><div className="calendar-patient"><b>{appointment.pet_name}</b><small>{appointment.reason || 'Consulta general'} · {appointment.owner_name || 'Propietario'}</small></div><div className="appointment-status-slot"><span className={`status-badge status-${appointment.status}`}>{statusLabels[appointment.status] || 'Pendiente'}</span></div><button className="outline-action" onClick={() => onReschedule(appointment)}>Reprogramar</button><button className="cancel-action" onClick={() => onStatus(appointment.id, 'cancelled')}>Cancelar</button></div>;
}

function VetRecords({ data, onDetail, onOpen }) {
  const records = data.records || [];
  return <div className="panel vet-list-panel"><div className="panel-head"><div><h2>Historias clínicas</h2><p>Registros médicos recientes</p></div><div className="panel-head-actions"><span className="count-badge">{records.length} registros</span><button className="primary small" onClick={() => onOpen('record')}><Plus size={15} /> Nueva historia</button></div></div>{records.length ? <div className="vet-record-list">{records.map(item => <button className="vet-record-row" key={item.id} onClick={() => onDetail(item)}><span className="record-date"><b>{new Date(`${item.visit_date}T12:00:00`).getDate()}</b><small>{new Date(`${item.visit_date}T12:00:00`).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '').toUpperCase()}</small><small>{new Date(`${item.visit_date}T12:00:00`).getFullYear()}</small></span><span className="vet-record-main"><b>{item.pet_name} · {item.owner_name || 'Propietario'}</b><strong>{item.reason || 'Consulta general'}</strong><small>{item.diagnosis || item.treatment || 'Sin observaciones adicionales.'}</small></span><span className="row-action">Ver detalle <ChevronRight size={15} /></span></button>)}</div> : <div className="empty">No hay historias clínicas registradas.</div>}</div>;
}

function VetPrescriptions({ data, onDetail, onOpen }) {
  const prescriptions = data.prescriptions || [];
  return <div className="panel vet-list-panel"><div className="panel-head"><div><h2>Recetas y prescripciones</h2><p>Indicaciones emitidas recientemente</p></div><div className="panel-head-actions"><span className="count-badge">{prescriptions.length} recetas</span><button className="primary small" onClick={() => onOpen('prescription')}><Plus size={15} /> Nueva receta</button></div></div>{prescriptions.length ? <div className="vet-prescription-grid">{prescriptions.map(item => <button className="vet-prescription-card" key={item.id} onClick={() => onDetail(item)}><span className="prescription-icon"><FileText size={20} /></span><small>PRESCRIPCIÓN · {item.pet_name}</small><strong>{item.medication || 'Medicamento'}</strong><p>{item.dose || 'Dosis no indicada'} · {item.frequency || 'Frecuencia no indicada'}</p><span className="row-action">Ver receta <ChevronRight size={15} /></span></button>)}</div> : <div className="empty">No hay recetas médicas registradas.</div>}</div>;
}

function VetVaccinations({ data, onOpen }) {
  const vaccinations = data.vaccinations || [];
  const today = localDateValue();
  const pending = vaccinations.filter(item => item.next_dose_date && item.next_dose_date >= today).length;
  return <div className="panel vet-list-panel"><div className="panel-head"><div><h2>Control de vacunas</h2><p>Aplicaciones y próximos refuerzos</p></div><div className="panel-head-actions"><span className="count-badge warning">{pending} próximas</span><button className="primary small" onClick={() => onOpen('vaccine')}><Plus size={15} /> Registrar vacuna</button></div></div>{vaccinations.length ? <div className="vet-vaccine-list">{vaccinations.map(item => <div className="vet-vaccine-row" key={item.id}><span className="avatar">{(item.pet_name || 'P').slice(0, 2).toUpperCase()}</span><span className="vaccine-pet"><b>{item.pet_name}</b><small>{item.vaccine_name || 'Vacuna'}</small></span><span><small>ÚLTIMA DOSIS</small><b>{item.applied_date || 'Sin registro'}</b></span><span><small>PRÓXIMA DOSIS</small><b>{item.next_dose_date || 'Por programar'}</b></span><button className="outline-action" onClick={() => onOpen('vaccine')}>Registrar dosis</button></div>)}</div> : <div className="empty">No hay vacunas registradas.</div>}</div>;
}

function VetPatients({ data, onDetail }) {
  const pets = data.pets || [];
  return <div className="panel vet-list-panel"><div className="panel-head"><div><h2>Directorio de pacientes</h2><p>{pets.length} mascotas encontradas · Datos actualizados</p></div><span className="count-badge">Datos actualizados</span></div>{pets.length ? <div className="vet-patient-grid">{pets.map((item, index) => <div className="vet-patient-card" key={item.id}><span className={`avatar patient-color-${index % 4}`}>{(item.name || 'P').slice(0, 2).toUpperCase()}</span><span><b>{item.name}</b><small>{item.species || 'Mascota'} · {item.age_years || 0} años</small></span><span className="patient-owner"><small>PROPIETARIO</small><b>{item.owner_name || 'Sin propietario'}</b><small>{item.owner_email || ''}</small></span><button className="outline-action" onClick={() => { const record = (data.records || []).find(recordItem => recordItem.pet_id === item.id); if (record) onDetail(record); }} disabled={!(data.records || []).some(record => record.pet_id === item.id)}>Historia clínica <ChevronRight size={14} /></button></div>)}</div> : <div className="empty">No hay pacientes registrados.</div>}</div>;
}
function ReceptionUsers({ data, onEdit, onOpen }) {
  const users = data.users || [];
  return <div className="panel reception-users-panel"><div className="panel-head"><div><h2>Usuarios y propietarios</h2><p>Contactos registrados en Huella</p></div><span className="count-badge">{users.length} activos</span></div>{users.length ? <div className="reception-user-list">{users.map((item, index) => <div className="reception-user-row" key={item.id}><span className={`avatar patient-color-${index % 4}`}>{item.full_name.slice(0, 2).toUpperCase()}</span><span className="reception-user-main"><b>{item.full_name}</b><small>{item.phone || 'Sin teléfono'}{item.pet_names ? ` · ${item.pet_names}` : ''}</small></span><span className="reception-user-role">Propietario</span><button className="outline-action" onClick={() => onEdit(item)}>Editar</button></div>)}</div> : <div className="empty">No hay usuarios registrados.</div>}</div>;
}
function AdminNotifications({ data, onDetail, onOpen }) {
  const notifications = data.notifications || [];
  const iconFor = type => type === 'vaccine' ? Syringe : type === 'appointment' ? CalendarDays : Bell;
  return <div className="panel admin-notifications-page"><div className="panel-head"><div><h2>Notificaciones enviadas</h2><p>Avisos enviados a las familias de Huella</p></div><button className="primary small" onClick={() => onOpen('notification')}><Plus size={16} /> Nueva alerta</button></div>{notifications.length ? <div className="admin-notification-list">{notifications.map(item => { const Icon = iconFor(item.type); return <button className="admin-notification-row" key={item.id} onClick={() => onDetail(item)}><span className={`notification-icon notification-${item.type || 'general'}`}><Icon size={17} /></span><span><b>{item.title || 'Notificación'}</b><small>{item.recipient_name || item.recipient_email || 'Familia Huella'} · {item.message || ''}</small></span><em>{item.type === 'vaccine' ? 'Vacuna' : item.type === 'appointment' ? 'Cita' : 'General'}</em><ChevronRight size={15} /></button>; })}</div> : <div className="empty">No hay notificaciones enviadas.</div>}</div>;
}

function List({ section, data, user, onOpen, onStatus, onReschedule, onDetail }) {
  if (section === 'appointments') {
    const sorted = [...data].sort((a, b) => `${a.appt_date} ${a.appt_time}`.localeCompare(`${b.appt_date} ${b.appt_time}`));
    return <div className={`panel calendar-panel ${user.role === 'owner' ? 'owner-calendar-panel' : ''}`}><CalendarAgenda appointments={sorted} onStatus={onStatus} onReschedule={onReschedule} owner={user.role === 'owner'} /></div>;
  }
  const labels = { pets: ['Mascotas', 'pet'], records: ['Historias clínicas', 'record'], prescriptions: ['Recetas y prescripciones', 'prescription'], vaccinations: ['Vacunas', 'vaccine'], notifications: ['Notificaciones enviadas', 'notification'], users: ['Usuarios y propietarios', 'ownerPet'], waiting: ['Sala de espera', null] };
  const [heading, form] = labels[section] || [section, null];
  const canCreate = form
    && (section !== 'notifications' || user.role === 'admin')
    && !(section === 'prescriptions' && user.role !== 'vet')
    && !(section === 'pets' && user.role === 'reception');
  const isClinical = section === 'records' || section === 'prescriptions' || section === 'notifications';
  return <div className="panel"><div className="panel-head"><div><h2>{heading}</h2><p>{data.length} registros guardados</p></div>{canCreate && <button className="primary small" onClick={() => onOpen(form)}><Plus size={16} /> {form === 'ownerPet' ? 'Registrar usuario' : form === 'notification' ? 'Nueva notificación' : 'Nuevo registro'}</button>}</div>{data.length === 0 ? <div className="empty">No hay registros todavía.</div> : <div className="rows">{data.map(item => <div className={`row ${isClinical ? 'clickable-row' : ''}`} key={item.id} onClick={() => isClinical && onDetail(item)} role={isClinical ? 'button' : undefined} tabIndex={isClinical ? 0 : undefined} onKeyDown={event => { if ((event.key === 'Enter' || event.key === ' ') && isClinical) onDetail(item); }}><div className="avatar">{(item.pet_name || item.name || item.full_name || item.title || 'H').slice(0, 2).toUpperCase()}</div><div className="row-main"><b>{item.pet_name || item.name || item.full_name || item.title || item.type}</b><small>{section === 'notifications' ? `${item.title || 'Notificación'} · ${item.message || ''}` : item.pet_names || item.owner_name || item.reason || item.vaccine_name || item.medication || item.message || item.email || ''}</small></div>{section === 'waiting' && <span className={`status-badge status-${item.status}`}>{statusLabels[item.status]}</span>}</div>)}</div>}</div>;
}

const detailLabels = { pet_name: 'Mascota', owner_name: 'Propietario', vet_name: 'Veterinario', visit_date: 'Fecha de visita', reason: 'Motivo', symptoms: 'Síntomas', diagnosis: 'Diagnóstico', treatment: 'Tratamiento', weight_kg: 'Peso (kg)', temperature_c: 'Temperatura (°C)', notes: 'Notas', medication: 'Medicamento', dose: 'Dosis', frequency: 'Frecuencia', duration_days: 'Duración (días)', instructions: 'Instrucciones', valid_until: 'Válida hasta', created_at: 'Registrada el' };
function ClinicalDetail({ section, item }) {
  const keys = section === 'records'
    ? ['pet_name', 'owner_name', 'vet_name', 'visit_date', 'reason', 'symptoms', 'diagnosis', 'treatment', 'weight_kg', 'temperature_c', 'notes', 'created_at']
    : ['pet_name', 'owner_name', 'vet_name', 'medication', 'dose', 'frequency', 'duration_days', 'instructions', 'valid_until', 'created_at'];
  return <div className="clinical-detail">{keys.map(key => item[key] !== null && item[key] !== undefined && item[key] !== '' ? <div className="clinical-field" key={key}><span>{detailLabels[key] || key}</span><b>{item[key]}</b></div> : null)}</div>;
}
function NotificationDetail({ item }) {
  return <div className="clinical-detail"><div className="clinical-field"><span>Tipo</span><b>{item.type || 'general'}</b></div><div className="clinical-field"><span>Título</span><b>{item.title || 'Notificación'}</b></div><div className="clinical-field"><span>Destinatario</span><b>{item.recipient_name || item.recipient_email || 'Familia Huella'}</b></div><div className="clinical-field"><span>Mensaje</span><b>{item.message || 'Sin mensaje'}</b></div><div className="clinical-field"><span>Enviada el</span><b>{item.created_at ? new Date(item.created_at).toLocaleString('es-CO') : 'Fecha no disponible'}</b></div>{item.read_at && <div className="clinical-field"><span>Estado</span><b>Leída</b></div>}</div>;
}
function PetDetail({ item }) {
  return <div className="clinical-detail"><div className="clinical-field"><span>Nombre</span><b>{item.name}</b></div><div className="clinical-field"><span>Especie</span><b>{item.species || 'No indicada'}</b></div><div className="clinical-field"><span>Raza</span><b>{item.breed || 'No indicada'}</b></div><div className="clinical-field"><span>Edad</span><b>{item.age_years ? `${item.age_years} años` : 'No indicada'}</b></div><div className="clinical-field"><span>Propietario</span><b>{item.owner_name || 'No indicado'}</b></div><div className="clinical-field"><span>Contacto</span><b>{item.owner_phone || item.owner_email || 'No indicado'}</b></div></div>;
}

function Form({ type, data, onSave, error, appointment, editUser }) {
  const [form, setForm] = useState(type === 'reschedule' && appointment ? { appt_date: appointment.appt_date, appt_time: String(appointment.appt_time).slice(0, 5) } : type === 'editUser' && editUser ? { id: editUser.id, full_name: editUser.full_name, email: editUser.email, phone: editUser.phone || '' } : initial[type]);
  const set = event => setForm({ ...form, [event.target.name]: event.target.value });
  const pets = data.pets || [], records = data.records || [], owners = data.users || [];
  const selectPets = <Field label="Mascota"><select name="pet_id" required value={form.pet_id} onChange={set}><option value="">Selecciona una mascota</option>{pets.map(p => <option key={p.id} value={p.id}>{p.name} {p.owner_name ? `- ${p.owner_name}` : ''}</option>)}</select></Field>;
  return <form className="modal-form" onSubmit={e => { e.preventDefault(); onSave(type, form); }}><div className="form-grid">
    {type === 'reschedule' && <><Field label="Nueva fecha"><input type="date" name="appt_date" required value={form.appt_date} onChange={set} /></Field><Field label="Nueva hora"><input type="time" name="appt_time" required value={form.appt_time} onChange={set} /></Field></>}
    {type === 'urgency' && <><div className="urgency-heading"><AlertTriangle /> <div><b>Describe el caso para alertar inmediatamente al equipo veterinario.</b></div></div><Field label="Nombre del paciente"><input name="patient_name" required placeholder="Nombre de la mascota" value={form.patient_name} onChange={set} /></Field><Field label="Correo del propietario"><input type="email" name="owner_email" placeholder="propietario@correo.com" value={form.owner_email} onChange={set} /></Field><Field label="Síntomas del paciente"><textarea name="symptoms" required placeholder="Describe los síntomas, cuándo comenzaron y cualquier dato importante..." value={form.symptoms} onChange={set} /></Field></>}
    {type === 'ownerPet' && <><div className="form-section">DATOS DEL PROPIETARIO</div><Field label="Nombre completo"><input name="full_name" required value={form.full_name} onChange={set} /></Field><Field label="Teléfono"><input name="phone" required value={form.phone} onChange={set} /></Field><Field label="Correo electrónico"><input type="email" name="email" required value={form.email} onChange={set} /></Field><Field label="Contraseña inicial"><input type="password" name="password" value={form.password} onChange={set} /></Field><div className="form-section">DATOS DE LA MASCOTA</div><Field label="Nombre de la mascota"><input name="pet_name" required value={form.pet_name} onChange={set} /></Field><Field label="Tipo de mascota"><input name="species" value={form.species} onChange={set} /></Field><Field label="Sexo"><input name="sex" value={form.sex} onChange={set} /></Field><Field label="Raza"><input name="breed" value={form.breed} onChange={set} /></Field></>}
    {type === 'editUser' && <><Field label="Nombre completo"><input name="full_name" required value={form.full_name} onChange={set} /></Field><Field label="Teléfono"><input name="phone" required value={form.phone} onChange={set} /></Field><Field label="Correo electrónico"><input type="email" name="email" required value={form.email} onChange={set} /></Field></>}
    {type === 'pet' && <><Field label="Propietario"><select name="owner_id" required value={form.owner_id || ''} onChange={set}><option value="">Selecciona un propietario</option>{owners.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}</select></Field><Field label="Nombre"><input name="name" required value={form.name} onChange={set} /></Field><Field label="Especie"><input name="species" value={form.species} onChange={set} /></Field><Field label="Sexo"><input name="sex" value={form.sex} onChange={set} /></Field><Field label="Raza"><input name="breed" value={form.breed} onChange={set} /></Field></>}
    {type === 'appointment' && <>{selectPets}<Field label="Motivo"><input name="reason" value={form.reason} onChange={set} /></Field><Field label="Fecha"><input type="date" name="appt_date" required value={form.appt_date} onChange={set} /></Field><Field label="Hora"><input type="time" name="appt_time" required value={form.appt_time} onChange={set} /></Field></>}
    {type === 'record' && <>{selectPets}<Field label="Fecha"><input type="date" name="visit_date" required value={form.visit_date} onChange={set} /></Field><Field label="Motivo"><input name="reason" required value={form.reason} onChange={set} /></Field><Field label="Diagnóstico"><textarea name="diagnosis" required value={form.diagnosis} onChange={set} /></Field><Field label="Síntomas"><textarea name="symptoms" value={form.symptoms} onChange={set} /></Field><Field label="Tratamiento"><textarea name="treatment" value={form.treatment} onChange={set} /></Field></>}
    {type === 'notification' && <><Field label="Propietario"><select name="user_id" required value={form.user_id} onChange={set}><option value="">Selecciona</option>{owners.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}</select></Field><Field label="Título"><input name="title" required value={form.title} onChange={set} /></Field><Field label="Mensaje"><textarea name="message" required value={form.message} onChange={set} /></Field></>}
    {type === 'prescription' && <><Field label="Historia clínica"><select name="medical_record_id" required value={form.medical_record_id} onChange={set}><option value="">Selecciona</option>{records.map(r => <option key={r.id} value={r.id}>{r.pet_name} - {r.reason}</option>)}</select></Field><Field label="Mascota"><select name="pet_id" required value={form.pet_id} onChange={set}><option value="">Selecciona</option>{pets.map(p => <option key={p.id} value={p.id}>{p.name} {p.owner_name ? `- ${p.owner_name}` : ''}</option>)}</select></Field><Field label="Medicamento"><input name="medication" required value={form.medication} onChange={set} /></Field><Field label="Dosis"><input name="dose" required value={form.dose} onChange={set} /></Field><Field label="Frecuencia"><input name="frequency" required value={form.frequency} onChange={set} /></Field><Field label="Duración (días)"><input type="number" name="duration_days" required value={form.duration_days} onChange={set} /></Field><Field label="Válida hasta"><input type="date" name="valid_until" required value={form.valid_until} onChange={set} /></Field></>}
    {type === 'vaccine' && <><Field label="Propietario"><input value={pets.find(p => String(p.id) === String(form.pet_id))?.owner_name || 'Selecciona una mascota'} readOnly /></Field>{selectPets}<Field label="Nombre de la vacuna"><input name="vaccine_name" required value={form.vaccine_name} onChange={set} /></Field><Field label="Fecha de aplicación"><input type="date" name="applied_date" required value={form.applied_date} onChange={set} /></Field><Field label="Fecha de la próxima dosis"><input type="date" name="next_dose_date" required value={form.next_dose_date} onChange={set} /></Field><Field label="¿Para qué sirve?"><textarea name="notes" required placeholder="Describe la protección o finalidad de la vacuna" value={form.notes || ''} onChange={set} /></Field></>}
  </div>{error && <div className="error">{error}</div>}<button className={`primary full ${type === 'urgency' ? 'danger' : ''}`}>{type === 'urgency' ? 'Registrar y alertar al equipo' : 'Guardar registro'}</button></form>;
}

createRoot(document.getElementById('root')).render(<App />);
