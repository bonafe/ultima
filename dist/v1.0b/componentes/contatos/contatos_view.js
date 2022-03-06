import { ComponenteBase } from '../componente_base.js';

export class ContatosView extends ComponenteBase {

    constructor(){
        super({templateURL:"/componentes/contatos/contatos_view.html", shadowDOM:true});

        this.addEventListener("carregou", () => {                               
        });
    }
}
customElements.define('contatos-view', ContatosView);