import { Elemento } from '../elemento.js';



export class ElementoTreemap extends Elemento {



    constructor(){
        super();

        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, () => {  
        });
    }

   
    
    renderizar(){
        super.renderizar();
    }
}
customElements.define('elemento-treemap', ElementoTreemap);