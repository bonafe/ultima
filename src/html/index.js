import { UltimaView } from './componentes/ultima/ultima_view.js';
window.onload = () => {
  
    const supportsContainerQueries = "container" in document.documentElement.style;
    if (!supportsContainerQueries) {
        import("https://cdn.skypack.dev/container-query-polyfill").then(modulo =>{});
    }    
    
    document.querySelector("#fullscreen").addEventListener("click", () => {
        window.openFullscreen();
    });
}

window.openFullscreen = () => {
    let elemento = document.querySelector(".secao_principal");
    if (!document.fullscreenElement) {
        elemento.requestFullscreen().catch(err => {
          alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
}