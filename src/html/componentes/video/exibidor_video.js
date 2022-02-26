import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';


export class ExibidorVideo extends ComponenteBase {

    constructor(){
        super({templateURL:"/componentes/video/exibidor_video.html", shadowDOM:false});

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
            
                this.inicializarAcoes();

                this.componenteVideo = 
                    new YT.Player(
                        this.noRaiz.querySelector("#video"), 
                        {                  
                            videoId: this.dados.src,
                            events: {
                                'onReady': evento =>{
                                    evento.target.playVideo();
                                },
                                'onStateChange': evento =>{
                                    this.renderizar();
                                }
                            }
                        }
                    );                
        }

        this.processarAcoes();
    }



    inicializarAcoes(){
        if (this.dados.acoes){        
            this.dados.acoes.forEach(acao => {
                acao.executada = false;
            });
        }
    }



    processarAcoes(){
        if (this.dados && this.componenteVideo){

            //TODO: esse IF pode ir para a condição de cima? dá para garantir a ordem que vai acontecer em javascript?            
            if (this.dados.acoes){ 

                try{
                    console.log (`Tempo Atual: ${this.componenteVideo.getCurrentTime()}`);
                }catch(e){}
                //this.tempoAtualVideo = this.componenteVideo.getCurrentTime();

                this.dados.acoes.filter (acao => !acao.executada && (acao.tempo < this.tempoAtualVideo))
                    .forEach(acao => {
                        this.dispatchEvent (UltimaEvento.EVENTO_EXECUTAR_ACAO, acao);
                    });                
            }
        }
    }
}
customElements.define('exibidor-video', ExibidorVideo);