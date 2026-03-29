/* ============================================================
   SCHEMA-CATALOGO.JS — METAMAS
   Genera el Product schema de forma dinámica desde los datos
   reales del catálogo (siempre sincronizado con el admin).
   Se ejecuta después de catalogo-data.js.
   ============================================================ */

(function generarSchemaCatalogo() {
  const BASE_URL = 'https://metamas.com.ar';
  const PAGINA   = BASE_URL + '/catalogo.html';

  // Leer los productos actuales (desde admin o defaults)
  const productos = window.MetamasCatalogo
    ? window.MetamasCatalogo.getCatalogo().filter(p => p.visible !== false)
    : [];

  if (!productos.length) return;

  const imagenAbsoluta = (rel) => {
    if (!rel) return BASE_URL + '/assets/img/og.jpg';
    if (rel.startsWith('http')) return rel;
    return BASE_URL + '/' + rel.replace(/^\//, '');
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio",   "item": BASE_URL + "/" },
          { "@type": "ListItem", "position": 2, "name": "Catálogo", "item": PAGINA }
        ]
      },
      {
        "@type": "ItemList",
        "name": "Catálogo de productos Metamas",
        "description": "Productos metálicos industriales fabricados por Metamas SRL en Pérez, Santa Fe",
        "url": PAGINA,
        "numberOfItems": productos.length,
        "itemListElement": productos.map((p, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "Product",
            "name": p.name,
            "description": p.longDesc || p.shortDesc || '',
            "sku": p.id,
            "category": p.category || 'Productos metálicos',
            "image": imagenAbsoluta(Array.isArray(p.images) ? p.images[0] : p.images),
            "url": PAGINA,
            "brand": {
              "@type": "Brand",
              "name": "Metamas"
            },
            "manufacturer": {
              "@type": "Organization",
              "name": "Metamas SRL",
              "url": BASE_URL
            },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "ARS",
              "price": p.price && p.price > 0 ? String(p.price) : undefined,
              "availability": "https://schema.org/InStock",
              "url": PAGINA,
              "seller": {
                "@type": "Organization",
                "name": "Metamas SRL"
              }
            }
          }
        }))
      }
    ]
  };

  // Inyectar en el <head> de forma segura
  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.textContent = JSON.stringify(schema, null, 0);
  document.head.appendChild(tag);
})();
