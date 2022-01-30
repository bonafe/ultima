import { BindableHTMLElement } from "./BindableHTMLElement.js";

export class PessoaView extends BindableHTMLElement{

    static _template = undefined;

    static get TEMPLATE(){
        if (PessoaView._template == undefined){
            PessoaView._template = document.createElement ("template");
            PessoaView._template.innerHTML = `
                <input type="text" data-bind="value:nome"></input>
                <input type="text" data-bind="value:pai.nome"></input>
                <input type="text" data-bind="value:pai.pai.nome"></input>
            `;
        }
        return PessoaView._template;
    }

    constructor(){
        super();
        this._shadowRoot.appendChild(PessoaView.TEMPLATE.content.cloneNode(true));
        this.state = {
            nome:"joão",
            pai:{
                nome:"alfredo",
                pai:{
                    nome:"antonio"
                }
            }
        }
        console.log ("terminou construtor");
    }
}

customElements.define('pessoa-view', PessoaView);