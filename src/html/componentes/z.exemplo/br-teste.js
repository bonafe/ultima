import { ComponenteConexaoBidirecionalDados } from '../componente_conexao_bidirecional_dados.js';

import { BrEndereco } from './br-endereco.js';

export class BrTeste extends ComponenteConexaoBidirecionalDados {

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