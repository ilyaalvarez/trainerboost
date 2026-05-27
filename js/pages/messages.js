/* ============================================================
   TRAINERFLOW — MENSAJES / CHAT
   ============================================================ */

const MessagesPage = {
  _activeConvId: null,

  render() {
    const convs = DATA.messages;
    if (STATE.activeConvId) {
      this._activeConvId = STATE.activeConvId;
      STATE.activeConvId = null;
    }
    if (!this._activeConvId && convs.length) {
      this._activeConvId = convs[0].convId;
    }

    const activeConv = convs.find(c => c.convId === this._activeConvId);
    const activeClient = activeConv ? ClientService.getById(activeConv.clientId) : null;

    return `
    <div id="messages-view" class="animate-in">
      <div class="page-header" style="margin-bottom:var(--space-4)">
        <div>
          <div class="page-title">Mensajes</div>
          <div class="page-subtitle">${convs.length} conversaciones</div>
        </div>
      </div>

      <div class="messages-layout">
        <!-- Conversation list -->
        <div class="conv-list">
          <div style="padding:var(--space-3)">
            <div class="input-wrap">
              ${UTILS.icon('search', 14)}
              <input class="form-input" placeholder="Buscar..." style="font-size:13px;padding:7px 36px">
            </div>
          </div>
          ${convs.map(c => this._renderConvItem(c)).join('')}
        </div>

        <!-- Chat area -->
        <div class="chat-area">
          ${activeConv && activeClient ? this._renderChat(activeConv, activeClient) : `
            <div class="flex-1 flex items-center justify-center text-center text-muted p-8">
              ${UTILS.icon('message-circle', 40, 'display:block;margin:0 auto 12px;color:var(--text-muted)')}
              <div>Selecciona una conversación para empezar</div>
            </div>`}
        </div>
      </div>
    </div>`;
  },

  _renderConvItem(conv) {
    const c = ClientService.getById(conv.clientId);
    if (!c) return '';
    const last = conv.messages[conv.messages.length - 1];
    const isActive = conv.convId === this._activeConvId;

    return `
    <div class="conv-item ${isActive ? 'active' : ''}" onclick="MessagesPage.selectConv('${conv.convId}')">
      <div class="avatar avatar-${c.avatar}" style="width:38px;height:38px;font-size:13px;flex-shrink:0">${UTILS.initials(c.name)}</div>
      <div style="flex:1;min-width:0">
        <div class="flex justify-between items-center">
          <span class="conv-item-name">${UTILS.esc(c.name)}</span>
          <span class="conv-item-time">${last ? UTILS.timeAgo(last.timestamp) : ''}</span>
        </div>
        <div class="conv-item-preview truncate">${last ? UTILS.esc(UTILS.truncate(last.text, 45)) : 'Sin mensajes'}</div>
      </div>
      ${conv.unread ? `<span class="badge badge-accent" style="font-size:9px;flex-shrink:0">${conv.unread}</span>` : ''}
    </div>`;
  },

  _renderChat(conv, client) {
    const u = STATE.currentUser;
    const days = UTILS.daysSince(client.lastCheckin);

    return `
    <div class="chat-header">
      <div class="avatar avatar-${client.avatar}" style="width:38px;height:38px;font-size:13px">${UTILS.initials(client.name)}</div>
      <div style="flex:1">
        <div class="font-semibold">${UTILS.esc(client.name)}</div>
        <div class="text-xs" style="color:var(--success)">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--success);margin-right:4px"></span>
          ${UTILS.esc(client.goal)}
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm btn-icon" onclick="MessagesPage.viewProfile('${client.id}')" title="Ver perfil">
          ${UTILS.icon('user', 15)}
        </button>
        <button class="btn btn-outline btn-sm btn-icon" onclick="MessagesPage.assignRoutine('${client.id}')" title="Rutina">
          ${UTILS.icon('dumbbell', 15)}
        </button>
      </div>
    </div>

    <div class="chat-messages" id="chat-messages-${conv.convId}">
      ${conv.messages.map(msg => {
        const isMine = msg.senderId === u?.id;
        return `
        <div class="message-row ${isMine ? 'mine' : ''}">
          ${!isMine ? `<div class="avatar avatar-${client.avatar}" style="width:28px;height:28px;font-size:10px;flex-shrink:0">${UTILS.initials(client.name)}</div>` : ''}
          <div>
            <div class="msg-bubble ${isMine ? 'mine' : 'theirs'}">${UTILS.esc(msg.text)}</div>
            <div class="msg-time">${UTILS.timeAgo(msg.timestamp)}</div>
          </div>
          ${isMine ? `<div class="avatar avatar-0" style="width:28px;height:28px;font-size:10px;flex-shrink:0">${UTILS.initials(u?.name||'?')}</div>` : ''}
        </div>`;
      }).join('')}
    </div>

    <div class="chat-input-area">
      <div class="quick-replies mb-2">
        ${['¡Buen trabajo! 💪', '¿Cómo fue la semana?', 'Recuerda tu check-in', 'Descansa mañana'].map(t => `
          <div class="quick-reply" onclick="MessagesPage.setQuickReply('${UTILS.esc(t)}')">${t}</div>
        `).join('')}
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="msg-input-${conv.convId}"
               placeholder="Escribe un mensaje..."
               onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();MessagesPage.sendMsg('${conv.convId}')}">
        <button class="chat-send-btn" onclick="MessagesPage.sendMsg('${conv.convId}')">
          ${UTILS.icon('send', 16)}
        </button>
      </div>
    </div>`;
  },

  selectConv(convId) {
    this._activeConvId = convId;
    // Mark as read
    const conv = DATA.messages.find(c => c.convId === convId);
    if (conv) conv.unread = 0;
    APP.renderCurrentView();
    // Scroll to bottom
    requestAnimationFrame(() => {
      const msgs = document.getElementById(`chat-messages-${convId}`);
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  },

  sendMsg(convId) {
    const input = document.getElementById(`msg-input-${convId}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const conv = DATA.messages.find(c => c.convId === convId);
    if (!conv) return;

    conv.messages.push({
      id: UTILS.uid('msg'),
      senderId: STATE.currentUser?.id,
      text,
      timestamp: new Date().toISOString(),
      read: false
    });

    input.value = '';
    APP.renderCurrentView();
    requestAnimationFrame(() => {
      const msgs = document.getElementById(`chat-messages-${convId}`);
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  },

  setQuickReply(text) {
    const convId = this._activeConvId;
    const input = document.getElementById(`msg-input-${convId}`);
    if (input) { input.value = text; input.focus(); }
  },

  viewProfile(clientId) {
    ClientsPage._detailTab = 'resumen';
    STATE.activeClientId = clientId;
    APP.navigate('clients');
  },

  assignRoutine(clientId) {
    ClientsPage._currentClientId = clientId;
    ClientsPage._detailTab = 'rutinas';
    STATE.activeClientId = clientId;
    APP.navigate('clients');
  },

  afterRender() {
    UTILS.initIcons();
    // Auto-scroll al fondo del chat activo
    requestAnimationFrame(() => {
      const msgs = document.getElementById(`chat-messages-${this._activeConvId}`);
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  }
};
