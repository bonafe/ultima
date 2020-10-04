export class BindableHTMLElement extends HTMLElement{

    constructor(){
        super();
        this._state = undefined;
        this._shadowRoot = this.attachShadow({mode: 'open'});
    }

    set state(newState){
        this._state = newState;
        let elementos = this._shadowRoot.querySelectorAll("[data-bind]");
        elementos.forEach (elemento =>{
            let configuracao = elemento.dataset.bind.split(":")
            let propriedadeElemento = configuracao[0];
            let caminhoEstado = configuracao[1];
            console.log(`${propriedadeElemento} --- ${this._state}:${caminhoEstado}`)
            elemento[propriedadeElemento] = this.trazerValor(this._state, caminhoEstado.split("."));
        });
    }

    get state (){
        return this._state;
    }

    trazerValor (objeto, caminhos){
        let caminhoDesteNivel = caminhos.shift();
        if (caminhos.length > 0){
            return this.trazerValor (objeto[caminhoDesteNivel], caminhos);
        }else{
            return objeto[caminhoDesteNivel];
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
        console.log ("adicionado");
        let elementos = this._shadowRoot.querySelectorAll("[data-bind]");
        elementos.forEach (elemento =>{
            elemento.addEventListener("change",(event)=>{
                let configuracao = elemento.dataset.bind.split(":")
                let propriedadeElemento = configuracao[0];
                let caminhoEstado = configuracao[1];
                console.log(`${event.target.value}`);
                this.definirValor(this._state, caminhoEstado.split("."), event.target[propriedadeElemento]);
            });
        });
    }

    disconnectedCallback(){
        console.log ("removido");
    }
}