import { Elemento } from '../elemento.js';



export class ElementoJanela extends Elemento {



    constructor(){
        super();

        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, () => {  
        });
    }

   
    
    renderizar(){
        super.renderizar();
    }
}
customElements.define('elemento-janela', ElementoJanela);