import { ComponenteVue } from '../componente_vue.js';

export class BrEndereco extends ComponenteVue {

    constructor() {
        super(
            {
                templateURL: './br-endereco.html', 
                shadowDOM: true
            }, 
            import.meta.url
        );
    }

}

// Define o novo elemento personalizado
window.customElements.define('br-endereco', BrEndereco);
