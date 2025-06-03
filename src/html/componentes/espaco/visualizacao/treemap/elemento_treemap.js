import { Elemento } from '../elemento.js';
import { ComponenteBase } from '../../../componente_base.js';


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