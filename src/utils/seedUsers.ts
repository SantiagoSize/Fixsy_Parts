// Seed initial users for Auth (fixsy_users) and Management (fixsyUsers)
// Safe to call multiple times; only seeds when empty.
import { Role } from '../types/auth';
import { uuid } from './uuid';

type AuthUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: Role;
};

type Status = 'Activo' | 'Bloqueado' | 'Suspendido';

type MgmtUser = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: Role;
  status: Status;
  foto?: string;
  suspensionHasta?: string;
  historialCompras?: { fecha: string; producto: string; monto: number }[];
  tickets?: { id: string; asunto: string; estado: string; fecha: string }[];
};

const AUTH_KEY = 'fixsy_users';
const MGMT_KEY = 'fixsyUsers';

function isEmptyOrInvalid(value: unknown) {
  return !Array.isArray(value) || value.length === 0;
}

export function seedAuthUsersOnce() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!isEmptyOrInvalid(parsed)) return;
  } catch {/* ignore parse errors and seed */}

  const now = Date.now();
  const users: AuthUser[] = [
    { id: `${now-5}_adm`, nombre: 'Santiago', apellido: 'Silva', email: 'santiago@admin.fixsy.com', password: '12345678', role: 'Admin' },
    { id: `${now-4}_sup`, nombre: 'Matías', apellido: 'Torres', email: 'matias@soporte.fixsy.com', password: '12345678', role: 'Soporte' },
    { id: `${now-3}_usr1`, nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@mail.com', password: '12345678', role: 'Usuario' },
    { id: `${now-2}_usr2`, nombre: 'María', apellido: 'Gómez', email: 'maria.gomez@mail.com', password: '12345678', role: 'Usuario' },
    { id: `${now-1}_usr3`, nombre: 'Carlos', apellido: 'Ruiz', email: 'carlos.ruiz@mail.com', password: '12345678', role: 'Usuario' },
    { id: `${now-6}_usr4`, nombre: 'Laura', apellido: 'Medina', email: 'laura.medina@mail.com', password: '12345678', role: 'Usuario' },
    { id: `${now-7}_usr5`, nombre: 'Pedro', apellido: 'López', email: 'pedro.lopez@mail.com', password: '12345678', role: 'Usuario' },
    { id: `${now-8}_usr6`, nombre: 'Lucía', apellido: 'Reyes', email: 'lucia.reyes@mail.com', password: '12345678', role: 'Usuario' },
    { id: `${now-9}_usr7`, nombre: 'Roberto', apellido: 'Sánchez', email: 'roberto.sanchez@mail.com', password: '12345678', role: 'Usuario' },
    { id: `${now-10}_usr8`, nombre: 'Camila', apellido: 'Vega', email: 'camila.vega@mail.com', password: '12345678', role: 'Usuario' },
  ];
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(users)); } catch {}
}

// Fuerza todas las contraseñas en fixsy_users a un valor dado (p.ej. 12345678)
export function setAllAuthPasswords(newPassword: string) {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    const list = raw ? JSON.parse(raw) as AuthUser[] : [];
    const next = Array.isArray(list) ? list.map(u => ({ ...u, password: newPassword })) : [];
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
  } catch {}
}

// Deja únicamente los usuarios base (por email) en ambas claves: auth y gestión
export function pruneUsersToCore(coreEmails: string[]) {
  const core = new Set(coreEmails.map(e => (e || '').toLowerCase().trim()));
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    const list = raw ? JSON.parse(raw) as AuthUser[] : [];
    const next = Array.isArray(list) ? list.filter(u => core.has((u.email||'').toLowerCase())) : [];
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
  } catch {}

  try {
    const raw = localStorage.getItem(MGMT_KEY);
    const list = raw ? JSON.parse(raw) as MgmtUser[] : [];
    const next = Array.isArray(list) ? list.filter(u => core.has((u.email||'').toLowerCase())) : [];
    localStorage.setItem(MGMT_KEY, JSON.stringify(next));
  } catch {}
}

// Asegura que existan las cuentas núcleo de Admin y Soporte
export function ensureCoreAccounts() {
  const adminEmail = 'santiago@admin.fixsy.com';
  const supportEmail = 'matias@soporte.fixsy.com';

  // Auth (fixsy_users)
  let auth: AuthUser[] = [];
  try { const raw = localStorage.getItem(AUTH_KEY); auth = raw ? JSON.parse(raw) as AuthUser[] : []; } catch { auth = []; }
  if (!Array.isArray(auth)) auth = [];

  const ensureAuth = (email: string, nombre: string, apellido: string, role: Role) => {
    const found = auth.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found;
    const u: AuthUser = { id: uuid(), nombre, apellido, email, password: '12345678', role };
    auth.push(u);
    return u;
  };

  const a = ensureAuth(adminEmail, 'Santiago', 'Silva', 'Admin');
  const s = ensureAuth(supportEmail, 'Matías', 'Torres', 'Soporte');
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); } catch {}

  // Gestión (fixsyUsers)
  type MgmtUser = {
    id: string; nombre: string; apellido: string; email: string; role: Role;
    status: 'Activo' | 'Bloqueado' | 'Suspendido';
    foto?: string; suspensionHasta?: string;
    historialCompras?: { fecha: string; producto: string; monto: number }[];
    tickets?: { id: string; asunto: string; estado: string; fecha: string }[];
  };

  let mgmt: MgmtUser[] = [] as any;
  try { const raw = localStorage.getItem(MGMT_KEY); mgmt = raw ? JSON.parse(raw) as MgmtUser[] : []; } catch { mgmt = []; }
  if (!Array.isArray(mgmt)) mgmt = [] as any;

  const ensureMgmt = (base: AuthUser, status: MgmtUser['status']) => {
    const found = mgmt.find(u => (u.email || '').toLowerCase() === base.email.toLowerCase());
    if (found) return found;
    const m: MgmtUser = { id: base.id, nombre: base.nombre, apellido: base.apellido, email: base.email, role: base.role, status, historialCompras: [], tickets: [] };
    mgmt.push(m);
    return m;
  };
  ensureMgmt(a, 'Activo');
  ensureMgmt(s, 'Activo');
  try { localStorage.setItem(MGMT_KEY, JSON.stringify(mgmt)); } catch {}
}

// Asegura que los 3 usuarios demo @gmail.com existan en auth y gestión
export function ensureDemoUsersGmailPresent() {
  const demos = [
    { nombre: 'Lucas', apellido: 'Morales', email: 'lucas.morales@gmail.com' },
    { nombre: 'Valentina', apellido: 'Rojas', email: 'valentina.rojas@gmail.com' },
    { nombre: 'Diego', apellido: 'Castro', email: 'diego.castro@gmail.com' },
  ];
  let auth: AuthUser[] = [];
  try { const raw = localStorage.getItem(AUTH_KEY); auth = raw ? JSON.parse(raw) as AuthUser[] : []; } catch { auth = []; }
  if (!Array.isArray(auth)) auth = [];
  let mgmt: MgmtUser[] = [] as any;
  try { const raw = localStorage.getItem(MGMT_KEY); mgmt = raw ? JSON.parse(raw) as MgmtUser[] : []; } catch { mgmt = []; }
  if (!Array.isArray(mgmt)) mgmt = [] as any;

  let changedAuth = false, changedMgmt = false;
  demos.forEach(d => {
    const foundA = auth.find(u => (u.email||'').toLowerCase() === d.email);
    if (!foundA) {
      const u: AuthUser = { id: uuid(), nombre: d.nombre, apellido: d.apellido, email: d.email, password: '12345678', role: 'Usuario' };
      auth.push(u); changedAuth = true;
      // also add to mgmt
      const m: MgmtUser = { id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email, role: 'Usuario', status: 'Activo', historialCompras: [], tickets: [] };
      mgmt.push(m); changedMgmt = true;
    } else {
      const foundM = mgmt.find(x => (x.email||'').toLowerCase() === d.email);
      if (!foundM) {
        const m: MgmtUser = { id: foundA.id, nombre: foundA.nombre, apellido: foundA.apellido, email: foundA.email, role: 'Usuario', status: 'Activo', historialCompras: [], tickets: [] };
        mgmt.push(m); changedMgmt = true;
      }
    }
  });
  if (changedAuth) try { localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); } catch {}
  if (changedMgmt) try { localStorage.setItem(MGMT_KEY, JSON.stringify(mgmt)); } catch {}
}

// Crea (si no existe) un correo de Soporte (Matías) hacia Admin (Santiago)
export function ensureSupportToAdminMail() {
  const adminEmail = 'santiago@admin.fixsy.com';
  const supportEmail = 'matias@soporte.fixsy.com';

  const inboxKey = (email: string) => `fixsy_inbox_${email.toLowerCase()}`;
  const loadInbox = (email: string) => {
    try { const raw = localStorage.getItem(inboxKey(email)); return raw ? JSON.parse(raw) : []; } catch { return []; }
  };
  const saveInbox = (email: string, list: any[]) => {
    try { localStorage.setItem(inboxKey(email), JSON.stringify(list)); } catch {}
  };

  // si ya existe algún mensaje de soporte a admin, no duplicar
  const adminInbox = loadInbox(adminEmail);
  const exists = Array.isArray(adminInbox) && adminInbox.some((m: any) => (m?.from||'').toLowerCase() === supportEmail && (m?.to||'').toLowerCase() === adminEmail);
  if (exists) return;

  const now = new Date().toISOString();
  const base = {
    id: uuid(),
    conversationId: uuid(),
    from: supportEmail,
    to: adminEmail,
    subject: 'Aviso de soporte',
    message: 'Hola Santiago, informo de un caso atendido por soporte.',
    date: now,
    read: false,
    important: false,
    archived: false,
    deleted: false,
    attachments: ['resumen.pdf']
  };

  // Guardar en enviados de soporte (read: true)
  const supOut = loadInbox(supportEmail);
  supOut.unshift({ ...base, id: uuid(), read: true });
  saveInbox(supportEmail, supOut);

  // Guardar en recibidos de admin (read: false)
  adminInbox.unshift(base);
  saveInbox(adminEmail, adminInbox);
}

// Crea 3 usuarios demo (si no existen) y envía correos iniciales al admin y soporte.
export function seedDemoUsersAndMail() {
  // Idempotencia: no resembrar correos si ya se ejecutó
  try { if (localStorage.getItem('fixsy_demo_mail_seed_v2') === '1') return; } catch {}
  const adminEmail = 'santiago@admin.fixsy.com';
  const supportMailbox = 'matias@soporte.fixsy.com'; // bandeja pública de soporte
  const supportLogin = 'matias@soporte.fixsy.com'; // cuenta de soporte que envía a admin
  const demoUsers = [
    { nombre: 'Lucas', apellido: 'Morales', email: 'lucas.morales@gmail.com' },
    { nombre: 'Valentina', apellido: 'Rojas', email: 'valentina.rojas@gmail.com' },
    { nombre: 'Diego', apellido: 'Castro', email: 'diego.castro@gmail.com' },
  ];

  // Helpers inbox
  const inboxKey = (email: string) => `fixsy_inbox_${email.toLowerCase()}`;
  const loadInbox = (email: string) => {
    try { const raw = localStorage.getItem(inboxKey(email)); return raw ? JSON.parse(raw) : []; } catch { return []; }
  };
  const saveInbox = (email: string, list: any[]) => {
    try { localStorage.setItem(inboxKey(email), JSON.stringify(list)); } catch {}
  };
  // Tickets
  const TICKETS_PREFIX = 'fixsy_tickets_';
  const loadTicketsFor = (email: string) => {
    try { const raw = localStorage.getItem(TICKETS_PREFIX + email.toLowerCase()); return raw ? JSON.parse(raw) : []; } catch { return []; }
  };
  const saveTicketsFor = (email: string, list: any[]) => {
    try { localStorage.setItem(TICKETS_PREFIX + email.toLowerCase(), JSON.stringify(list)); } catch {}
  };

  // 1) Asegurar en fixsy_users y fixsyUsers
  let auth: AuthUser[] = [];
  try { const raw = localStorage.getItem(AUTH_KEY); auth = raw ? JSON.parse(raw) : []; } catch { auth = []; }
  if (!Array.isArray(auth)) auth = [];
  let mgmt: MgmtUser[] = [] as any;
  try { const raw = localStorage.getItem(MGMT_KEY); mgmt = raw ? JSON.parse(raw) : []; } catch { mgmt = []; }
  if (!Array.isArray(mgmt)) mgmt = [] as any;

  const ensureAuth = (name: string, last: string, email: string) => {
    const found = auth.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found;
    const user: AuthUser = { id: uuid(), nombre: name, apellido: last, email, password: '12345678', role: 'Usuario' };
    auth.push(user);
    return user;
  };
  const ensureMgmt = (u: AuthUser) => {
    const found = mgmt.find((x: any) => (x.email || '').toLowerCase() === u.email.toLowerCase());
    if (found) return found;
    const m: MgmtUser = { id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email, role: 'Usuario', status: 'Activo', historialCompras: [], tickets: [] } as any;
    mgmt.push(m);
    return m;
  };

  const created: AuthUser[] = [];
  demoUsers.forEach(d => {
    const a = ensureAuth(d.nombre, d.apellido, d.email);
    ensureMgmt(a);
    created.push(a);
  });

  try { localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); } catch {}
  try { localStorage.setItem(MGMT_KEY, JSON.stringify(mgmt)); } catch {}

  // 2) Sembrar correos: cada usuario envía uno al admin y otro al soporte
  const now = Date.now();
  created.forEach((u, idx) => {
    const baseDate = new Date(now - (idx * 60000)).toISOString();
    const makeMsg = (from: string, to: string, subject: string, message: string, attachments: string[] = []) => ({
      id: uuid(), conversationId: uuid(), from: from.toLowerCase(), to: to.toLowerCase(), subject, message, date: baseDate, read: false, important: false, archived: false, deleted: false, attachments
    });

    // a) Usuario -> Soporte (y ticket)
    const mSupport = makeMsg(u.email, supportMailbox, `Ayuda requerida - ${u.nombre}`, `Hola Soporte, necesito ayuda con mi cuenta.`, ['log.txt','screen.mp4']);
    const sentUser2 = { ...mSupport, id: uuid(), read: true };
    const userInbox2 = loadInbox(u.email); userInbox2.unshift(sentUser2); saveInbox(u.email, userInbox2);
    const supportInbox = loadInbox(supportMailbox); supportInbox.unshift(mSupport); saveInbox(supportMailbox, supportInbox);
    // Ticket
    const bucket = loadTicketsFor(u.email);
    const ticket = {
      id: uuid(), ownerEmail: u.email.toLowerCase(), subject: mSupport.subject, status: 'Abierto', createdAt: baseDate,
      messages: [{ id: uuid(), from: u.email.toLowerCase(), to: supportMailbox.toLowerCase(), body: mSupport.message, date: baseDate }]
    };
    bucket.unshift(ticket);
    saveTicketsFor(u.email, bucket);

    // b) Soporte -> Admin (derivación del caso)
    const mSupToAdmin = makeMsg(supportLogin, adminEmail, `Derivación de caso - ${u.nombre} ${u.apellido}`, `Hola Admin, se deriva el caso del usuario ${u.nombre} (${u.email}).`, ['resumen.pdf']);
    const supSent = { ...mSupToAdmin, id: uuid(), read: true };
    const supOutbox = loadInbox(supportLogin); supOutbox.unshift(supSent); saveInbox(supportLogin, supOutbox);
    const adminInbox2 = loadInbox(adminEmail); adminInbox2.unshift(mSupToAdmin); saveInbox(adminEmail, adminInbox2);
  });

  try { localStorage.setItem('fixsy_demo_mail_seed_v2', '1'); } catch {}
}

export function seedManagementUsersOnce() {
  try {
    const raw = localStorage.getItem(MGMT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!isEmptyOrInvalid(parsed)) return;
  } catch {/* ignore parse errors and seed */}

  const now = Date.now();
  const toISO = (d: Date) => d.toISOString();
  const inDays = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };

  const list: MgmtUser[] = [
    {
      id: `${now-5}_adm`, nombre: 'Santiago', apellido: 'Silva', email: 'santiago@admin.fixsy.com', role: 'Admin', status: 'Activo',
      historialCompras: [
        { fecha: '2025-05-10', producto: 'Licencia Admin Pro', monto: 0 }
      ], tickets: [
        { id: 'T-1100', asunto: 'Recordatorio de mantenimiento', estado: 'Cerrado', fecha: '2025-05-12' }
      ]
    },
    {
      id: `${now-4}_sup`, nombre: 'Matías', apellido: 'Torres', email: 'matias@soporte.fixsy.com', role: 'Soporte', status: 'Activo',
      historialCompras: [], tickets: [
        { id: 'T-1001', asunto: 'Seguimiento caso A-01', estado: 'Cerrado', fecha: '2025-06-01' },
        { id: 'T-1002', asunto: 'Escalamiento interno B-14', estado: 'Cerrado', fecha: '2025-06-03' },
      ]
    },
    {
      id: `${now-3}_usr1`, nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@mail.com', role: 'Usuario', status: 'Activo',
      historialCompras: [
        { fecha: '2025-05-28', producto: 'Filtro FX-100', monto: 15990 },
        { fecha: '2025-06-02', producto: 'Aceite 5W-30', monto: 22990 },
        { fecha: '2025-06-05', producto: 'Bujías NGK', monto: 18990 }
      ],
      tickets: [
        { id: 'T-2001', asunto: 'Consulta por garantía', estado: 'Abierto', fecha: '2025-06-02' },
        { id: 'T-2002', asunto: 'Seguimiento despacho', estado: 'Pendiente', fecha: '2025-06-03' }
      ]
    },
    {
      id: `${now-2}_usr2`, nombre: 'María', apellido: 'Gómez', email: 'maria.gomez@mail.com', role: 'Usuario', status: 'Suspendido',
      suspensionHasta: toISO(inDays(7)),
      historialCompras: [
        { fecha: '2025-05-20', producto: 'Pastillas de freno', monto: 34990 },
        { fecha: '2025-05-30', producto: 'Discos de freno', monto: 59990 }
      ],
      tickets: [
        { id: 'T-2101', asunto: 'Devolución producto', estado: 'Cerrado', fecha: '2025-05-31' }
      ]
    },
    {
      id: `${now-1}_usr3`, nombre: 'Carlos', apellido: 'Ruiz', email: 'carlos.ruiz@mail.com', role: 'Usuario', status: 'Bloqueado',
      historialCompras: [
        { fecha: '2025-04-10', producto: 'Kit correas', monto: 44990 }
      ], tickets: [
        { id: 'T-3001', asunto: 'Problema con mi cuenta', estado: 'Pendiente', fecha: '2025-06-03' },
        { id: 'T-3002', asunto: 'Actualización de datos', estado: 'Cerrado', fecha: '2025-06-01' }
      ]
    },
    {
      id: `${now-6}_usr4`, nombre: 'Laura', apellido: 'Medina', email: 'laura.medina@mail.com', role: 'Usuario', status: 'Activo',
      historialCompras: [
        { fecha: '2025-05-12', producto: 'Filtro de aire', monto: 9990 },
        { fecha: '2025-05-18', producto: 'Aceite 10W-40', monto: 19990 }
      ], tickets: [
        { id: 'T-4001', asunto: 'Boleta no recibida', estado: 'Cerrado', fecha: '2025-05-19' }
      ]
    },
    {
      id: `${now-7}_usr5`, nombre: 'Pedro', apellido: 'López', email: 'pedro.lopez@mail.com', role: 'Usuario', status: 'Suspendido',
      suspensionHasta: toISO(inDays(3)),
      historialCompras: [
        { fecha: '2025-06-01', producto: 'Limpiaparabrisas', monto: 7990 }
      ], tickets: [
        { id: 'T-5001', asunto: 'Consulta medio de pago', estado: 'Abierto', fecha: '2025-06-02' }
      ]
    },
    {
      id: `${now-8}_usr6`, nombre: 'Lucía', apellido: 'Reyes', email: 'lucia.reyes@mail.com', role: 'Usuario', status: 'Activo',
      historialCompras: [], tickets: []
    },
    {
      id: `${now-9}_usr7`, nombre: 'Roberto', apellido: 'Sánchez', email: 'roberto.sanchez@mail.com', role: 'Usuario', status: 'Bloqueado',
      historialCompras: [
        { fecha: '2025-03-15', producto: 'Amortiguadores', monto: 89990 }
      ], tickets: [
        { id: 'T-7001', asunto: 'Revisión garantía', estado: 'Pendiente', fecha: '2025-06-01' }
      ]
    },
    {
      id: `${now-10}_usr8`, nombre: 'Camila', apellido: 'Vega', email: 'camila.vega@mail.com', role: 'Usuario', status: 'Activo',
      historialCompras: [
        { fecha: '2025-05-05', producto: 'Terminal de dirección', monto: 25990 }
      ], tickets: [
        { id: 'T-8001', asunto: 'Consulta factura electrónica', estado: 'Cerrado', fecha: '2025-05-06' },
        { id: 'T-8002', asunto: 'Compatibilidad de producto', estado: 'Cerrado', fecha: '2025-06-02' }
      ]
    },
  ];

  try { localStorage.setItem(MGMT_KEY, JSON.stringify(list)); } catch {}
}
