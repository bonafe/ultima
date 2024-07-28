


import { ComponenteBase } from './componente_base.js';



export class ComponenteConexaoBidirecionalDados extends ComponenteBase {


    
    #listeners;    
    #dados;


    constructor(propriedades, url_herdeiro) {
        super(propriedades, url_herdeiro);
        
        this.#listeners = [];        
        this.#dados = undefined;  
        
        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, () => {
            this.inicializar_elementos();
        });
    }



    get dados(){
        return this.#dados;
    }



    set dados(novos_dados){
        console.log ("************** setando dataset.dados");
        this.dataset.dados = JSON.stringify(novos_dados);

        console.log ("************** atualizar_dados");
        this.atualizar_dados(novos_dados);
    }   



    static get observedAttributes() {
        return ['data-dados'];
    }



    attributeChangedCallback(nome_atributo, valor_antigo, valor_novo) {
        if (nome_atributo === 'data-dados') {      
            console.log (`************** attributeChangedCallback: ${valor_novo}`);      
            this.atualizar_dados(JSON.parse(valor_novo));
        }
    }


    deve_atualizar(novos_dados) {

        let deve_atualizar = false;

        // Caso houver uma mudança no objeto de dados
        if (this.#dados !== novos_dados){

            // Caso a mudança foi que não tinha dados e passou a ter dados
            if (!this.#dados && novos_dados){
                
                deve_atualizar = true;


            // Como garantimos que novos_dados são diferentes de this.#dados e sabemos que this.#dados é diferente de null
            // então sabemos que novos_sados não são null, i.e., possuem valor, então é seguro chamar o stringfy para ambos
            // Se a comparação literal for diferente, então deve atualizar
            }else if (JSON.stringify(this.#dados).localeCompare(JSON.stringify(novos_dados)) != 0){

                deve_atualizar = true;                
            }
        }

        return deve_atualizar;
    }
    

    // Atualiza os dados dos elementos vinculados
    atualizar_dados(novos_dados) {
       
        // Se os dados atuais forem diferentes dos novos dados, atualizamos os elementos
        if (this.deve_atualizar(novos_dados)) {            
            
            // O mapa de dados consiste no relacionamento entre 
            // um atributo do elemento HTML e um caminho de dados
            const elementos = super.no_raiz.querySelectorAll("[data-mapa]");

            // Para cada um desses elementos iremos verificar se houve mudança de valor
            elementos.forEach(elemento => {

                const mapa_dados = JSON.parse(elemento.dataset.mapa);


                // Cada entrada no nosso mapa de dados consiste em um atributo do elemento e
                // um caminho de dados que leva ao valor que deve ser exibido
                Object.entries(mapa_dados).forEach(([atributo_elemento, caminho_dados]) => {


                    // Caso existem dados atuais, obtemos o valor atual no caminho especificado
                    const valor_atual = this.#dados ? this.obterValor(this.#dados, caminho_dados.split(".")) : null;

                    const novo_valor = this.obterValor(novos_dados, caminho_dados.split("."));


                    //Se o valor atual for diferente do novo valor, atualizamos o elemento
                    if (valor_atual !== novo_valor) {


                        // Para o atributo textContent precisamos chamar explicitamente                    
                        // esta propriedade
                        if (atributo_elemento === "textContent") {

                            elemento.textContent = novo_valor;


                        // Para elementos do tipo input com tipo datetime-local
                        // precisamos converter a data para o formato aceito
                        } else if (elemento.tagName.toLowerCase() === 'input' && elemento.type.toLowerCase() === 'datetime-local') {

                            let data_hora = new Date(novo_valor);

                            data_hora.setMinutes(data_hora.getMinutes() - data_hora.getTimezoneOffset());

                            elemento[atributo_elemento] = data_hora.toISOString().slice(0, 16);


                        //Para outros elementos, podemos simplesmente atualizar o atributo
                        } else {

                            console.log (`************** atualizando elemento: ${atributo_elemento} = ${JSON.stringify(novo_valor)}`);
                            elemento.setAttribute(atributo_elemento, JSON.stringify(novo_valor));
                        }                    
                    }
                });
            });

            this.#dados = novos_dados;
            this.setAttribute('data-dados', JSON.stringify(this.#dados));
        }        
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
    inicializar_elementos() {
        super.no_raiz.querySelectorAll("[data-mapa]").forEach(elemento => {
            const funcao_mudanca_conteudo = this.gerar_funcao_mudanca_conteudo(JSON.parse(elemento.dataset.mapa));
            this.#listeners.push({ elemento, funcao_mudanca_conteudo });
            elemento.addEventListener("change", funcao_mudanca_conteudo);
        });
    }

    

    // Gera uma função que atualiza os dados quando o conteúdo de um elemento muda
    gerar_funcao_mudanca_conteudo(mapa_dados) {
        return evento => {

            //Cria uma cópia dos dados atuais
            const dados_atualizados = JSON.parse(JSON.stringify(this.#dados));

            //Atualizar os dados com o valor que veio do elemento que disparou o evento
            Object.entries(mapa_dados).forEach(([atributo_elemento, caminho_dados]) => {
                this.definirValor(dados_atualizados, caminho_dados.split("."), evento.target[atributo_elemento]);
            });

            //Chama a função que atualiza os elementos pois outros elementos podem usar os mesmos dados
            this.atualizar_dados(dados_atualizados);
        };
    }



    // Remove event listeners quando o elemento é removido do DOM
    disconnectedCallback() {
        this.#listeners.forEach(({ elemento, funcao }) => {
            elemento.removeEventListener("change", funcao);
        });
        this.#listeners = [];        
    }
}



// Define o novo elemento personalizado
window.customElements.define('componente-dados-bidirecional', ComponenteConexaoBidirecionalDados);


