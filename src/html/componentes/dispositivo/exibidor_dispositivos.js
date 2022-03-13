import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';
import { ExibidorDispositivo } from './exibidor_dispositivo.js';


export class ExibidorDispositivos extends ComponenteBase {



    constructor(){
        super({templateURL:"./exibidor_dispositivos.html", shadowDOM:true}, import.meta.url);

        this.video = undefined;        

        this.addEventListener("carregou", () => {            

            this.renderizar();
        });
    }



    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

    
        if (nomeAtributo.localeCompare("dados") == 0){

            this.dados = JSON.parse(novoValor);
        }
    }



    


    renderizar(){
        
        if (this.carregado && !this.renderizado){
            
            this.preencherDispositivos().then(()=>{
                
            });
        }        
    }




    preencherDispositivos(){
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.enumerateDevices().then( dispositivos => {
        
                let ul = this.noRaiz.querySelector("#dispositivos");   

                dispositivos.forEach( dispositivo => {

                    if (dispositivo.kind === 'videoinput') {
                        const li = document.createElement('li');
                        ul.appendChild (li);

                        const exibidorDispositivo = document.createElement('exibidor-dispositivo');
                        li.appendChild (exibidorDispositivo);

                        exibidorDispositivo.setAttribute("dados",JSON.stringify(dispositivo));                                                
                    }
                });               

                this.renderizado = true;
                resolve(true);
            });
        });
    }



    stopMediaTracks(stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }


    salvarEstado(){
        console.log(`Salvando câmera: ${this.cameras.value}`);
        this.dados = {deviceId: this.cameras.value};
        this.dispatchEvent(new CustomEvent("change", {detail:this.dados}));
    }
}
customElements.define('exibidor-dispositivos', ExibidorDispositivos);