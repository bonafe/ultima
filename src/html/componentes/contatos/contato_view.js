import { ComponenteBase } from '../componente_base.js';

export class ContatoView extends ComponenteBase {

    constructor(){
        super({templateURL:"./contato_view.html", shadowDOM:true}, import.meta.url);

        this.addEventListener("carregou", () => {                               
        });
    }
}
customElements.define('contato-visualizacao', ContatoView);