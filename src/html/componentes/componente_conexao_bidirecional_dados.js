


import { ComponenteBase } from './componente_base.js';



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


        // Definição do atributo e propriedade de dados
        // Como estamos gerando dinamicamente a propriedade/atributo de dados, 
        // precisamos gerar o getter e setter (propriedade) e observer a mudança do atributo (atributo)
        this.definirAtributoDados();    
        
        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, () => {
            this.inicializarElementos();
        });
    }



    definirAtributoDados() {

        // Define o getter e setter dinamicamente
        Object.defineProperty(this, this.#nome_atributo, {
            get: () => this.#dados,
            set: (novosDados) => {
                //TODO: Será que precisa de um setTimeout?                
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

                    const dadosAtuais = JSON.parse(mutation.oldValue);

                    const novosDados = JSON.parse(this.getAttribute(this.#nome_atributo));

                    this.#dados = novosDados;


                    this.atualizarDados(dadosAtuais, novosDados);
                }
            }
        });

        // Configura o MutationObserver para observar somente mudanças de atributos
        const config = { attributes: true, attributeOldValue: true };
        this.#observer.observe(this, config);
    }



    // Realiza a atualização inicial dos dados
    atualizacaoInicial() {
        this.atualizarDados(null, this.#dados);
    }



    // Atualiza os dados dos elementos vinculados
    atualizarDados(dadosAtuais, novosDados) {

        console.log (`Atualizando dados: ${JSON.stringify(novosDados)}`);

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
        //..
    }



    // Inicializa os elementos vinculados
    inicializarElementos() {
        this.noRaiz.querySelectorAll("[data-bind]").forEach(elemento => {
            const funcaoMudancaConteudo = this.gerarFuncaoMudancaConteudo(JSON.parse(elemento.dataset.bind));
            this.#listeners.push({ elemento, funcaoMudancaConteudo });
            elemento.addEventListener("change", funcaoMudancaConteudo);
        });
    }

    

    // Gera uma função que atualiza os dados quando o conteúdo de um elemento muda
    gerarFuncaoMudancaConteudo(jsonDataBind) {
        return evento => {

            //Cria uma cópia dos dados atuais
            const dadosAtualizados = JSON.parse(JSON.stringify(this.#dados));

            //Atualizar os dados com o valor que veio do elemento que disparou o evento
            Object.entries(jsonDataBind).forEach(([propriedadeElemento, caminhoDados]) => {
                this.definirValor(dadosAtualizados, caminhoDados.split("."), evento.target[propriedadeElemento]);
            });

            //Chama a função que atualiza os elementos pois outros elementos podem usar os mesmos dados
            this.atualizarDados(this.#dados, dadosAtualizados);

            //Atualiza os dados do componente
            this.#dados = dadosAtualizados;

            //Atualiza o atributo do componente
            this.setAttribute(this.#nome_atributo, JSON.stringify(dadosAtualizados));
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


