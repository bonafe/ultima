import { ComponenteBase } from './componente_base.js';

export class ComponenteVue extends ComponenteBase {
    #vue;    
    #dados;

    constructor(propriedades, url_herdeiro) {
        super(propriedades, url_herdeiro);
                     
        this.#dados = undefined;  

        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, async () => {
            await this.carregarVueSeNecessario();
            this.renderizar();
        });
    }

    renderizar(){

    }

    get dados() {
        return this.#dados;
    }

    set dados(novos_dados) {
        this.dataset.dados = JSON.stringify(novos_dados);       
        this.atualizar_dados(novos_dados);
    }  

    static get observedAttributes() {
        return ['data-dados'];
    }

    attributeChangedCallback(nome_atributo, valor_antigo, valor_novo) {
        if (nome_atributo === 'data-dados') {                      
            this.atualizar_dados(JSON.parse(valor_novo));
        }
    } 

    deve_atualizar(novos_dados) {
        let deve_atualizar = false;

        if (this.#dados !== novos_dados) {
            if (!this.#dados && novos_dados) {
                deve_atualizar = true;
            } else if (JSON.stringify(this.#dados).localeCompare(JSON.stringify(novos_dados)) != 0) {
                deve_atualizar = true;                
            }
        }

        return deve_atualizar;
    }
    
    async atualizar_dados(novos_dados) {
        if (!this.deve_atualizar(novos_dados)) {            
            return;
        }

        await this.carregarVueSeNecessario();

        let dados = JSON.parse(this.dataset.dados);

        console.dir(dados);

        this.#vue = new Vue({
            el: super.no_raiz.querySelector("#vueapp"),
            data() {
                return dados;
            }
        });
    }

    async carregarVueSeNecessario() {
        if (window.Vue) {
            return; // Vue já está carregado, não há necessidade de carregá-lo novamente.
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js';
            script.async = true;
            script.onload = () => {
                console.log('Vue.js carregado da CDN');
                resolve();
            };
            script.onerror = () => reject(new Error('Erro ao carregar Vue.js da CDN'));
            document.head.appendChild(script);
        });
    }
}

window.customElements.define('componente-vue', ComponenteVue);
