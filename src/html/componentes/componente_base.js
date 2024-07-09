export class ComponenteBase extends HTMLElement {

    static EVENTO_CARREGOU = "carregou_componente_base";

    static LIMITE_TENTATIVAS_CARREGAR_RECURSO = 3; // Tenta no máximo 3 vezes carregar um recurso antes de desistir

    /**
     * Ao construir um ComponenteBase, é necessário passar um objeto com as propriedades do componente e a URL da classe javascript que o herda
     * 
     * @param {Object} propriedades - Propriedades do componente
     * @param {string} propriedades.templateURL - URL do template HTML do componente
     * @param {boolean} propriedades.shadowDOM - true para usar shadowDOM, false para usar DOM padrão
     * @param {string} url_herdeiro - URL do componente JavaScript que herda ComponenteBase (normalmente possui o valor de import.meta.url)
     */
    constructor(propriedades, url_herdeiro) {
        super();

        // TODO: Verificar se o objeto propriedades possui as propriedades necessárias
        this.url_herdeiro = url_herdeiro;
        this.url_base = ComponenteBase.extrairCaminhoURL(this.url_herdeiro);

        this._carregado = false;

        // Se o componente usa shadowDOM, cria um shadowRoot, senão usa o próprio elemento
        if (propriedades.shadowDOM) {
            this.noRaiz = this.attachShadow({ mode: 'open' });
        } else {
            this.noRaiz = this;
        }

        this.carregarTemplate(propriedades.templateURL);
    }

    // Getter para noRaiz
    get noRaiz() {
        return this._noRaiz;
    }

    // Setter para noRaiz
    set noRaiz(noRaiz) {
        this._noRaiz = noRaiz;
    }

    /**
     * Extrai o caminho base de uma URL
     * @param {string} url - URL completa
     * @returns {string} Caminho base da URL
     */
    static extrairCaminhoURL(url) {
        // TODO: usar tag A com href para fazer parse no endereço e extrair o caminho
        return url.slice(0, url.lastIndexOf("/") + 1);
    }

    /**
     * Resolve um endereço relativo ou absoluto
     * @param {string} endereco - Endereço a ser resolvido
     * @param {string} url_base - URL base para resolver endereços relativos
     * @returns {URL} URL resolvida
     */
    static resolverEndereco(endereco, url_base) {
        try {
            return new URL(endereco);
        } catch (e) {
            return new URL(endereco, url_base);
        }
    }

    resolverEndereco(endereco) {
        return ComponenteBase.resolverEndereco(endereco, this.url_base);
    }

    /**
     * Carrega o template HTML do componente
     * @param {string} url_template - URL do template HTML
     * @param {number} [tentativas=1] - Número de tentativas de carregamento
     */
    async carregarTemplate(url_template, tentativas = 1) {
        if (tentativas == undefined) {
            tentativas = 0;
        }        

        tentativas++;
        if (tentativas > ComponenteBase.LIMITE_TENTATIVAS_CARREGAR_RECURSO) {
            console.error(`Erro ao carregar template: ${url_template} NÚMERO DE TENTATIVAS EXCEDIDO (${tentativas})`);
            return false;
        }

        let resposta = await fetch(this.resolverEndereco(url_template));
        let textoPagina = await resposta.text();

        let template = document.createElement("template");
        template.innerHTML = textoPagina;

        let elemento = template.content.cloneNode(true);

        let hrefLinks = this.removerTagsLinkETrazerHRef(elemento);
        let scripts = this.removerERecuperarElementosScript(elemento);

        // Carrega todos os CSS e Scripts do template
        Promise.all([
            ...hrefLinks.map(url_css => this.carregarCSS(url_css)),
            ...scripts.map(script => this.carregarScript(script))
        ]).then(resultados => {
            // Depois de carregar todos os CSS;
            this.noRaiz.appendChild(elemento);
            this.observar();
            this._carregado = true;
            this.dispatchEvent(new Event(ComponenteBase.EVENTO_CARREGOU));
        });
    }

    /**
     * Remove as tags <link> do template e retorna seus hrefs
     * @param {DocumentFragment} elemento - Template carregado
     * @returns {string[]} Lista de URLs dos arquivos CSS
     */
    removerTagsLinkETrazerHRef(elemento) {
        return Array.from(elemento.querySelectorAll("link")).map(elementoLink => {
            let url_css = elementoLink.getAttribute("href");
            elementoLink.remove();
            return url_css;
        });
    }

    /**
     * Remove as tags <script> do template e retorna seus atributos
     * @param {DocumentFragment} elemento - Template carregado
     * @returns {Object[]} Lista de atributos dos elementos script
     */
    removerERecuperarElementosScript(elemento) {
        return Array.from(elemento.querySelectorAll("script")).map(elementoScript => {
            let atributos_script = {
                src: elementoScript.getAttribute("src"),
                type: elementoScript.getAttribute("type"),
                integrity: elementoScript.getAttribute("integrity"),
            };
            elementoScript.remove();
            return atributos_script;
        });
    }

    observar() {
        this.resizeObserver = new ResizeObserver(elementos => {
            elementos.forEach(elemento => {
                if (this.processarNovasDimensoes) {
                    this.processarNovasDimensoes(elemento.target.clientWidth, elemento.target.clientHeight);
                }
            });
        });

        // Irá observar o primeiro elemento da classe observado
        let elemento_observado = this.noRaiz.querySelector(".observado");
        if (elemento_observado) {
            this.resizeObserver.observe(elemento_observado);
        }
    }

    connectedCallback() {}

    disconnectedCallback() {}

    adoptedCallback() {}

    /**
     * Carrega um arquivo CSS e insere no componente
     * @param {string} endereco - Endereço do arquivo CSS
     * @param {string} [url_filho] - URL base alternativa
     * @param {number} [tentativas=1] - Número de tentativas de carregamento
     * @returns {Promise} Promise resolvida quando o CSS for carregado
     */
    carregarCSS(endereco, url_filho, tentativas = 1) {
        let url_css = (url_filho ? ComponenteBase.resolverEndereco(endereco, url_filho) : this.resolverEndereco(endereco));

        if (tentativas == undefined) {
            tentativas = 0;
        }
        tentativas++;

        return new Promise((resolve, reject) => {
            // TODO: AVANÇAR NO TRATAMENTO DE ERRO. O que acontece quando o recurso está indisponível?
            if (tentativas > ComponenteBase.LIMITE_TENTATIVAS_CARREGAR_RECURSO) {
                console.log(`Erro ao carregar CSS: ${url_css} NÚMERO DE TENTATIVAS EXCEDIDO (${tentativas})`);
                return reject();
            }

            fetch(url_css)
                .then(response => response.text())
                .then(texto => {
                    let style = document.createElement('style');
                    style.innerHTML = texto;

                    style.addEventListener("load", () => {
                        resolve(true);
                    });

                    style.addEventListener("error", (e) => {
                        reject();
                    });
                    this.noRaiz.appendChild(style);
                })
                .catch(function (error) {
                    console.log(`Não foi possível fazer download do CSS ${url_css}`);
                    reject();
                });
        });
    }

    /**
     * Carrega um arquivo de script e insere no componente
     * @param {Object} atributos_script - Atributos do script
     * @param {string} [url_filho] - URL base alternativa
     * @returns {Promise} Promise resolvida quando o script for carregado
     */
    carregarScript(atributos_script, url_filho) {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.setAttribute("async", "");
            script.src = (url_filho ? ComponenteBase.resolverEndereco(atributos_script.src, url_filho) : this.resolverEndereco(atributos_script.src));

            if (atributos_script.type) {
                script.setAttribute("type", atributos_script.type);
            }

            // TODO: VERIFICAR não está funcionando eu acho, não está sendo usado ainda
            if (atributos_script.hash_integridade) {
                script.integrity = atributos_script.hash_integridade;
                script.crossorigin = "anonymous";
            }

            script.addEventListener("load", () => {
                resolve(true);
            });

            script.addEventListener("error", (e) => {
                console.log(`Erro ao carregar script: ${script.src}`);
                console.dir(e);
                reject();
            });

            this.noRaiz.appendChild(script);
        });
    }

    // Getter para carregado
    get carregado(){
        return this._carregado;
    }
}