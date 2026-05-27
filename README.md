# TrainerFlow 🏋️

**La plataforma de gestión para entrenadores personales hispanohablantes.**

> Gestiona. Fideliza. Escala.

---

## 🚀 Inicio rápido

Abre `index.html` directamente en tu navegador. No necesita servidor ni npm.

```bash
# Opcionalmente con servidor local para evitar restricciones CORS:
npx serve .
# o
python3 -m http.server 8080
```

---

## 📁 Estructura del proyecto

```
trainerboost/
├── index.html              # Punto de entrada
├── css/
│   ├── main.css            # Solo @imports (orquestador)
│   ├── base/               # Variables, reset, tipografía
│   ├── layout/             # Grid, shell de app
│   ├── components/         # Botones, cards, forms, modals, toasts
│   └── pages/              # Estilos específicos por vista
└── js/
    ├── config.js           # Constantes y configuración
    ├── utils.js            # Helpers transversales
    ├── store/state.js      # Estado global y datos de ejemplo
    ├── services/           # Lógica de negocio (auth, clients, etc.)
    ├── components/         # Componentes UI (toast, modal, charts...)
    ├── pages/              # Vistas (landing, auth, dashboard...)
    └── app.js              # Router principal + init
```

---

## 👤 Cuentas de demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Entrenador (Pro) | `trainer@demo.com` | `demo123` |
| Cliente | `cliente@demo.com` | `demo123` |

---

## 🛠️ Stack técnico

- **Vanilla JS** — sin frameworks, sin build step
- **CSS modular** — design tokens, componentes, páginas
- **Chart.js** — gráficas de progreso y análisis
- **Lucide Icons** — iconografía consistente
- **Google Fonts** — Bebas Neue + DM Sans

---

## 📋 Planes

| Plan | Clientes | Precio |
|------|----------|--------|
| Free | Hasta 3 | Gratis |
| Starter | Hasta 20 | 14€/mes |
| Pro | Ilimitados | 29€/mes |

---

## 🗺️ Roadmap

- [ ] Integración WhatsApp Business API
- [ ] Exportación PDF de rutinas
- [ ] App móvil nativa
- [ ] Integración con Stripe real
- [ ] Google Calendar sync
