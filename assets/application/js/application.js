(function () {
  const src =
    'https://cdn.jsdelivr.net/gh/bcgov/nr-af-pods@dev/powerpod/releases/powerpod-2.3.4.min.js';
  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.src = src;
  document.head.appendChild(script);
})();
