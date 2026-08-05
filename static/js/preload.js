// 超短版：10 行核心逻辑
(function() {
  const resources = [
    '/assets/audios/bgm.mp3',
  ];

  function loadAll(callback) {
    const promises = resources.map(url => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    });
    
    Promise.allSettled(promises).then(() => {
      if (typeof callback === 'function') callback();
    });
  }

  window.addEventListener('load', () => {
    loadAll(() => console.log('complete'));
  });
})();