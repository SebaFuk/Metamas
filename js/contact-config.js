/* ================================================================
   contact-config.js — METAMAS
   Carga email y teléfono desde Supabase y los aplica en toda la web.
   Se incluye en todos los HTML ANTES del cierre </body>.
   ================================================================ */

(async function () {
  // Valores hardcodeados como fallback (los actuales del sitio)
  const DEFAULTS = {
    phone: '5493412622980',        // formato E.164 sin +
    phone_display: '341 262-2980', // lo que se muestra al usuario
    email: 'metalurgicamassaccesi@yahoo.com.ar'
  };

  let cfg = { ...DEFAULTS };

  // ── 1. Intentar cargar desde Supabase ──────────────────────────
  try {
    if (window.MetamasDB) {
      const saved = await window.MetamasDB.getData('contact_config');
      if (saved && saved.phone && saved.email) {
        cfg = { ...DEFAULTS, ...saved };
      }
    }
  } catch (e) {
    // Silencioso — usamos defaults
  }

  // ── 2. Aplicar en el DOM ───────────────────────────────────────
  applyContactConfig(cfg);

  // ── 3. Escuchar cambios en tiempo real ─────────────────────────
  try {
    if (window.MetamasDB) {
      window.MetamasDB.subscribe('contact_config', function (newVal) {
        if (newVal && newVal.phone && newVal.email) {
          cfg = { ...DEFAULTS, ...newVal };
          applyContactConfig(cfg);
        }
      });
    }
  } catch (e) { /* silencioso */ }

  // ── 4. Exponer globalmente (para page-contacto.js) ─────────────
  window.MetamasContactCfg = cfg;

  function applyContactConfig(c) {
    window.MetamasContactCfg = c;

    const waUrl    = `https://wa.me/${c.phone}`;
    const mailHref = `mailto:${c.email}`;

    // ── Links de WhatsApp (href) ──
    document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
      // Preservar query string de texto si existe
      const url = new URL(a.href);
      a.href = waUrl + (url.search || '');
    });

    // ── Texto visible del número ──
    document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
      // Solo reemplazar si el texto parece un número de teléfono
      const txt = a.textContent.trim();
      if (/^\+?[\d\s\-\.]{7,}$/.test(txt)) {
        a.textContent = `+54 ${c.phone_display}`;
      }
    });

    // ── Links de email (href) ──
    document.querySelectorAll(`a[href^="mailto:"]`).forEach(a => {
      a.href = mailHref;
      // Si el texto visible es también un email, actualizarlo
      if (a.textContent.trim().includes('@')) {
        a.textContent = c.email;
      }
    });

    // ── Action del formulario de contacto ──
    const form = document.getElementById('contactForm');
    if (form) {
      form.action = `https://formsubmit.co/${c.email}`;
    }

    // ── Carrito: número de WhatsApp para cotización ──
    if (window.MetamasCarritoWA) {
      window.MetamasCarritoWA.number = c.phone;
    }
  }
})();
