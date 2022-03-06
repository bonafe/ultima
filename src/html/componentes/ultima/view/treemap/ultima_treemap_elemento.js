import { UltimaElemento } from '../ultima_elemento.js';

export class UltimaTreemapElemento extends UltimaElemento {


    constructor(){
        super();

        this.addEventListener("carregou", () => {  
        });
    }

   
    renderizar(){
        super.renderizar();
    }
}
customElements.define('ultima-treemap-elemento', UltimaTreemapElemento);