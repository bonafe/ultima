import { ComponenteBase } from './componente_base.js'; // Ajuste o caminho conforme necessário

export class ComponenteConexaoBidirecionalDados extends ComponenteBase {
    #dados;
    #listeners;
    #nome_atributo;
    #observer;

    constructor(propriedades, url_herdeiro, nome_atributo = 'dados') {
        super(propriedades, url_herdeiro);
        this.#dados = undefined;
        this.#listeners = [];
        this.#nome_atributo = nome_atributo;

        // Define o getter e setter dinamicamente
        Object.defineProperty(this, this.#nome_atributo, {
            get: () => this.#dados,
            set: (novosDados) => {
                setTimeout(() => {
                    this.atualizarDados(this.#dados, novosDados);
                    this.#dados = novosDados;
                });
            }
        });

        // Inicializa o MutationObserver
        this.#observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === this.#nome_atributo) {
                    const dadosAtuais = mutation.oldValue;
                    const novosDados = this.getAttribute(this.#nome_atributo);
                    this.atualizarDados(dadosAtuais, novosDados);
                }
            }
        });

        // Configura o MutationObserver para observar mudanças de atributos
        const config = { attributes: true, attributeOldValue: true };
        this.#observer.observe(this, config);
    }

    // Realiza a atualização inicial dos dados
    atualizacaoInicial() {
        this.atualizarDados(null, this.#dados);
    }

    // Atualiza os dados dos elementos vinculados
    atualizarDados(dadosAtuais, novosDados) {
        const elementos = this.noRaiz.querySelectorAll("[data-bind]");
        elementos.forEach(elemento => {
            const jsonDataBind = JSON.parse(elemento.dataset.bind);
            Object.entries(jsonDataBind).forEach(([propriedadeElemento, caminhoDados]) => {
                const valorAtual = dadosAtuais ? this.obterValor(dadosAtuais, caminhoDados.split(".")) : null;
                const novoValor = this.obterValor(novosDados, caminhoDados.split("."));

                if (valorAtual !== novoValor) {
                    if (propriedadeElemento === "textContent") {
                        elemento.textContent = novoValor;
                    } else {
                        if (elemento.tagName.toLowerCase() === 'input' && elemento.type.toLowerCase() === 'datetime-local') {
                            let dataHora = new Date(novoValor);
                            dataHora.setMinutes(dataHora.getMinutes() - dataHora.getTimezoneOffset());
                            elemento[propriedadeElemento] = dataHora.toISOString().slice(0, 16);
                        } else {
                            elemento[propriedadeElemento] = novoValor;
                        }
                    }
                }
            });
        });
    }

    // Obtém o valor de um objeto com base no caminho especificado
    obterValor(objeto, caminhos) {
        return caminhos.reduce((acc, caminho) => (acc && acc[caminho] !== undefined) ? acc[caminho] : undefined, objeto);
    }

    // Define o valor de um objeto com base no caminho especificado
    definirValor(objeto, caminhos, valor) {
        const ultimoCaminho = caminhos.pop();
        const alvo = caminhos.reduce((acc, caminho) => acc[caminho], objeto);
        if (alvo) alvo[ultimoCaminho] = valor;
    }

    // Chamado quando o elemento é adicionado ao DOM
    connectedCallback() {
        this.inicializarElementos();
    }

    // Inicializa os elementos vinculados
    inicializarElementos() {
        this.noRaiz.querySelectorAll("[data-bind]").forEach(elemento => {
            const funcao = this.gerarFuncaoMudancaConteudo(JSON.parse(elemento.dataset.bind));
            this.#listeners.push({ elemento, funcao });
            elemento.addEventListener("change", funcao);
        });
    }

    // Gera uma função que atualiza os dados quando o conteúdo de um elemento muda
    gerarFuncaoMudancaConteudo(jsonDataBind) {
        return evento => {
            const novosDados = JSON.parse(JSON.stringify(this.#dados));
            Object.entries(jsonDataBind).forEach(([propriedadeElemento, caminhoDados]) => {
                this.definirValor(novosDados, caminhoDados.split("."), evento.target[propriedadeElemento]);
            });
            this.atualizarDados(this.#dados, novosDados);
            this.#dados = novosDados;
        };
    }

    // Remove event listeners quando o elemento é removido do DOM
    disconnectedCallback() {
        this.#listeners.forEach(({ elemento, funcao }) => {
            elemento.removeEventListener("change", funcao);
        });
        this.#listeners = [];
        this.#observer.disconnect(); // Desconecta o MutationObserver
    }
}

// Define o novo elemento personalizado
window.customElements.define('componente-dados-bidirecional', ComponenteConexaoBidirecionalDados);
