import { ComponenteBase } from '../../componente_base.js';
import { Evento } from '../../espaco/evento.js';



export class GeradorUUID extends ComponenteBase {



    constructor(){
        super({templateURL:"./gerador_uuid.html", shadowDOM:true}, import.meta.url);

        this._dados = undefined;


        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, () => {          

            this.uuids = super.no_raiz.querySelector("#uuids");

            super.no_raiz.querySelector("#btnGerar").addEventListener("click", ()=> {
                this.gerarUUID();
            });

            super.no_raiz.querySelector("#btnLimpar").addEventListener("click", ()=> {
                this.limpar();
            });

            this.renderizar();
        });
    }



    renderizar(){
        if (this.uuids && super.carregado && this.dados){     
                        
            this.uuids.textContent = this.dados;
        }
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



    gerarUUID(){
        
        let uuid_gerado = window.crypto.randomUUID();        
        this.uuids.textContent = `${this.uuids.textContent}\n${uuid_gerado}`;
        this.dados = this.uuids.textContent;
        this.salvar();
    }



    limpar(){
        this.uuids.textContent = "";
        this.dados = this.uuids.textContent;
        this.salvar();
    }



    salvar(){
        this.dispatchEvent(new CustomEvent("change", {detail:this.dados}));
    }
}
customElements.define('gerador-uuid', GeradorUUID);