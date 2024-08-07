import { ComponenteBase } from '../componente_base.js';
import { Evento } from '../espaco/evento.js';



export class ExibidorDispositivo extends ComponenteBase {



    constructor(){
        super({templateURL:"./exibidor_dispositivo.html", shadowDOM:true}, import.meta.url);

        this.video = undefined;        

        this.addEventListener(ComponenteBase.EVENTO_CARREGOU, () => {            
        
            this.descricao = super.no_raiz.querySelector("#descricao");

            this.descricao.addEventListener("change", ()=>{
                this.mudouEstado();                
            });


            super.no_raiz.querySelector("#exibir").addEventListener("click", ()=>{
                this.dispatchEvent(new Evento(Evento.EVENTO_SELECAO_OBJETO, 
                    {
                        deviceId:this.dados.dadosMediaAPI.deviceId, 
                        kind:this.dados.dadosMediaAPI.kind
                    })
                );
            });

            this.renderizar();
        });
    }


    get dados(){
        return this._dados;
    }

    set dados (novoValor){
        this._dados = novoValor;
        this.renderizar();
    }

    mudouEstado(){
        this._dados.descricao = this.descricao.value;             
        this.dispatchEvent(new CustomEvent("change", {detail:this._dados, 'bubbles': true, 'composed':true}));
    }


    static get observedAttributes() {
        return ['dados'];
    }



    attributeChangedCallback(nomeAtributo, valorAntigo, novoValor) {

    
        if (nomeAtributo.localeCompare("dados") == 0){

            this._dados = JSON.parse(novoValor);         
            this.renderizar();
        }
    }



    renderizar(){
        
        if (super.carregado){
            this.atualizarCampos();
        }        
    }

    atualizarCampos(){

        super.no_raiz.querySelector("#descricao").value = this._dados.descricao;
        super.no_raiz.querySelector("#kind").textContent = this._dados.dadosMediaAPI.kind;
        super.no_raiz.querySelector("#deviceId").textContent = this._dados.dadosMediaAPI.deviceId;
        super.no_raiz.querySelector("#groupId").textContent =  this._dados.dadosMediaAPI.groupId;
        super.no_raiz.querySelector("#label").textContent =  this._dados.dadosMediaAPI.label;

    }
}
customElements.define('exibidor-dispositivo', ExibidorDispositivo);