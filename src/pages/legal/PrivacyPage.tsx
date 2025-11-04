import React from 'react';

type Section = { key: string; title: string; body: React.ReactNode };

function PrivacyPage(): React.ReactElement {
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const sections: Section[] = [
    { key: 'datos', title: 'Qué datos recolectamos', body: (
      <ul>
        <li>Email y nombre de contacto</li>
        <li>Datos de compra: productos, cantidades, montos</li>
        <li>Información técnica básica: navegador y páginas visitadas</li>
      </ul>
    ) },
    { key: 'uso', title: 'Para qué los usamos', body: (
      <ul>
        <li>Procesar pedidos y mostrar historial</li>
        <li>Mejorar la experiencia de uso del sitio</li>
        <li>Enviar comunicaciones relacionadas a tus compras</li>
      </ul>
    ) },
    { key: 'terceros', title: 'No compartimos con terceros', body: (
      <p>
        No vendemos ni compartimos tu información con terceros, salvo por requerimientos
        legales válidos o para operar servicios esenciales (p. ej. medios de pago) con
        acuerdos de confidencialidad.
      </p>
    ) },
    { key: 'derechos', title: 'Tus derechos', body: (
      <ul>
        <li>Acceder a tus datos personales.</li>
        <li>Solicitar rectificación o eliminación.</li>
        <li>Oponerte a ciertos tratamientos de datos.</li>
      </ul>
    ) },
    { key: 'soporte', title: 'Contacto y soporte', body: (
      <p>
        Para ejercer tus derechos o resolver dudas, escríbenos a
        <strong> soporte@fixsy.cl</strong> o llámanos al
        <strong> +56 9 1234 5678</strong>.
      </p>
    ) },
  ];

  const toggle = (k: string) => setOpen(o => ({ ...o, [k]: !o[k] }));

  return (
    <section className="lp fade-in" style={{ padding: '1rem 1rem 2rem 1rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 className="lp__title">Política de Privacidad</h1>
      <p className="lp__subtitle">Información simple y clara sobre el uso de tus datos</p>

      <div className="lp__list">
        {sections.map(s => (
          <article key={s.key} className={`lp__item ${open[s.key] ? 'open' : ''}`}>
            <button className="lp__toggle" onClick={() => toggle(s.key)} aria-expanded={!!open[s.key]}>
              <span>{s.title}</span>
              <span className="lp__chev" aria-hidden>▸</span>
            </button>
            <div className="lp__content">
              {s.body}
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .fade-in { animation: fadeIn .3s ease-out; }
        @keyframes fadeIn { from { opacity: .0; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
        .lp__title { font-weight: 700; font-family: 'Montserrat', sans-serif; margin: 0 0 .25rem 0; text-align: center; }
        .lp__subtitle { color: #4b4b4b; margin: 0 0 1rem 0; text-align: center; }
        .lp__list { display: grid; gap: .75rem; }
        .lp__item { border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; overflow: hidden; }
        /* Encabezado de sección: fondo verde, texto blanco */
        .lp__toggle { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: .5rem; padding: .85rem 1rem; background: #26AB4E; color: #fff; border: 0; cursor: pointer; font-weight: 600; text-align: left; }
        .lp__toggle:hover { filter: brightness(.98); }
        .lp__chev { transition: transform .2s ease; }
        .lp__item.open .lp__chev { transform: rotate(90deg); }
        /* Contenido expandido: fondo blanco, texto negro */
        .lp__content { padding: 0 1rem 0 1rem; color: #2C2A2B; max-height: 0; opacity: 0; overflow: hidden; transition: max-height .25s ease, opacity .2s ease; background: #fff; }
        .lp__item.open .lp__content { padding: .75rem 1rem 1rem 1rem; max-height: 800px; opacity: 1; background: #fff; position: relative; z-index: 2; box-shadow: 0 6px 20px rgba(0,0,0,0.08); border-radius: 0 0 10px 10px; }
        .lp li { margin: .35rem 0; }
      `}</style>
    </section>
  );
}

export default PrivacyPage;

