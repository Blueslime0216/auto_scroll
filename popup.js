document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('setStartKey');
  const stopBtn = document.getElementById('setStopKey');
  const autoStopChk = document.getElementById('autoStopEnabled');
  const autoStopNum = document.getElementById('autoStopSeconds');

  // 상태 표시 메시지
  const showStatus = (message, isError = false) => {
    const statusEl = document.createElement('div');
    statusEl.textContent = message;
    statusEl.style.position = 'fixed';
    statusEl.style.bottom = '10px';
    statusEl.style.left = '50%';
    statusEl.style.transform = 'translateX(-50%)';
    statusEl.style.padding = '8px 12px';
    statusEl.style.borderRadius = '4px';
    statusEl.style.backgroundColor = isError ? '#f44336' : '#4caf50';
    statusEl.style.color = 'white';
    statusEl.style.fontSize = '12px';
    statusEl.style.zIndex = '1000';
    statusEl.style.opacity = '0';
    statusEl.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(statusEl);
    
    setTimeout(() => {
      statusEl.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      statusEl.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(statusEl);
      }, 300);
    }, 2000);
  };

  // 저장된 설정 불러오기
  chrome.storage.sync.get({
    startKey: 'a',
    stopKey: 's',
    autoStopEnabled: false,
    autoStopSeconds: 10
  }, prefs => {
    startBtn.textContent = prefs.startKey.toUpperCase();
    stopBtn.textContent = prefs.stopKey.toUpperCase();
    autoStopChk.checked = prefs.autoStopEnabled;
    autoStopNum.value = prefs.autoStopSeconds;
    autoStopNum.disabled = !prefs.autoStopEnabled;
  });

  function listenKey(button, callback) {
    // 버튼 상태 변경
    button.classList.add('listening');
    button.textContent = '...';
    
    const handler = e => {
      // 특수 키는 제외 (Tab, Alt, Ctrl 등)
      if (['Tab', 'Alt', 'Control', 'Shift', 'Meta', 'CapsLock', 'Escape'].includes(e.key)) {
        return;
      }
      
      button.classList.remove('listening');
      callback(e.key);
      document.removeEventListener('keydown', handler);
    };
    
    document.addEventListener('keydown', handler);
  }

  startBtn.addEventListener('click', () => {
    listenKey(startBtn, key => {
      chrome.storage.sync.set({ startKey: key }, () => {
        startBtn.textContent = key.toUpperCase();
        showStatus('시작 키가 설정되었습니다: ' + key.toUpperCase());
      });
    });
  });

  stopBtn.addEventListener('click', () => {
    listenKey(stopBtn, key => {
      chrome.storage.sync.set({ stopKey: key }, () => {
        stopBtn.textContent = key.toUpperCase();
        showStatus('정지 키가 설정되었습니다: ' + key.toUpperCase());
      });
    });
  });

  autoStopChk.addEventListener('change', () => {
    autoStopNum.disabled = !autoStopChk.checked;
    chrome.storage.sync.set({ autoStopEnabled: autoStopChk.checked }, () => {
      if (autoStopChk.checked) {
        showStatus('자동 정지가 활성화되었습니다');
      } else {
        showStatus('자동 정지가 비활성화되었습니다');
      }
    });
  });

  autoStopNum.addEventListener('input', () => {
    let val = parseInt(autoStopNum.value, 10) || 0;
    
    // 최소값 1초 보장
    if (val < 1) {
      val = 1;
      autoStopNum.value = 1;
    }
    
    chrome.storage.sync.set({ autoStopSeconds: val });
  });
  
  // 입력 필드 포커스 시 자동 선택
  autoStopNum.addEventListener('focus', () => {
    autoStopNum.select();
  });
});