import { ComponenteBase } from '../../../componente_base.js';
import { Evento } from '../../../espaco/evento.js';



export class VisualizadorDiferencasJSON extends ComponenteBase {



    constructor(){
        super({templateURL:"./visualizador_diferencas_json.html", shadowDOM:true}, import.meta.url);

        this._dados = undefined;

        this.addEventListener("carregou", () => {

            //TODO: Não funciona com IMPORT, está tendo que importar no index.html
            //Importa dinamicamente a biblioteca jsondiffpatch
            /*
            import(ComponenteBase.resolverEndereco('../../../../bibliotecas/jsondiffpatch/jsondiffpatch.umd.min.js', import.meta.url))
                .then(modulo => {
                    window.jsondiffpatch = modulo;
                    this.modulo = modulo;                   
                })
                .finally(()=> this.renderizar());
            */
            this.renderizar();
        });
    }



    get dados(){
        return this._dados;
    }



    set dados(novosDados){
        this._dados = novosDados;
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

        if (this.dados && super.carregado){

            if (!(this.dados.esquerda && this.dados.direita)){

                console.error (`Conteúdo inválido no atributo 'dados'. Deve ser: {esquerda:objetoX, direita:objetoY}`);

            }else{                

                let container = this.noRaiz.querySelector("#editorJSON");            
                let delta = jsondiffpatch.diff(this.dados.esquerda, this.dados.direita);

                // beautiful html diff
                this.noRaiz.querySelector('#diferencaEmHTML').innerHTML = jsondiffpatch.formatters.html.format(delta, this.dados.esquerda);

                // self-explained json
                //this.noRaiz.querySelector('#diferencaEmJSON').innerHTML = jsondiffpatch.formatters.annotated.format(delta, this.dados.esquerda);              
            }
        }        
    }
}
customElements.define('visualizador-diferencas-json', VisualizadorDiferencasJSON);