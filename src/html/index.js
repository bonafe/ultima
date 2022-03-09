import { UltimaDB } from './componentes/ultima/db/ultima_db.js';
import { UltimaEvento } from './componentes/ultima/ultima_evento.js';
import { UltimaJS } from './componentes/ultima/ultima_js.js';
import { ComponenteBase } from './componentes/componente_base.js';

window.onload = () => {
  
    const supportsContainerQueries = "container" in document.documentElement.style;
    if (!supportsContainerQueries) {
        import("https://cdn.skypack.dev/container-query-polyfill").then(modulo =>{});
    }    
    
    document.querySelector("#fullscreen").addEventListener("click", () => {
        window.openFullscreen();
    });

    document.querySelector("#configuracao").addEventListener("click", () => {
      document.querySelector("ultima-js").configuracao();
    });

    document.querySelector("#ajuda").addEventListener("click", () => {
      alert (`Última Versão: ${UltimaDB.VERSAO}`);
    });

    document.querySelector("ultima-js").setAttribute("estilos", ComponenteBase.resolverEndereco("./variaveis_estilo_ultima.css", ComponenteBase.extrairCaminhoURL(import.meta.url)));
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