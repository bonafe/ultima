export class ComponenteBase extends HTMLElement {

    static EVENTO_CARREGOU = "carregou_componente";

    static LIMITE_TENTATIVAS_CARREGAR_RECURSO = 3; // Tenta no máximo 3 vezes carregar um recurso antes de desistir

    constructor(propriedades, url_herdeiro) {
        super();

        // TODO: Verificar se o objeto propriedades possui as propriedades necessárias
        this.url_herdeiro = url_herdeiro;
        this.url_base = ComponenteBase.extrairCaminhoURL(this.url_herdeiro);

        this._carregado = false;

        if (propriedades.shadowDOM) {
            this.noRaiz = this.attachShadow({ mode: 'open' });
        } else {
            this.noRaiz = this;
        }

        this.carregarTemplate(propriedades.templateURL);
    }

    get noRaiz() {
        return this._noRaiz;
    }

    set noRaiz(noRaiz) {
        this._noRaiz = noRaiz;
    }

    static extrairCaminhoURL(url) {
        return url.slice(0, url.lastIndexOf("/") + 1);
    }

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

        // Corrige os caminhos relativos para tags <img>, <a> e outras
        this.corrigirCaminhosRelativos(elemento);

        Promise.all([
            ...hrefLinks.map(url_css => this.carregarCSS(url_css)),
            ...scripts.map(script => this.carregarScript(script))
        ]).then(resultados => {
            this.noRaiz.appendChild(elemento);
            this.observar();
            this._carregado = true;
            this.dispatchEvent(new Event(ComponenteBase.EVENTO_CARREGOU));
        });
    }

    corrigirCaminhosRelativos(elemento) {
        const tagsParaCorrigir = ['img', 'a'];
        const atributosParaCorrigir = {
            'img': 'src',
            'a': 'href'
        };

        tagsParaCorrigir.forEach(tag => {
            elemento.querySelectorAll(tag).forEach(elementoTag => {
                let atributo = atributosParaCorrigir[tag];
                let valorAtributo = elementoTag.getAttribute(atributo);
                if (valorAtributo) {
                    let urlCorrigida = this.resolverEndereco(valorAtributo);
                    elementoTag.setAttribute(atributo, urlCorrigida);
                }
            });
        });
    }

    removerTagsLinkETrazerHRef(elemento) {
        return Array.from(elemento.querySelectorAll("link")).map(elementoLink => {
            let url_css = elementoLink.getAttribute("href");
            elementoLink.remove();
            return url_css;
        });
    }

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

        let elemento_observado = this.noRaiz.querySelector(".observado");
        if (elemento_observado) {
            this.resizeObserver.observe(elemento_observado);
        }
    }

    connectedCallback() {}

    disconnectedCallback() {}

    adoptedCallback() {}

    carregarCSS(endereco, url_filho, tentativas = 1) {
        let url_css = (url_filho ? ComponenteBase.resolverEndereco(endereco, url_filho) : this.resolverEndereco(endereco));

        if (tentativas == undefined) {
            tentativas = 0;
        }
        tentativas++;

        return new Promise((resolve, reject) => {
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

    carregarScript(atributos_script, url_filho) {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.setAttribute("async", "");
            script.src = (url_filho ? ComponenteBase.resolverEndereco(atributos_script.src, url_filho) : this.resolverEndereco(atributos_script.src));

            if (atributos_script.type) {
                script.setAttribute("type", atributos_script.type);
            }

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

    get carregado(){
        return this._carregado;
    }
}
