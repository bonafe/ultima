import { ElementoUltima } from '../elemento_ultima.js';

export class ElementoTreeMap extends ElementoUltima {


    constructor(){
        super();

        this.addEventListener("carregou", () => {  
        });
    }

   
    renderizar(){
        super.renderizar();
    }
}
customElements.define('elemento-treemap', ElementoTreeMap);