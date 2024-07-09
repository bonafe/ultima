

export class BindableHTMLElement extends HTMLElement{



    constructor(template){
        super();

		this.carregado = false;

		//Guardando modificadores para conseguir limpar
		this.mascaras = [];
		this.listeners = [];
		
        this._state = undefined;
        this._shadowRoot = this.attachShadow({mode: 'open'});

		this.template = template;	
		if (this.template){
			this.carregarTemplate();
		}

        let script = document.createElement("script");
        script.src = "/bibliotecas/imask/imask.js";

        this._shadowRoot.appendChild(script);
    }


    get shadowRoot(){
        return this._shadowRoot;
    }

	
	async carregarTemplate(){

		//TODO: testar
		//Se um elemento template foi passado no construtor
		if (this.template instanceof HTMLElement){
			
			this.shadowRoot.appendChild(template.content.cloneNode(true));			
			this.carregouComponente();		
			
			
			
		//Caso o elemento seja do tipo String	
		}else if (((typeof this.template).localeCompare("string") ==0) || (this.template instanceof String)) {				
		
			//Carrega via o conteúdo via Fetch
			let resposta = await fetch(this.template);
			let textoPagina = await resposta.text();
						
			let template = document.createElement('template');
			template.innerHTML = textoPagina;
			this.shadowRoot.appendChild(template.content.cloneNode(true));
			
			this.carregouComponente();							
		}
	}



	carregouComponente(){
		this.inicializarElementos();					
        this.atualizacaoInicial();
		this.carregado = true;
		this.dispatchEvent(new Event(ComponenteBase.EVENTO_CARREGOU));	
	}



    set state(newState){
        //A função setTimeout irá garantir que o estado apenas será atribuido quando todos componentes tiverem sido criados
        setTimeout(() => {
            this.atualizarEstado(this._state, newState);
            this._state = newState;
        });
    }



    get state (){
        return this._state;
    }



    atualizacaoInicial(){
        this.atualizarEstado(null, this._state)
    }


    atualizarEstado(estadoAtual, novoEstado){

        let elementos = this._shadowRoot.querySelectorAll("[data-bind]");
        elementos.forEach (elemento =>{


            let jsonDataBind = JSON.parse(elemento.dataset.bind);

            Object.entries(jsonDataBind).forEach (bindInfo => {

                const [propriedadeElemento, caminhoEstado] = bindInfo;

                let valorAtual = (estadoAtual == null? null: this.trazerValor(estadoAtual, caminhoEstado.split(".")));
                let novoValor = this.trazerValor(novoEstado, caminhoEstado.split("."));

                if (valorAtual != novoValor){

                    //textContent precisa ser acessado diretamente
                    if (propriedadeElemento.localeCompare("textContent") == 0){

                        elemento.textContent = novoValor;

                    //Outras propriedades podem ser utilizadas como chave
                    }else{
	
						
						if((elemento.tagName.toLowerCase() === 'input') &&
						   (elemento.type.toLowerCase() === 'datetime-local')){
							
							console.debug(`[BindableHTMLElement] Elemento data hora ENTRADA: ${novoValor}`);
							
							let dataHora = new Date(novoValor);							
							//Leva a data/hora para o timezone do usuário para exibi-la no input
							dataHora.setMinutes(dataHora.getMinutes() - dataHora.getTimezoneOffset());
							//O input do tipo datetime-local precisa receber 16 caracteres
							novoValor = dataHora.toISOString().slice(0, 16);					
							
							console.debug(`[BindableHTMLElement] Elemento data hora SAÍDA: ${novoValor}`);
						}
						
                        elemento[propriedadeElemento] = novoValor;
                    }
                }
            });
        });
    }



    trazerValor (objeto, caminhos){
        if (objeto === undefined){
            return undefined;
        }else{
            let caminhoDesteNivel = caminhos.shift();
            if (caminhos.length > 0){
                return this.trazerValor (objeto[caminhoDesteNivel], caminhos);
            }else{
                if (objeto !== null){
                    return objeto[caminhoDesteNivel];
                }else{
                    return null
                }
            }
        }
    }



    definirValor (objeto, caminhos, valor){
        let caminhoDesteNivel = caminhos.shift();
        if (caminhos.length > 0){
            this.definirValor (objeto[caminhoDesteNivel], caminhos, valor);
        }else{
            objeto[caminhoDesteNivel] = valor;
        }
    }



    connectedCallback(){
    	
        this.inicializarElementos();
    }

	inicializarElementos(){
	
		//Limpa as máscaras
		while (this.mascaras.length){		
			this.mascaras.pop().destroy();
		}
	
		//Processa a máscara
        this._shadowRoot.querySelectorAll("[data-mask]").forEach (elemento =>{

            //A mascara vem como JSON mas o IMask precisa que os valores Number (TODO: verificar outros casos) sejam transformados no tipo nativo
            let mascara = JSON.parse(elemento.dataset.mask);
            this.transformarMascara(mascara);
            this.mascaras.push(IMask (elemento, mascara));
        });


		//Limpa os listeners caso existam
		while (this.listeners.length){
			let listener = this.listeners.pop();
			listener.elemento.removeEventListener(listener.evento, listener.funcao);
		}

        //Processa o data bind
        this._shadowRoot.querySelectorAll("[data-bind]").forEach (elemento =>{
			
			//TODO: escutando apenas change
			let listener = {
				elemento: elemento,
				evento: "change",
				funcao: this.gerarFuncaoMudouConteudo(JSON.parse(elemento.dataset.bind))
			};
			this.listeners.push(listener)
            
            elemento.addEventListener(listener.evento, listener.funcao);
        });
	}

	gerarFuncaoMudouConteudo (jsonDataBind){
		return event => {		

		    Object.entries(jsonDataBind).forEach (bindInfo => {
		
		        const [propriedadeElemento, caminhoEstado] = bindInfo;
		
		        //Clona o estado atual
		        let novoEstado = JSON.parse(JSON.stringify(this._state));
		
		        this.definirValor(novoEstado, caminhoEstado.split("."), event.target[propriedadeElemento]);
		
		        //O change de um elemento pode repercurtir em outros
		        this.atualizarEstado(this._state, novoEstado);
		
		        this._state = novoEstado;
		    });
		};
	}

    transformarMascara(mascara){
        Object.keys(mascara).forEach (chave => {

            if (typeof mascara[chave] == "object"){

                this.transformarMascara(mascara[chave]);

            }else if (typeof mascara[chave] == "string"){

                if (mascara[chave].localeCompare("Number") == 0){
                    mascara[chave] = Number;
                }
            }
        });
    }


    disconnectedCallback(){
    }
}

window.customElements.define('bindable-html-element', BindableHTMLElement);