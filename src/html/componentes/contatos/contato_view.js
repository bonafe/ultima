import { ComponenteBase } from '../componente_base.js';

export class ContatoView extends ComponenteBase {

    constructor(){
        super({templateURL:"/componentes/contatos/contato_view.html", shadowDOM:true});

        this.addEventListener("carregou", () => {                               
        });
    }
}
customElements.define('contato-view', ContatoView);