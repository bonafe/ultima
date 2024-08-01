import { ComponenteConexaoBidirecionalDados } from '../componente_conexao_bidirecional_dados.js';

export class BrEndereco extends ComponenteConexaoBidirecionalDados {

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
