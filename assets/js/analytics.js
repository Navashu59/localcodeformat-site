(function () {
  const measurementId = "G-MW9GXLHC76";
  if (!measurementId) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;
  gtag("js", new Date());
  gtag("config", measurementId, { anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
  document.head.appendChild(script);
})();
