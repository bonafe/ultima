
import { UltimaJS } from './componentes/ultima/ultima_js.js';




window.onload = () => {
  
    const supportsContainerQueries = "container" in document.documentElement.style;
    if (!supportsContainerQueries) {
        import("https://cdn.skypack.dev/container-query-polyfill").then(modulo =>{});
    }              
}



window.openFullscreen = () => {
    let elemento = document.querySelector("ultima-js");
    if (!document.fullscreenElement) {
        elemento.requestFullscreen().catch(err => {
          alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
}



function onYouTubeIframeAPIReady() {
  window.dispatchEvent(new UltimaEvento(UltimaEvento.EVENTO_PLAYER_YOUTUBE_CARREGADO,{}));
}