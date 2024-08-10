import { ComponenteBase } from './componente_base.js';

class Nodo {
    constructor(elemento) {
        this.elemento = elemento;
        this.filhos = [];
    }

    adicionarFilho(filho) {
        this.filhos.push(filho);
    }
}

export class ComponenteReativo extends ComponenteBase {

    #listeners;    
    #dados;

    constructor(propriedades, url_herdeiro) {
        super(propriedades, url_herdeiro);
        
        this.#listeners = [];        
        this.#dados = undefined;  
        
        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, () => {
            this.renderizar();
        });
    }

    get dados() {
        return this.#dados;
    }

    set dados(novos_dados) {
        this.dataset.dados = JSON.stringify(novos_dados);       
        console.log(`______________________________________________________________________________________________________________`);
        console.log(`!!!!!!!`);
        console.log(`     [${this.constructor.name}]    ************** Javscript Set dados`);               
        this.atualizar_dados(novos_dados);
    }   

    static get observedAttributes() {
        return ['data-dados'];
    }

    attributeChangedCallback(nome_atributo, valor_antigo, valor_novo) {

        if (nome_atributo === 'data-dados') {                      

            console.log(`______________________________________________________________________________________________________________`);
            console.log(`!!!!!!!`);
            console.log(`     [${this.constructor.name}]    ************** Modificação do atributo HTML dados`); 
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
    
    atualizar_dados(novos_dados) {
        /*
        console.log(`     [${this.constructor.name}]    !!!!!!!`);
        console.log(`     [${this.constructor.name}]    !!!!!!!`);
        console.log(`     [${this.constructor.name}]    !!!!!!!`);
        console.log(`     [${this.constructor.name}]    !!!!!!!`);
        console.log(`     [${this.constructor.name}]    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! atualizando dados`);
        */
        if (!this.deve_atualizar(novos_dados)) {            

            //console.log(`     [${this.constructor.name}]    ************************ !!! NÃO HÁ ALTERAÇÃO !!!         ${JSON.stringify(novos_dados)}`)

        }else{

            //console.log(`     [${this.constructor.name}]    ************************  NOVOS DADOS:         ${JSON.stringify(novos_dados)}`);   

            const elementos = super.no_raiz.querySelectorAll("[data-mapa]");

            elementos.forEach(elemento => {


                const mapa_dados = JSON.parse(elemento.dataset.mapa);


                Object.entries(mapa_dados).forEach(([atributo_elemento, caminho_dados]) => {


                    const valor_atual = this.#dados ? this.obter_valor(this.#dados, caminho_dados.split(".")) : null;

                    const novo_valor = this.obter_valor(novos_dados, caminho_dados.split("."));


                    if (valor_atual !== novo_valor) {

                        if (atributo_elemento === "textContent" && elemento.textContent !== novo_valor) {
                            elemento.textContent = novo_valor;
                    
                        } else if (elemento.tagName.toLowerCase() === 'input' && elemento.type.toLowerCase() === 'datetime-local') {
                            let data_hora = new Date(novo_valor);
                            data_hora.setMinutes(data_hora.getMinutes() - data_hora.getTimezoneOffset());
                            let novo_valor_formatado = data_hora.toISOString().slice(0, 16);
                            
                            if (elemento.value !== novo_valor_formatado) {
                                elemento[atributo_elemento] = novo_valor_formatado;
                            }
                    
                        } else if (atributo_elemento === "value" && elemento.value !== novo_valor) {
                            elemento.value = novo_valor;
                    
                        } else if (elemento.getAttribute(atributo_elemento) !== String(novo_valor)) {
                            let valor_em_string = (typeof novo_valor === 'object') ? JSON.stringify(novo_valor) : novo_valor;
                            //console.log(`     [${this.constructor.name}]    ************** atualizando elemento ( ${elemento.id} ): ${atributo_elemento} = ${valor_em_string} [${typeof novo_valor}]`);
                            elemento.setAttribute(atributo_elemento, valor_em_string);
                        }
                    }
                        
                });
            });

            this.#dados = novos_dados;
            //console.log(`     [${this.constructor.name}]    ************************  Atualizando atributo HTML dados`);
            this.setAttribute('data-dados', JSON.stringify(this.#dados));
        }        
    }

    obter_valor(objeto, caminhos) {        
        return caminhos.reduce((acc, caminho) => (acc && acc[caminho] !== undefined) ? acc[caminho] : undefined, objeto);
    }

    atualizar_valor(objeto, caminhos, valor) {
        const ultimoCaminho = caminhos.pop();
        const alvo = caminhos.reduce((acc, caminho) => acc[caminho], objeto);
        if (alvo) alvo[ultimoCaminho] = valor;
    }

    connectedCallback() {
        // Pode ser usado para inicializar algo quando o componente é adicionado ao DOM
    }

    renderizar() {
        
        //this.processar_renderizacao_condicional();
        //this.processar_renderizacao_listas();
        this.escutar_mudanca_conteudo();                      
    }



    escutar_mudanca_conteudo() {

        console.log(`______________________________________________________________________________________________________________`);
        console.log ("                                 [ComponenteReativo] escutar_mudanca_conteudo                                ");
        console.log(`______________________________________________________________________________________________________________`);

        // Remove todos os listeners anteriores
        this.#listeners.forEach(({ elemento, funcao_mudanca_conteudo }) => {
            elemento.removeEventListener("change", funcao_mudanca_conteudo);
        });

        // Limpa o array de listeners
        this.#listeners = [];

        // Processa todos os data-mapa
        super.no_raiz.querySelectorAll("[data-mapa]").forEach(elemento => {
            
            // Garante que esse data-mapa não está dentro de um template
            if (elemento.closest('template') === null) {

                const funcao_mudanca_conteudo = this.gerar_funcao_mudanca_conteudo(JSON.parse(elemento.dataset.mapa));
                this.#listeners.push({ elemento, funcao_mudanca_conteudo });
                elemento.addEventListener("change", funcao_mudanca_conteudo);
            }
        });  
    }



    processar_renderizacao_listas() {
        super.no_raiz.querySelectorAll("[data-lista]").forEach(elemento => {            

            setTimeout(() => {
                const expressao = elemento.dataset.paraCada;
                const [variavel, caminhoLista] = expressao.split(" em ");
                const lista = this.obter_valor(this.#dados, caminhoLista.split("."));
                
                if (Array.isArray(lista)) {
                    const container = document.createDocumentFragment();

                    lista.forEach(item => {
                        const clone = elemento.cloneNode(true);

                        // Adiciona os dados do item ao clone
                        clone.dataset.mapa = JSON.stringify({ ...JSON.parse(clone.dataset.mapa || '{}'), [variavel]: item });

                        container.appendChild(clone);
                    });

                    elemento.replaceWith(container);
                } else {
                    elemento.remove();
                }
            }, 1000);
        });
    }

    

    // Implementação da renderização condicional baseada nos atributos data-se, data-senao-se e data-senao
    processarCondicional() {

        const elementos = super.no_raiz.querySelectorAll("template[data-se]");


        super.no_raiz.querySelectorAll("template[data-se]").forEach(template_elemento => {

            const expressao = template_elemento.dataset.se;

            const valor = this.obter_valor(this.#dados, expressao.split("."));

            console.log (`${expressao} = ${valor} (${this.#dados === undefined})`);

            if (valor) {
                const clone = template_elemento.content.cloneNode(true);

                //Insere o clone logo em seguida do template
                template_elemento.after(clone);
            }
        });
    }

    // Verifica se há elementos anteriores com o atributo especificado
    temAnteriores(elemento, atributo) {
        let anterior = elemento.previousElementSibling;
        while (anterior) {
            if (anterior.hasAttribute(atributo)) {
                return true;
            }
            anterior = anterior.previousElementSibling;
        }
        return false;
    }

    // Remove elementos anteriores com o atributo especificado
    removerAnteriores(elemento, atributo) {
        let anterior = elemento.previousElementSibling;
        while (anterior) {
            if (anterior.hasAttribute(atributo)) {
                anterior.remove();
            }
            anterior = anterior.previousElementSibling;
        }
    }

    gerar_funcao_mudanca_conteudo(mapa_dados) {
        return evento => {
                        
            const elemento = evento.target;

         
            const dados_atualizados = JSON.parse(JSON.stringify(this.#dados));

            
            // Percorre o mapa de dados buscando os atributos e o caminho correspondente no modelo de dados
            Object.entries(mapa_dados).forEach(([atributo_elemento, caminho_dados]) => {  

                // Atualiza o modelo de dados com o valor do atributo do elemento que disparou o evento              
                this.atualizar_valor(dados_atualizados, caminho_dados.split("."), elemento[atributo_elemento]);
            });

            console.log(`______________________________________________________________________________________________________________`);
            console.log(`!!!!!!!`);
            console.log(`     [${this.constructor.name}]    ************** mudança de conteúdo: ${elemento.tagName} - ${elemento.id}`);              
            this.atualizar_dados(dados_atualizados);
        };
    }

    disconnectedCallback() {
        this.#listeners.forEach(({ elemento, funcao }) => {
            elemento.removeEventListener("change", funcao);
        });
        this.#listeners = [];        
    }
}

window.customElements.define('componente-reativo', ComponenteReativo);