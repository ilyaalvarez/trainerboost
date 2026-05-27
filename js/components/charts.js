/* ============================================================
   TRAINERFLOW — WRAPPERS DE CHART.JS
   Configuración global y helpers para gráficas
   ============================================================ */

const CHARTS = {
  _instances: {},

  /* ── Defaults globales de Chart.js ── */
  init() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color           = '#6B7280';
    Chart.defaults.borderColor     = '#1E1E2E';
    Chart.defaults.font.family     = 'DM Sans, sans-serif';
    Chart.defaults.font.size       = 12;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.tooltip.backgroundColor = '#1A1A24';
    Chart.defaults.plugins.tooltip.borderColor      = '#2A2A3E';
    Chart.defaults.plugins.tooltip.borderWidth      = 1;
    Chart.defaults.plugins.tooltip.titleColor       = '#F0F0F8';
    Chart.defaults.plugins.tooltip.bodyColor        = '#6B7280';
    Chart.defaults.plugins.tooltip.padding          = 10;
    Chart.defaults.plugins.tooltip.cornerRadius     = 8;
  },

  /* ── Destruir instancia existente ── */
  destroy(id) {
    if (this._instances[id]) {
      this._instances[id].destroy();
      delete this._instances[id];
    }
  },

  /* ── Línea: evolución adherencia ── */
  line(canvasId, labels, data, opts = {}) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: opts.label || 'Valor',
          data,
          borderColor: opts.color || '#00FF87',
          backgroundColor: opts.fill || 'rgba(0,255,135,0.08)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: opts.color || '#00FF87',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' } },
          y: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            min: opts.yMin !== undefined ? opts.yMin : undefined,
            max: opts.yMax !== undefined ? opts.yMax : undefined
          }
        },
        plugins: { legend: { display: false } },
        interaction: { mode: 'index', intersect: false }
      }
    });

    this._instances[canvasId] = chart;
    return chart;
  },

  /* ── Línea de peso del cliente ── */
  weightLine(canvasId, clientId) {
    const data = CheckinService.weightChartData(clientId);
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' } },
          y: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { callback: v => `${v} kg` }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} kg`
            }
          }
        },
        interaction: { mode: 'index', intersect: false }
      }
    });
    this._instances[canvasId] = chart;
  },

  /* ── Barras: energía y sueño ── */
  wellnessBars(canvasId, clientId) {
    const data = CheckinService.wellnessChartData(clientId);
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            min: 0, max: 10,
            ticks: { stepSize: 2 }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: { color: '#6B7280', boxWidth: 10, padding: 16 }
          }
        }
      }
    });
    this._instances[canvasId] = chart;
  },

  /* ── Doughnut: distribución objetivos ── */
  goalDoughnut(canvasId) {
    const dist = ClientService.goalDistribution();
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const colors = ['#00FF87','#3B82F6','#FFB800','#FF4444','#22C55E','#a855f7','#ec4899','#14b8a6'];
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: dist.map(d => d.label),
        datasets: [{
          data: dist.map(d => d.value),
          backgroundColor: colors.slice(0, dist.length),
          borderWidth: 2,
          borderColor: '#111118'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { color: '#6B7280', boxWidth: 10, padding: 12, font: { size: 11 } }
          }
        }
      }
    });
    this._instances[canvasId] = chart;
  },

  /* ── Línea: adherencia semanal (dashboard) ── */
  adherenceLine(canvasId) {
    const raw = ClientService.adherenceChartData(8);
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: raw.map(r => r.week),
        datasets: [{
          label: 'Adherencia media %',
          data: raw.map(r => r.avg),
          borderColor: '#00FF87',
          backgroundColor: 'rgba(0,255,135,0.08)',
          borderWidth: 2, tension: 0.4, fill: true,
          pointBackgroundColor: '#00FF87', pointRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, min: 0, max: 100,
               ticks: { callback: v => `${v}%` } }
        },
        plugins: { legend: { display: false } },
        interaction: { mode: 'index', intersect: false }
      }
    });
    this._instances[canvasId] = chart;
  },

  /* ── Barras: retención por cohorte (Analytics) ── */
  retentionBars(canvasId) {
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago'];
    const data   = [100, 92, 88, 85, 83, 80, 78, 76];
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Retención %',
          data,
          backgroundColor: data.map(v =>
            v >= 90 ? 'rgba(0,255,135,0.8)' :
            v >= 75 ? 'rgba(255,184,0,0.8)' :
                      'rgba(255,68,68,0.8)'
          ),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, min: 0, max: 100,
               ticks: { callback: v => `${v}%` } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
};
