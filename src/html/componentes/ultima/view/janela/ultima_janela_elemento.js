import { UltimaElemento } from '../ultima_elemento.js';



export class UltimaJanelaElemento extends UltimaElemento {



    constructor(){
        super();

        this.addEventListener("carregou", () => {  
        });
    }

   
    
    renderizar(){
        super.renderizar();
    }
}
customElements.define('ultima-janela-elemento', UltimaJanelaElemento);