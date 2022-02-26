import { UltimaDAO } from './componentes/ultima/ultima_dao.js';
import { UltimaEvento } from './componentes/ultima/ultima_evento.js';
import { UltimaView } from './componentes/ultima/ultima_view.js';
window.onload = () => {
  
    const supportsContainerQueries = "container" in document.documentElement.style;
    if (!supportsContainerQueries) {
        import("https://cdn.skypack.dev/container-query-polyfill").then(modulo =>{});
    }    
    
    document.querySelector("#fullscreen").addEventListener("click", () => {
        window.openFullscreen();
    });
    document.querySelector("#configuracao").addEventListener("click", () => {
      document.querySelector("ultima-view").configuracao();
    });
    document.querySelector("#ajuda").addEventListener("click", () => {
      alert (`Última Versão: ${UltimaDAO.VERSAO}`);
    });
}

window.openFullscreen = () => {
    let elemento = document.querySelector("ultima-view");
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