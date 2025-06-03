import { ComponenteReativo } from '../componente_reativo.js';

import { BrEndereco } from './br-endereco.js';

export class BrTeste extends ComponenteReativo {

    constructor() {
        super(
            {
                templateURL: './br-teste.html', 
                shadowDOM: true
            }, 
            import.meta.url
        );
    }

}

// Define o novo elemento personalizado
window.customElements.define('br-teste', BrTeste);
