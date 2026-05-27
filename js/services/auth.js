/* ============================================================
   TRAINERFLOW — SERVICIO DE AUTENTICACIÓN
   ============================================================ */

const AuthService = {

  /* ── Login ── */
  login(email, password) {
    const user = DATA.users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { ok: false, error: 'Email o contraseña incorrectos.' };

    STATE.currentUser = { ...user };
    UTILS.save('session', { id: user.id, email: user.email });

    return { ok: true, user };
  },

  /* ── Logout ── */
  logout() {
    STATE.currentUser = null;
    UTILS.remove('session');
    APP.navigate('landing');
  },

  /* ── Register ── */
  register(data) {
    if (DATA.users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'Ya existe una cuenta con ese email.' };
    }

    const newUser = {
      id: UTILS.uid('u'),
      role: 'trainer',
      plan: data.plan || 'free',
      name: data.name,
      email: data.email,
      password: data.password,
      avatar: Math.floor(Math.random() * 8),
      specialty: '',
      city: '',
      bio: '',
      joinedAt: new Date().toISOString()
    };

    DATA.users.push(newUser);
    STATE.currentUser = { ...newUser };
    UTILS.save('session', { id: newUser.id, email: newUser.email });

    return { ok: true, user: newUser };
  },

  /* ── Restore session ── */
  restoreSession() {
    const saved = UTILS.load('session');
    if (!saved) return false;

    const user = DATA.users.find(u => u.id === saved.id && u.email === saved.email);
    if (!user) { UTILS.remove('session'); return false; }

    STATE.currentUser = { ...user };
    return true;
  },

  /* ── Guard: requiere login ── */
  requireAuth(role = null) {
    if (!STATE.currentUser) {
      APP.navigate('login');
      return false;
    }
    if (role && STATE.currentUser.role !== role) {
      TOAST.show('Acceso no autorizado.', 'error');
      return false;
    }
    return true;
  },

  /* ── Guard: requiere plan ── */
  requirePlan(planId) {
    const order = { free: 0, starter: 1, pro: 2 };
    const userLevel = order[STATE.currentUser?.plan] ?? 0;
    const needed    = order[planId] ?? 0;
    return userLevel >= needed;
  },

  /* ── Actualizar perfil ── */
  updateProfile(fields) {
    if (!STATE.currentUser) return { ok: false };
    const idx = DATA.users.findIndex(u => u.id === STATE.currentUser.id);
    if (idx === -1) return { ok: false };

    DATA.users[idx] = { ...DATA.users[idx], ...fields };
    STATE.currentUser = { ...DATA.users[idx] };
    return { ok: true };
  },

  /* ── Cambiar plan ── */
  changePlan(planId) {
    if (!STATE.currentUser) return { ok: false };
    return this.updateProfile({ plan: planId });
  },

  /* ── Demo login trainer ── */
  demoLogin() {
    return this.login(CONFIG.demoTrainer.email, CONFIG.demoTrainer.password);
  },

  /* ── Demo login client ── */
  demoClientLogin() {
    return this.login(CONFIG.demoClient.email, CONFIG.demoClient.password);
  }
};
