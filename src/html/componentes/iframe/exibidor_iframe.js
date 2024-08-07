import { ComponenteBase } from '../componente_base.js';
import { Evento } from '../espaco/evento.js';


export class ExibidorIframe extends ComponenteBase {

    constructor(){
        super({templateURL:"./exibidor_iframe.html", shadowDOM:true}, import.meta.url);

        this._dados = undefined;

        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, () => {
            this.iFrame = super.no_raiz.querySelector("iframe");            
            this.atualizarIFrame();
        });
    }

    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

    
        if (nomeAtributo.localeCompare("dados") == 0){
            this.dados = JSON.parse(novoValor);
            this.atualizarIFrame();
        }
    }



    atualizarIFrame(){
        if (this.iFrame && this.dados){
            this.iFrame.setAttribute("src", this.dados.src);    
            /*        
            fetch (this.dados.src).then (resposta =>
                resposta.text().then( htmlPagina => {                    
                    let html_src = 'data:text/html;charset=utf-8,' + htmlPagina;
                    this.iFrame.setAttribute("src" , html_src);
                })
            );
            */
        }
    }
}
customElements.define('exibidor-iframe', ExibidorIframe);