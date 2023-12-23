
import { Espaco } from './componentes/espaco/espaco.js';




window.onload = () => {
  
  //Caso não exista suporte para Container Queries, carrega o polyfill
  //TODO: não carregar da CDN, mas sim do servidor local ou carregar utilizando validação de Hash
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
  window.dispatchEvent(new Evento(Evento.EVENTO_PLAYER_YOUTUBE_CARREGADO,{}));
}