import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!serviceKey || !supabaseUrl) {
    return res.status(501).json({ error: 'Admin no configurado en el servidor.' });
  }

  // Verificar que el caller sea el admin.
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado.' });

  // Validar el JWT del usuario con el cliente anon.
  const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || '');
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido.' });
  if (adminEmail && user.email !== adminEmail) return res.status(403).json({ error: 'Acceso denegado.' });

  // Obtener todos los usuarios y sus perfiles con el cliente admin.
  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: profiles, error: profErr } = await adminClient
    .from('user_data')
    .select('id, profile, sessions, updated_at');

  if (profErr) return res.status(500).json({ error: profErr.message });

  const { data: { users }, error: usersErr } = await adminClient.auth.admin.listUsers();
  if (usersErr) return res.status(500).json({ error: usersErr.message });

  // Combinar: auth.users + user_data.profile
  const result = users.map((u) => {
    const pd = profiles.find((p) => p.id === u.id);
    return {
      id: u.id,
      email: u.email,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
      profile: pd?.profile || {},
      totalSessions: pd?.profile?.totalSessions || 0,
      updatedAt: pd?.updated_at || null,
    };
  });

  return res.status(200).json({ users: result });
}
