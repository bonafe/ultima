import { ComponenteBase } from '../componente_base.js';

export class ContatosView extends ComponenteBase {

    constructor(){
        super({templateURL:"./contatos_view.html", shadowDOM:true}, import.meta.url);

        this.addEventListener("carregou", () => {                               
        });
    }
}
customElements.define('contatos-view', ContatosView);