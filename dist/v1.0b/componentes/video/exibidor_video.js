import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';


export class ExibidorVideo extends ComponenteBase {

    constructor(){
        super({templateURL:"./exibidor_video.html", shadowDOM:false}, import.meta.url);

        this._dados = undefined;
        this.ultimoTempo = 0;

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
            
            this.carregarComponenteVideo();                 
        }

        this.processarAcoes();
    }

    carregarComponenteVideo(){

        this.inicializarAcoes();

        this.componenteVideo = 
            new YT.Player(
                this.noRaiz.querySelector("#video"), 
                {                  
                    videoId: this.dados.src,
                    events: {
                        'onReady': evento =>{
                            //TODO: deve mesmo começar sempre o vídeo? #ficadica
                            evento.target.playVideo();
                            this.renderizar();
                        },
                        'onStateChange': evento =>{

                            this.estadoAtualPlayerVideo = evento.data;
                            this.renderizar();


                            switch (this.estadoAtualPlayerVideo){

                                case YT.PlayerState.BUFFERING:
                                    console.log("BUFFERING");
                                break;

                                case YT.PlayerState.CUED:
                                    console.log("CUED");
                                break;

                                case YT.PlayerState.ENDED:
                                    console.log("ENDED");
                                break;

                                case YT.PlayerState.PAUSED:
                                    console.log("PAUSED");
                                break;

                                case YT.PlayerState.PLAYING:
                                    console.log("PLAYING");
                                break;

                                case YT.PlayerState.UNSTARTED:
                                    console.log("UNSTARTED");
                                break;
                            }                            
                        }
                    }
                }
            );  
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

                if (this.estadoAtualPlayerVideo == YT.PlayerState.PLAYING){

                    this.tempoAtualVideo = this.componenteVideo.getCurrentTime();

                    //Se o tempo atual é menor que o último tempo registrado
                    if (this.tempoAtualVideo < this.ultimoTempo){
                        //Significa que voltou o video
                        //Zera a execução das ações do vídeo do ponto atual para frente
                        this.dados.acoes.filter (acao => acao.tempo >= this.tempoAtualVideo)
                            .forEach(acao => {
                                acao.executada = false;
                            });
                    }
                    this.ultimoTempo = this.tempoAtualVideo;
                                        
                    //Executa as ações que aconteceram desde a última vez que rodou
                    this.dados.acoes.filter (acao => !acao.executada && (acao.tempo < this.tempoAtualVideo))
                        .forEach(acao => {                            
                            acao.executada = true;
                            this.dispatchEvent (new UltimaEvento(UltimaEvento.EVENTO_EXECUTAR_ACAO, acao));
                        });      
                    
                    //Verifica ações 10 vezes por segundo
                    setTimeout(this.processarAcoes.bind(this), 300);
                }          
            }
        }
    }
}
customElements.define('exibidor-video', ExibidorVideo);