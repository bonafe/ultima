import { ComponenteConexaoBidirecionalDados } from '../componente_conexao_bidirecional_dados.js';

export class BrTeste extends ComponenteConexaoBidirecionalDados {

    constructor() {
        super({templateURL: './br-teste.html', shadowDOM: true}, import.meta.url, "dados_teste");
    }

}

// Define o novo elemento personalizado
window.customElements.define('br-teste', BrTeste);
