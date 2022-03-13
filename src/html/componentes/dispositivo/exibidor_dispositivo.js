import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima_evento.js';



export class ExibidorDispositivo extends ComponenteBase {



    constructor(){
        super({templateURL:"./exibidor_dispositivo.html", shadowDOM:true}, import.meta.url);

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

        }        
    }
}
customElements.define('exibidor-dispositivo', ExibidorDispositivo);