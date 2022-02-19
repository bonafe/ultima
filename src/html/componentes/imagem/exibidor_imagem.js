import { ComponenteBase } from '../componente_base.js';
import { UltimaEvento } from '../ultima/ultima.js';


export class ExibidorImagem extends ComponenteBase {

    constructor(){
        super({templateURL:"/componentes/imagem/exibidor_imagem.html", shadowDOM:true});

        this._dados = undefined;

        this.addEventListener("carregou", () => {
            this.img = this.noRaiz.querySelector("img");            
            this.atualizarImg();
        });
    }

    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

    
        if (nomeAtributo.localeCompare("dados") == 0){
            this.dados = JSON.parse(novoValor);
            this.atualizarImg();
        }
    }



    atualizarImg(){
        if (this.img && this.dados){
            this.img.setAttribute("src", this.dados.src);    
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
customElements.define('exibidor-imagem', ExibidorImagem);