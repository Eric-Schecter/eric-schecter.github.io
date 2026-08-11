// 超短版：10 行核心逻辑
(function () {
  const resources = [
    // audios
    '/assets/audios/bgm.mp3',
    // images
    'images/genshin-start.png',
    'images/ocean-2.png',
    'images/step-viewer.jpg',
    'images/uncharted-waters-2-2.jpg',
    'images/viewer.png',
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