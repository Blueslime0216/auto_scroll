chrome.storage.sync.get({
  startKey: 'a',
  stopKey: 's',
  autoStopEnabled: false,
  autoStopSeconds: 10
}, prefs => {
  let scrollIntervalId = null;
  let timeoutId = null;
  let running = false;

  function startScrolling() {
    if (running) return;
    running = true;
    scrollIntervalId = setInterval(() => {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.scrollTo(0, h);
    }, 100);

    if (prefs.autoStopEnabled) {
      timeoutId = setTimeout(stopScrolling, prefs.autoStopSeconds * 1000);
    }

  }

  function stopScrolling() {
    if (!running) return;
    running = false;
    clearInterval(scrollIntervalId);
    if (timeoutId) clearTimeout(timeoutId);

  }

  // 설정 변경을 감지하는 리스너 추가
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.startKey) {
        prefs.startKey = changes.startKey.newValue;
      }
      if (changes.stopKey) {
        prefs.stopKey = changes.stopKey.newValue;
      }
      if (changes.autoStopEnabled) {
        prefs.autoStopEnabled = changes.autoStopEnabled.newValue;
      }
      if (changes.autoStopSeconds) {
        prefs.autoStopSeconds = changes.autoStopSeconds.newValue;
      }
    }
  });

  document.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (!running && key === prefs.startKey.toLowerCase()) {
      startScrolling();
    } else if (running && key === prefs.stopKey.toLowerCase()) {
      stopScrolling();
    }
  });
});
