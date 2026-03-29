/* ============================================================
   SUPABASE CONFIG — METAMAS
   NOTA DE SEGURIDAD: El anon key de Supabase es público por diseño.
   La seguridad real depende de las Row Level Security (RLS) policies
   configuradas en el dashboard de Supabase. Verificar que:
   - Tabla site_data: solo lectura para anon, escritura solo autenticado
   - Tabla productos: solo lectura para anon, escritura solo autenticado
   ============================================================ */

const SUPABASE_URL  = 'https://whoacawjbzbyhaqopyfd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indob2FjYXdqYnpieWhhcW9weWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODY1NzksImV4cCI6MjA4ODc2MjU3OX0.OE9oKeCOsSyjW1_-1bm4SYbkZio35KrIwL2v-LtmImk';

/* No toques nada de acá para abajo */
window.MetamasDB = (function () {
  const { createClient } = window.supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

  return {
    client: sb,

    /* ── Auth ── */
    async login(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async logout() {
      await sb.auth.signOut();
    },
    async getSession() {
      const { data } = await sb.auth.getSession();
      return data.session;
    },

    /* ── Datos ── */
    async getData(key) {
      const { data, error } = await sb
        .from('site_data')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) return null;
      return data ? data.value : null;
    },
    async setData(key, value) {
      const { error } = await sb
        .from('site_data')
        .upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    },

    /* ── Tiempo real ── */
    subscribe(key, callback) {
      return sb
        .channel('site_data_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'site_data', filter: `key=eq.${key}` },
          payload => callback(payload.new?.value)
        )
        .subscribe();
    }
  };
})();
