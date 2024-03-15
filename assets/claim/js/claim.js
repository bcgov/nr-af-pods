(function () {
  const src =
    'https://cdn.jsdelivr.net/gh/bcgov/nr-af-pods@dev/powerpod/releases/powerpod-0.8.6.min.js';
  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.src = src;
  document.head.appendChild(script);
})();
