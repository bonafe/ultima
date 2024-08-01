import { ComponenteBase } from '../../componente_base.js';

export class BrImagem extends ComponenteBase {

    constructor() {
        super(
            {
                templateURL: './br_imagem.html', 
                shadowDOM: true
            }, 
            import.meta.url
        );
    }

}

// Define o novo elemento personalizado
window.customElements.define('br-imagem', BrImagem);
