(function () {
  const PARAM = 'theme';
  const NAME = 'bold';
  const LS_KEY = 'wheel-theme';

  function applyTheme(enabled) {
    const html = document.documentElement;
    if (enabled) {
      html.setAttribute('data-theme', NAME);
      ensureThemeCss();
    } else {
      html.removeAttribute('data-theme');
    }
  }

  function ensureThemeCss() {
    if (!document.querySelector('link[data-theme-test]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'theme-test.css';
      link.setAttribute('data-theme-test', '');
      document.head.appendChild(link);
    }
  }

  function initToggle() {
    if (document.getElementById('theme-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    const isOn = document.documentElement.getAttribute('data-theme') === NAME;
    btn.textContent = isOn ? 'Theme: ON' : 'Theme: OFF';
    btn.addEventListener('click', () => {
      const nowOn = document.documentElement.getAttribute('data-theme') !== NAME;
      applyTheme(nowOn);
      btn.textContent = nowOn ? 'Theme: ON' : 'Theme: OFF';
      try { localStorage.setItem(LS_KEY, nowOn ? NAME : ''); } catch {}
    });
    document.body.appendChild(btn);
  }

  // Activate from URL ?theme=bold
  const params = new URLSearchParams(location.search);
  const urlTheme = params.get(PARAM);
  const stored = (() => { try { return localStorage.getItem(LS_KEY); } catch { return null; } })();
  const enable = urlTheme === NAME || stored === NAME;
  if (enable) ensureThemeCss();
  window.addEventListener('DOMContentLoaded', () => {
    applyTheme(enable);
    initToggle();
  });
})();


