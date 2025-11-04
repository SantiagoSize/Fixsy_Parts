import React from 'react';

type Section = { key: string; title: string; body: React.ReactNode };

function TermsPage(): React.ReactElement {
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const sections: Section[] = [
    { key: 'intro', title: 'Introducción', body: (
      <p>
        Bienvenido a Fixsy Parts. Este documento describe, de forma
        simplificada, los términos y condiciones ficticios de uso del sitio.
        Al navegar o comprar en este entorno de demostración, aceptas estas
        reglas básicas.
      </p>
    ) },
    { key: 'uso', title: 'Uso del sitio', body: (
      <ul>
        <li>El sitio se utiliza con fines de exploración y prueba.</li>
        <li>Precios, stock y compras son ilustrativos (no reales).</li>
        <li>La disponibilidad de contenidos puede variar sin previo aviso.</li>
      </ul>
    ) },
    { key: 'resp', title: 'Responsabilidad del usuario', body: (
      <ul>
        <li>Usar el portal de modo responsable y conforme a la ley.</li>
        <li>No intentar vulnerar la seguridad ni afectar la disponibilidad.</li>
        <li>Respetar la propiedad intelectual y la privacidad de terceros.</li>
      </ul>
    ) },
    { key: 'limit', title: 'Limitación de responsabilidad', body: (
      <p>
        En este entorno de demostración, Fixsy Parts no se responsabiliza por
        daños directos o indirectos derivados del uso del sitio o de la
        imposibilidad de usarlo.
      </p>
    ) },
    { key: 'ip', title: 'Propiedad intelectual', body: (
      <p>
        Marcas, logotipos e imágenes pertenecen a sus titulares. Su uso aquí
        es únicamente ilustrativo y no implica cesión de derechos.
      </p>
    ) },
    { key: 'soporte', title: 'Contacto y soporte', body: (
      <p>
        ¿Dudas o solicitudes? Escríbenos a <strong>soporte@fixsy.cl</strong>
        o contáctanos al <strong>+56 9 1234 5678</strong>. Tu mensaje será
        atendido por el equipo de soporte técnico.
      </p>
    ) },
  ];

  const toggle = (k: string) => setOpen(o => ({ ...o, [k]: !o[k] }));

  return (
    <section className="lp fade-in" style={{ padding: '1rem 1rem 2rem 1rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 className="lp__title">Términos y Condiciones</h1>
      <p className="lp__subtitle">Documento informativo (ficticio) — Modo empresa</p>

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
        .lp p { margin: .5rem 0 0 0; line-height: 1.55; }
      `}</style>
    </section>
  );
}

export default TermsPage;

