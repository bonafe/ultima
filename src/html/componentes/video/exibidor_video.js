import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';


export class ExibidorVideo extends ComponenteBase {

    constructor(){
        super({templateURL:"/componentes/video/exibidor_video.html", shadowDOM:true});

        this._dados = undefined;

        this.addEventListener("carregou", () => {
            
            window.addEventListener(UltimaEvento.EVENTO_PLAYER_YOUTUBE_CARREGADO, ()=> this.renderizar());
            this.renderizar();
        });
    }

    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

    
        if (nomeAtributo.localeCompare("dados") == 0){
            this.dados = JSON.parse(novoValor);
            this.renderizar();
        }
    }



    renderizar(){

        //TODO: lidar com mudanças nos valores dos dados
        //Se todos os elementos estão prontos e nenhum componente de vídeo foi criado
        if (this.carregado && YT && this.dados && !this.componenteVideo){
            
                this.componenteVideo = 
                    new YT.Player(
                        this.noRaiz.querySelector("#video"), 
                        {                  
                            videoId: this.dados.src
                        }
                    );                 
        }
    }
}
customElements.define('exibidor-video', ExibidorVideo);