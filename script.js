// Smooth-Scroll für Navigationslinks
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    window.scrollTo({
      top: target.offsetTop - 72,
      behavior: 'smooth',
    });
  });
});

// Kontaktformular (Mock)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert(
      'Danke für dein Interesse an Algemate! In einer echten Version würde die Nachricht jetzt an dein Backend gesendet werden.'
    );
    contactForm.reset();
  });
}

// Scroll-Fade-In (IntersectionObserver)
const revealElements = document.querySelectorAll('.hero-inner, .section-inner');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealElements.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
} else {
  revealElements.forEach((el) => el.classList.add('visible'));
}

// Algebot Chat-Widget Konfiguration
window.ChatWidgetConfig = {
  webhook: {
    // HIER deine funktionierende n8n-Webhook-URL eintragen
    url: 'https://lordm33.app.n8n.cloud/webhook/Micbot',
    route: '',
  },
  branding: {
    logo: '/AlgemateLogo.png',
    name: 'Algebot',
    welcomeText: 'Gerne helfen wir weiter! 😊 Schreib mir einfach deine Frage zu Algemate.',
    responseTimeText: 'Algebot antwortet normalerweise innerhalb weniger Augenblicke.',
  },
  style: {
    primaryColor: '#00c853',
    secondaryColor: '#00c853',
    position: 'right',
    backgroundColor: '1f212a',
    fontColor: '#f7f7fa',
  },
};

// Algebot Chat-Widget (basiert auf deinem funktionierenden Beispiel)
(function () {
  if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', 'user-' + Math.random().toString(36).substr(2, 9));
  }
  const sessionId = sessionStorage.getItem('sessionId');

  const config = window.ChatWidgetConfig || {};
  const webhook = config.webhook || {};
  const branding = config.branding || {};
  const style = config.style || {};

  const webhookUrl = webhook.url || '';
  const primaryColor = style.primaryColor || '#00c853';
  const bgColor = style.backgroundColor
    ? style.backgroundColor.startsWith('#')
      ? style.backgroundColor
      : '#' + style.backgroundColor
    : '#1f212a';
  const fontColor = style.fontColor || '#f7f7fa';
  const position = style.position === 'left' ? 'left' : 'right';

  if (!webhookUrl) {
    console.warn('Algebot: Keine Webhook-URL konfiguriert.');
    return;
  }

  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'chat-widget';
  widgetContainer.style.cssText = `
      position: fixed;
      ${position}: 24px;
      bottom: 24px;
      z-index: 9999;
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  `;

  const chatButton = document.createElement('div');
  chatButton.id = 'chat-button';
  chatButton.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 22px;
      background: linear-gradient(135deg, ${primaryColor}, #00e676);
      cursor: pointer;
      box-shadow: 0 18px 45px rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
  `;
  chatButton.innerHTML = `<img src="${branding.logo || ''}" alt="Chat"
      style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;">`;
  chatButton.onmouseenter = () => {
    chatButton.style.transform = 'translateY(-1px) scale(1.05)';
    chatButton.style.boxShadow = '0 22px 55px rgba(0,0,0,0.9)';
  };
  chatButton.onmouseleave = () => {
    chatButton.style.transform = 'scale(1)';
    chatButton.style.boxShadow = '0 18px 45px rgba(0,0,0,0.8)';
  };

  const chatWindow = document.createElement('div');
  chatWindow.id = 'chat-window';
  chatWindow.style.cssText = `
      position: absolute;
      bottom: 80px;
      ${position}: 0;
      width: 320px;
      height: 450px;
      background-color: ${bgColor};
      border-radius: 24px;
      box-shadow: 0 24px 70px rgba(0,0,0,0.9);
      display: none;
      flex-direction: column;
      overflow: hidden;
      color: ${fontColor};
      border: 1px solid rgba(255,255,255,0.1);
  `;

  const chatHeader = document.createElement('div');
  chatHeader.style.cssText = `
      background-color: ${primaryColor};
      color: white;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 14px;
  `;
  chatHeader.innerHTML = `
      <img src="${branding.logo}" alt="Logo"
          style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">
      <div style="display:flex;flex-direction:column;gap:2px;">
        <span>${branding.name || 'Algebot'}</span>
        <span style="font-size:11px;font-weight:400;opacity:0.8;">Dein Algemate Assistent</span>
      </div>
      <span style="margin-left:auto; font-size:20px; cursor:pointer;" id="close-chat">×</span>
  `;

  const messagesArea = document.createElement('div');
  messagesArea.style.cssText = `
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background-color: ${bgColor};
  `;

  const welcomeMsg = document.createElement('div');
  welcomeMsg.style.cssText = `
      background-color: rgba(255,255,255,0.06);
      color: ${fontColor};
      align-self: flex-start;
      padding: 8px 12px;
      border-radius: 18px 18px 18px 4px;
      max-width: 80%;
      font-size: 13px;
  `;
  welcomeMsg.textContent = branding.welcomeText || 'Hallo, ich bin Algebot. Wie kann ich dir helfen?';

  const responseHint = document.createElement('div');
  responseHint.style.cssText = `
      font-size: 11px;
      color: #a5a8b7;
      margin-top: 4px;
      text-align: center;
  `;
  responseHint.textContent = branding.responseTimeText || '';

  messagesArea.appendChild(welcomeMsg);
  messagesArea.appendChild(responseHint);

  const inputArea = document.createElement('div');
  inputArea.style.cssText = `
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 10px;
      display: flex;
      background: #111217;
  `;

  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.placeholder = 'Nachricht an Algebot...';
  inputField.style.cssText = `
      flex: 1;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      padding: 8px 14px;
      outline: none;
      background: #181a22;
      color: ${fontColor};
      font-size: 13px;
  `;

  const sendButton = document.createElement('button');
  sendButton.textContent = '➤';
  sendButton.style.cssText = `
      background: ${primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      margin-left: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
  `;

  inputArea.appendChild(inputField);
  inputArea.appendChild(sendButton);
  chatWindow.appendChild(chatHeader);
  chatWindow.appendChild(messagesArea);
  chatWindow.appendChild(inputArea);
  widgetContainer.appendChild(chatButton);
  widgetContainer.appendChild(chatWindow);
  document.body.appendChild(widgetContainer);

  let isOpen = false;

  chatButton.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
  });

  document.getElementById('close-chat').addEventListener('click', () => {
    isOpen = false;
    chatWindow.style.display = 'none';
  });

  async function sendMessage(message) {
    if (!message.trim()) return;

    const userBubble = document.createElement('div');
    userBubble.style.cssText = `
        background: linear-gradient(135deg, ${primaryColor}, #00e676);
        color: #020306;
        align-self: flex-end;
        padding: 8px 12px;
        border-radius: 18px 18px 4px 18px;
        max-width: 80%;
        font-size: 13px;
        word-wrap: break-word;
    `;
    userBubble.textContent = message;
    messagesArea.appendChild(userBubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    inputField.value = '';

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: message,
          sessionId: sessionId,
        }),
      });

      let replyText = '🤖 Keine Antwort erhalten.';
      if (response.ok) {
        const data = await response.json();
        replyText =
          data.output ||
          data.response ||
          data.message ||
          data.text ||
          JSON.stringify(data);
      } else {
        replyText = `❌ Fehler: ${response.status} ${response.statusText}`;
      }

      const botBubble = document.createElement('div');
      botBubble.style.cssText = `
          background-color: rgba(255,255,255,0.06);
          color: ${fontColor};
          align-self: flex-start;
          padding: 8px 12px;
          border-radius: 18px 18px 18px 4px;
          max-width: 80%;
          font-size: 13px;
          margin-top: 5px;
      `;
      botBubble.textContent = replyText;
      messagesArea.appendChild(botBubble);
      messagesArea.scrollTop = messagesArea.scrollHeight;
    } catch (error) {
      const errorBubble = document.createElement('div');
      errorBubble.style.cssText = `
          background-color: #f8d7da;
          color: #721c24;
          align-self: flex-start;
          padding: 8px 12px;
          border-radius: 18px;
          max-width: 80%;
          font-size: 13px;
      `;
      errorBubble.textContent = '❌ Netzwerkfehler. Webhook nicht erreichbar?';
      messagesArea.appendChild(errorBubble);
      messagesArea.scrollTop = messagesArea.scrollHeight;
      console.error('Algebot Fehler:', error);
    }
  }

  sendButton.addEventListener('click', () => sendMessage(inputField.value));
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(inputField.value);
  });
})();