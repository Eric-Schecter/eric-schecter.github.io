// 超短版：10 行核心逻辑
(function () {
  const resources = [
    '/assets/audios/bgm.mp3',
  ];

  function loadAll(callback) {
    const promises = resources.map(url => {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then(response => {
            if (response.ok) {
              resolve();
            } else {
              reject(new Error(`HTTP ${response.status}`));
            }
          })
          .catch(reject);
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